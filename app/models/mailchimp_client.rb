require 'mailchimp'

class MailchimpClient < ActiveRecord::Base
  belongs_to :affiliate

  attr_accessible :affiliate_id, :api_key, :members_list_id, :daily_digest_list_id, :weekly_digest_list_id,
                  :author_contributor_list_id, :editor_administrator_list_id

  # NOTE: affiliate_id can be nil, if these are the Mailchimp settings for the global Energyfolks mailing list.

  # no two affiliates can have the same mailchimp api_key
  validates :api_key, :uniqueness => {message: "This API key is already being used by another EnergyFolks affiliate. Please check your API key or notify an administrator."}

  # for each affiliate, the members list ID has to be different from the daily digest list ID, and so on
  validate :each_list_different

  def each_list_different
    errors.add(:members_list_id, "must not be same as the daily digest list") if present_and_equal(self.members_list_id, self.daily_digest_list_id)
    errors.add(:members_list_id, "must not be same as the weekly digest list") if present_and_equal(self.members_list_id, self.weekly_digest_list_id)
    errors.add(:members_list_id, "must not be same as the author contributor list") if present_and_equal(self.members_list_id, self.author_contributor_list_id)
    errors.add(:members_list_id, "must not be same as the editor administrator list") if present_and_equal(self.members_list_id, self.editor_administrator_list_id)

    errors.add(:daily_digest_list_id, "must not be same as the weekly digest list") if present_and_equal(self.daily_digest_list_id, self.weekly_digest_list_id)
    errors.add(:daily_digest_list_id, "must not be same as the author contributor list") if present_and_equal(self.daily_digest_list_id, self.author_contributor_list_id)
    errors.add(:daily_digest_list_id, "must not be same as the editor administrator list") if present_and_equal(self.daily_digest_list_id, self.editor_administrator_list_id)

    errors.add(:weekly_digest_list_id, "must not be same as the author contributor list") if present_and_equal(self.weekly_digest_list_id, self.author_contributor_list_id)
    errors.add(:weekly_digest_list_id, "must not be same as the editor administrator list") if present_and_equal(self.weekly_digest_list_id, self.editor_administrator_list_id)

    errors.add(:author_contributor_list_id, "must not be same as the editor administrator list") if present_and_equal(self.author_contributor_list_id, self.editor_administrator_list_id)
  end

  def initialize
    super
    get_client
  end

  def get_list_names
    l = get_lists
    l.map { |list| [list["name"], list["id"]] } if l.present?
  end

  def get_lists
    begin
      get_client

      if @mailchimp_api.present?
        @mailchimp_api.lists.list["data"]
      end

    rescue Exception => exception
      self.errors[:base] << "Unable to get list information from Mailchimp. Please check your Mailchimp API key entered below or try again later."
      #Note: exception message appears not to be helpful, so don't include. Exception details: #{exception.message}"
      return nil
    end
  end

  def sync_user(user)
    # call this for each affiliate
    # to sync the email settings for one particular user & affiliate in mailchimp with the email settings in the Energyfolks database.

    return unless api_key.present? && Rails.env.production?

    lists_in_mailchimp = get_lists_for_this_user(user.email)
    lists_in_energyfolks = []

    m = user.memberships.approved.where(affiliate_id: self.affiliate).first
    if m.present?
      lists_in_energyfolks << self.members_list_id if self.members_list_id.present? && (user.subscription.announcement? || (m.admin_level >= Membership::EDITOR))
      lists_in_energyfolks << self.daily_digest_list_id if self.daily_digest_list_id.present? && (user.subscription.daily? || (m.admin_level >= Membership::EDITOR))
      lists_in_energyfolks << self.weekly_digest_list_id if self.weekly_digest_list_id.present? && (user.subscription.weekly? || (m.admin_level >= Membership::EDITOR))
      lists_in_energyfolks << self.author_contributor_list_id if self.author_contributor_list_id.present? && (m.admin_level >= Membership::AUTHOR)
      lists_in_energyfolks << self.editor_administrator_list_id if self.editor_administrator_list_id.present? && (m.admin_level >= Membership::EDITOR)
    end

    (lists_in_energyfolks - lists_in_mailchimp).each { |list_id_to_add| batch_add(list_id_to_add, user.email.downcase) }
    (lists_in_mailchimp - lists_in_energyfolks).each { |list_id_to_remove| batch_add(list_id_to_remove, user.email.downcase,true) }

    batch_execute
  end

  def sync_lists
    return unless api_key.present? #&& Rails.env.production?

    # This will sync this affiliate's Mailchimp email lists with their user database.
    get_client

    sync_list(self.members_list_id, :members_list) if self.members_list_id.present?

    sync_list(self.daily_digest_list_id, :daily_digest_list) if self.daily_digest_list_id.present?

    sync_list(self.weekly_digest_list_id, :weekly_digest_list) if self.weekly_digest_list_id.present?

    sync_list(self.author_contributor_list_id, :author_contributor_list) if self.author_contributor_list_id.present?

    sync_list(self.editor_administrator_list_id, :editor_administrator_list) if self.editor_administrator_list_id.present?

    batch_execute
  end

  private
  def present_and_equal(list1, list2)
    return true if list1.present? && list2.present? && list1 == list2
  end

  def get_client
    @mailchimp_api = nil #reset object

    if self.api_key.present?
      #api_key is a string the mailchimp list admin can find in the list settings. Example:  'b4d5cf71998106c7b8cf0f860549d348-us3'
      @mailchimp_api = Mailchimp::API.new(self.api_key)
    end

  end

  def get_list_member_emails(list_id)
    get_members(list_id, :subscribed).map { |m| m['email'] }
  end

  def get_list_unsubscribed_emails(list_id)
    get_members(list_id, :unsubscribed).map { |m| m['email'] }
  end

  def get_lists_for_this_user(email)
    e = email.downcase
    list_memberships = []

    get_list_names.each do |l|
      #pull out the list id in element l[1], don't need the list name in element 0.
      list_memberships << l[1] if get_list_member_emails(l[1]).include?(e)
    end

    return list_memberships
  end

  def sync_list(list_id, list_type)

    handle_unsubscribes(list_id,list_type)

    emails_list_should_contain = get_users(list_type).map{ |u| u.email.downcase }
    current_members = get_list_member_emails(list_id)

    # Add in new members
    (emails_list_should_contain - current_members).each {|email| batch_add(list_id, email) }

    # Remove members that have left
    (current_members - emails_list_should_contain).each {|email| batch_add(list_id, email, true) }
  end

  def handle_unsubscribes(list_id, list_type)
    # check for users that have unsubscribed via Mailchimp
    # if they have, alter their subscription preferences in EnergyFolks accordingly.
    unsubscribed_emails = get_list_unsubscribed_emails(list_id)

    unsubscribed_emails.each do |email|
      #get the EnergyFolks user with this email address, making sure to downcase all emails before comparing
      u = get_users(list_type).map { |u| u if u.email.downcase == email.downcase }.reject {|u| u.nil? }.first
      handle_unsubscribe(u, list_type) if u.present?
      batch_add(list_id,email,true) #delete this user from the Mailchimp list. We've already registered that they wanted to unsubscribe from this list.
    end
  end

  def get_users(list_type)
    case list_type
      when :members_list
        users = self.affiliate.announcement_members
      when :daily_digest_list
        users = self.affiliate.daily_digest_members
      when :weekly_digest_list
        users = self.affiliate.digest_members
      when :author_contributor_list
        users = self.affiliate.admins(Membership::AUTHOR)
      when :editor_administrator_list
        users = self.affiliate.admins(Membership::EDITOR)
    end
  end

  def handle_unsubscribe(user, list_type)
    s = Subscription.where(user_id: user.id).first
    return if s.nil?

    case list_type
      when :members_list
        s.announcement = 0
        s.save
      when :daily_digest_list
        s.daily = 0
        s.save
      when :weekly_digest_list
        s.weekly = 0
        s.save
      when :author_contributor_list
        # ignore.
        # #author / contributor can't unsubscribe via Mailchimp
      when :editor_administrator_list
        # ignore.
        # editor / administrator can't unsubscribe via Mailchimp
    end
  end

  def get_members(list_id, list_type = :subscribed)
    # Get list members.
    if list_type == :subscribed
      list_type_string = 'subscribed'
    else
      list_type_string = 'unsubscribed'
    end

    page_number = 0
    members = []
    begin
      members_this_page = @mailchimp_api.lists.members(list_id, list_type_string, {start: page_number})["data"]
      members = members + members_this_page
      page_number += 1
    end while members_this_page.count > 0

    return members
  end

  def batch_add(list_id, email, unsubscribe=false)
    @batch = { } if @batch.nil?
    @batch[list_id] = { to_subscribe: [], to_unsubscribe: [] } if @batch[list_id].nil?

    list = @batch[list_id]

    if unsubscribe
      list[:to_unsubscribe] << { email: email.downcase }
    else
      list[:to_subscribe] << { email: { email: email.downcase }, email_type: "html" }
    end

    max_before_execute = 100 #Mailchimp recommends capping at 5k to 10k records, this number is conservative.
    batch_execute if list[:to_subscribe].count > max_before_execute || list[:to_unsubscribe].count > max_before_execute
  end

  def batch_execute
    return if @batch.nil?

    double_optin = false #don't send confirmation email to user, asking if they really want to be added. These folks have already opted in.
    update_existing = true #don't throw an error if this user is already in the list. Even though theoretically they shouldn't be.

    delete_member = true #if unsubscribing, delete this email out of the list.
    send_goodbye = false #don't send a goodbye email on unsubscribe

    @batch.each do |list_id, list|
      if list[:to_subscribe].count > 0
        result = @mailchimp_api.lists.batch_subscribe(list_id, list[:to_subscribe],double_optin,update_existing)
        list[:to_subscribe] = []  #clear the array
      end
      if list[:to_unsubscribe].count > 0
        result = @mailchimp_api.lists.batch_unsubscribe(list_id, list[:to_unsubscribe],delete_member,send_goodbye)
        list[:to_unsubscribe] = []  #clear the array
      end
    end
  end

end