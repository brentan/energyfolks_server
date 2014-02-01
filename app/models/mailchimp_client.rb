require 'mailchimp'

class MailchimpClient < ActiveRecord::Base
  belongs_to :affiliate

  attr_accessible :affiliate_id, :api_key, :members_list_id, :daily_digest_list_id,
                  :author_contributor_list_id, :editor_administrator_list_id

  # NOTE: affiliate_id can be nil, if these are the Mailchimp settings for the global Energyfolks mailing list.

  # no two affiliates can have the same mailchimp api_key
  validates :api_key, :uniqueness => {message: "This API key is already being used by another EnergyFolks affiliate. Please check your API key or notify an administrator."}

  # for each affiliate, the members list ID has to be different from the daily digest list ID, and so on
  validate :each_list_different

  def each_list_different
    errors.add(:members_list_id, "must not be same as the daily digest list") if present_and_equal(self.members_list_id, self.daily_digest_list_id)
    errors.add(:members_list_id, "must not be same as the author contributor list") if present_and_equal(self.members_list_id, self.author_contributor_list_id)
    errors.add(:members_list_id, "must not be same as the editor administrator list") if present_and_equal(self.members_list_id, self.editor_administrator_list_id)

    errors.add(:daily_digest_list_id, "must not be same as the author contributor list") if present_and_equal(self.daily_digest_list_id, self.author_contributor_list_id)
    errors.add(:daily_digest_list_id, "must not be same as the editor administrator list") if present_and_equal(self.daily_digest_list_id, self.editor_administrator_list_id)

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
    return unless Rails.env.production? && api_key.present?

    lists_in_mailchimp = get_lists_for_this_user(user.email)
    lists_in_energyfolks = []

    m = user.memberships.approved.where(affilate_id == self.affiliate_id)
    if m.present?
      lists_in_energyfolks << self.members_list_id if user.subscription.announcement? || (m.admin_level >= Membership::EDITOR)
      lists_in_energyfolks << self.daily_digest_list_id if user.subscription.weekly? || (m.admin_level >= Membership::EDITOR)
      lists_in_energyfolks << self.author_contributor_list_id if m.admin_level >= Membership::AUTHOR
      lists_in_energyfolks << self.editor_administrator_list_id if m.admin_level >= Membership::EDITOR
    end

    (lists_in_energyfolks - lists_in_mailchimp).each { |list_id_to_add| batch_add(list_id, user.email.downcase) }
    (lists_in_mailchimp - lists_in_energyfolks).each { |list_id_to_remove| batch_add(list_id, user.email.downcase,true) }

    batch_execute
  end

  def sync_lists
    return unless Rails.env.production? && api_key.present?
    # This will sync this affiliate's Mailchimp email lists with their user database.
    if self.members_list_id.present?
      emails = self.affiliate.announcement_members.map{ |u| u.email.downcase }
      sync_list(self.members_list_id, emails)
    end

    if self.daily_digest_list_id.present?
      emails = self.affiliate.announcement_members.map{ |u| u.email.downcase }
      sync_list(self.daily_digest_list_id, emails)
    end

    if self.author_contributor_list_id.present?
      emails = self.affiliate.admins(Membership::AUTHOR).map{ |u| u.email.downcase }
      sync_list(self.author_contributor_list_id, emails)
    end

    if self.editor_administrator_list_id.present?
      emails = self.affiliate.admins(Membership::EDITOR).map{ |u| u.email.downcase }
      sync_list(self.editor_administrator_list_id, emails)
    end

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
    get_members(list_id, 'subscribed').map { |m| m.email }
  end

  def get_list_unsubscribed_emails(list_id)
    get_members(list_id, 'unsubscribed').map { |m| m.email }
  end

  def get_lists_for_this_user(email)
    e = email.downcase
    list_memberships = []

    get_list_names.each do |l|
      list_memberships << l["id"] if get_list_members(l["id"]).include?(e)
    end
  end

  def sync_list(list_id, emails_list_should_contain)
    current_members = get_list_member_emails(list_id)

    # Add in new members
    (emails_list_should_contain - current_members).each {|email| batch_add(list_id, email) }

    # Remove members that have left
    (current_members - emails_list_should_contain).each {|email| batch_add(list_id, email, true) }
  end

  def get_members(list_id)
    # Get list members.
    return @mailchimp_api.lists.members(list_id)
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

    max_before_execute = 80
    batch_execute if list[:to_subscribe].count > max_before_execute || list[:to_unsubscribe].count > max_before_execute
  end

  def batch_execute
    return if @batch.nil?

    double_optin = false #don't send confirmation email to user, asking if they really want to be added. These folks have already opted in.
    update_existing = true #don't throw an error if this user is already in the list. Even though theoretically they shouldn't be.

    delete_member = true #if unsubscribing, delete this email out of the list.
    send_goodbye = false #don't send a goodbye email on unsubscribe

    @batch.each_by_index do |list_id|
      if @batch[list_id][:to_subscribe].count > 0
        @mailchimp_api.lists.batch_subscribe(list_id, @batch[list_id][:to_subscribe],double_optin,update_existing)
        @batch[list_id][:to_subscribe] = []  #clear the array
      end
      if @batch[list_id][:to_unsubscribe].count > 0
        @mailchimp_api.lists.batch_unsubscribe(list_id, @batch[list_id][:to_unsubscribe],delete_member,send_goodbye)
        @batch[list_id][:to_unsubscribe] = []  #clear the array
      end
    end
  end

end