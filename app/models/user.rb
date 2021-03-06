class User < ActiveRecord::Base
  has_many :user_login_hashes, :dependent => :destroy
  has_many :affiliates, :through => :memberships
  has_many :memberships, :dependent => :destroy
  has_many :emails, :dependent => :destroy
  has_many :jobs, :dependent => :destroy
  has_many :events, :dependent => :destroy
  has_many :discussions, :dependent => :destroy
  has_one :subscription, :dependent => :destroy
  has_many :user_comments, :class_name => 'Comment', :dependent => :destroy
  has_many :subcomments, :dependent => :destroy
  has_many :user_highlights, :dependent => :destroy
  has_many :admin_messages, :dependent => :destroy
  has_many :mark_reads_reader, :class_name => 'MarkRead'
  has_many :visits
  has_many :self_donations, :class_name => 'Donation'
  has_many :stripe_tokens, :dependent => :destroy
  has_many :google_emails, :dependent => :destroy
  has_many :digest_mailers
  has_many :user_logins
  has_many :comment_subscribers, :dependent => :destroy
  has_many :third_party_logins, :dependent => :destroy
  has_many :blog_posts, :class_name => 'Blog'
  has_many :email_settings_tokens, :dependent => :destroy

  EMAIL_VALIDATION = /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i

  belongs_to :affiliate
  scope :verified, where(:verified => true)
  include MixinEntity
  default_scope order(:last_name, :first_name)

  attr_accessible :email, :secondary_email, :first_name, :last_name, :latitude, :longitude, :visibility, :timezone, :location, :avatar, :resume,
                  :password, :password_confirmation, :password_old, :email_to_verify, :bio, :interests, :expertise,
                  :resume_visibility, :position, :organization, :memberships_attributes, :subscription_attributes, :organization_type,
                  :affiliate_id, :school_affiliation, :program_id, :graduation_month, :graduation_year
  attr_accessor :password, :password_old, :graduation_year, :graduation_month, :program_id, :school_affiliation

  validates_presence_of :first_name
  validates_length_of :password, :within => 4..40, :if => :password_entered?
  validates_confirmation_of :password, :if => :password_entered?
  validates_format_of :email, :with => EMAIL_VALIDATION
  validates_format_of :secondary_email, :with => EMAIL_VALIDATION, :allow_blank => true, :allow_nil => true

  accepts_nested_attributes_for :memberships, :allow_destroy => true
  accepts_nested_attributes_for :google_emails, :allow_destroy => true
  accepts_nested_attributes_for :subscription

  acts_as_locatable
  acts_as_taggable

  after_save :broadcast
  before_destroy :remove_from_index

  after_create :setup_subscriptions

  # Visibility codes
  PUBLIC = 1
  LOGGED_IN = 2
  NETWORKS = 3
  PRIVATE = 4

  # We dont use version control
  VERSION_CONTROLLED = []
  ORG_TYPES = %w(Government NonProfit Industry Academia)

  def to_index
    begin
      require 'asari'
      latlng = Asari::Geography.degrees_to_int(lat: self.latitude, lng: self.longitude)
    rescue
      latlng = {lat: 0, lng: 0}
    end
    affiliate_list = self.memberships.approved.map { |e| e.affiliate_id.to_s(27).tr("0-9a-q", "A-Z") }
    affiliate_list << 'A'
    affiliate_list = [] unless self.verified?
    {
        :primary => "#{self.last_name},#{self.first_name}",
        :secondary => self.raw_tags,
        :full_text => HTML::FullSanitizer.new.sanitize("#{self.position} #{self.organization} #{self.bio} #{self.interests} #{self.expertise}",:tags=>[]),
        :lat => latlng[:lat],
        :lng => latlng[:lng],
        :date => self.visibility,
        :affiliates => "ss#{affiliate_list.join("ee ss")}ee",
        :highlights => "",
        :type => self.entity_name,
        :primary_id => self.affiliate_id
    }
  end
  validates_each :email do |record, attr, value|
    if value.present?
      record.errors.add(attr, 'Invalid email address') unless value.upcase =~ /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/
      user = User.find_by_email(value.downcase)
      if user.present? && (user.id != record.id)
        if user.affiliate.present?
          record.errors.add(attr, "email address already in use.  Energyfolks account exists through #{user.affiliate.name}.  You may login here with that account.")
        else
          record.errors.add(attr, "email address already in use.  Energyfolks account exists, you may login here with that account.")
        end
     end
      user = User.find_by_email_to_verify(value.downcase)
      record.errors.add(attr, 'email address already in use') if user.present? && (user.id != record.id)
    else
      record.errors.add(attr, 'Please provide an email address')
    end
  end
  validates_each :email_to_verify do |record, attr, value|
    if value.present?
      record.errors.add(attr, 'Invalid email address') unless value.upcase =~ /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/
      user = User.find_by_email(value.downcase)
      record.errors.add(attr, 'email address already in use') if user.present? && (user.id != record.id)
      record.errors.add(attr, 'address is the same as current account address.  Leave blank to cancel address change.') if user.present? && (user.id == record.id)
      user = User.find_by_email_to_verify(value.downcase)
      record.errors.add(attr, 'email address already in use') if user.present? && (user.id != record.id)
    end
  end


  before_save :set_password

  has_attached_file :avatar, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :hash_secret => "34fQfadfbdhbfladsbfadilsbfaldksfbt49javsdnva9sbdf7a909-",
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//profile_avatar/:hash.:extension"
  }
  has_attached_file :resume, {
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//resume/:hash.:extension",
      :hash_secret => "34fQfadfinasdna2-9jrq49f8acn748q3t49javsdnva9sbdf7a909-"
  }
  validates_attachment :avatar,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }
  validates_attachment :resume,
                       :content_type => { :content_type => /^(text|application\/pdf|application\/x\-pdf|application\/ms|application\/vnd\.ms|application\/vnd\.openxmlformats|application\/x\-ms).*/ },
                       :size => { :in => 0..20.megabytes }

  ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  def self.find_all_visible(current_user, affiliate = nil, options = {})
    visibility = User::PUBLIC
    visibility = User::LOGGED_IN if current_user.present?
    visibility = User::NETWORKS if current_user.present? && affiliate.present? && affiliate.member?(current_user)
    visibility = User::PRIVATE if current_user.present? && affiliate.present? && affiliate.admin?(current_user, Membership::EDITOR)
    visibility = User::PRIVATE if current_user.present? && current_user.admin?
    affiliates = [ (affiliate.present? && affiliate.id.present?) ? affiliate.id : 0 ]
    options[:highlight] = 0
    options[:visibility] = visibility
    admin_user_search = options[:terms].present? && current_user.present? && current_user.admin?
    results, more_pages = self.search(options[:terms],affiliates, options, admin_user_search)
    return results, more_pages
  end

  def member_grad_year(aid)
    m = self.memberships.where(:affiliate_id => aid).first
    m.graduation_year.present? ? m.graduation_year.to_s : ""
  end
  def member_grad_month_year(aid)
    m = self.memberships.where(:affiliate_id => aid).first
    "#{m.graduation_month}/#{m.graduation_year}"
  end
  def member_school_program(aid)
    m = self.memberships.where(:affiliate_id => aid).first
    m.program.present? ? m.program.name : ""
  end
  def member_school_affiliation(aid)
    m = self.memberships.where(:affiliate_id => aid).first
    m.school_affiliation.present? ? Membership.school_affiliation(m.school_affiliation) : ""
  end

  def affiliate_join
    self.memberships
  end
  def name
    self.first_name + ' ' + self.last_name
  end
  def entity_type
    "membership request"
  end
  def extra_info(join_item)
    "The user has provided the following reason for seeking membership in your group:<BR>#{join_item.reason}"
  end
  def archived?
    false
  end
  def archived
    false
  end
  def self.date_column
    'created_at'
  end
  def self.join_table
    Membership
  end
  def average_donation
    tot = 0
    sum = 0
    self.self_donations.each do |d|
      tot += 1
      sum += d.amount
    end
    return 100 if tot == 0
    return (sum/tot).to_i
  end
  def self.to_archive
    []
  end
  def full_name
    return "#{self.first_name} #{self.last_name}"
  end
  def legacy?
    false
  end
  def resume_visible?(user)
    return true if self.resume_visibility == PUBLIC
    return false if user.blank?
    return true if self.resume_visibility == LOGGED_IN
    if self.resume_visibility == NETWORKS
      self.memberships.each do |m|
        return true if m.affiliate.present? && m.affiliate.member?(user)
      end
    end
    return true if user.admin?
    return false
  end


  def approve(current_user, affiliate, highlight = false)
    if affiliate.id.present?
      if current_user.present? && affiliate.admin?(current_user, Membership::EDITOR)
        @affiliate = affiliate
        @membership = Membership.find_by_affiliate_id_and_user_id(@affiliate.id, self.id)
        if @membership.present?
          @membership.approved = true
          @membership.broadcast = true
          @membership.save!
          self.delay.sync
          @user = self
          UserMailer.delay.affiliate_approved(self.id,@aid, @host)
          self.update_index
          return "User has been added to your group"
        else
          return "This user no longer exists or is no longer requesting membership"
        end
      end
    end
    return "Not Authorized"
  end

  def reject_or_remove(current_user, affiliate, reason)
    if affiliate.id.present?
      if current_user.present? && affiliate.admin?(current_user, Membership::EDITOR)
        @affiliate = affiliate
        @user = self
        @membership = Membership.find_by_affiliate_id_and_user_id(@affiliate.id, @user.id)
        if @membership.present? && reason.present?
          if @membership.approved?
            UserMailer.delay.affiliate_removed(@user.id, reason, @aid, @host)
            message = "User has been removed from your group"
          else
            UserMailer.delay.affiliate_rejected(@user.id, reason, @aid, @host)
            message = "User request to join group has been rejected"
          end
          @membership.approved = false
          @membership.destroy
          @membership = nil
          @user.update_column(:affiliate_id, 0) if @user.affiliate_id == affiliate.id
          @user.delay.sync
          @user.update_index
          return message
        else
          return "This user no longer exists or is no longer in your group"
        end
      end
    end
    return "Not Authorized"

  end

  def wordpress_password(affiliate_id)
    #password auto-generated and used by wordpress logins
    Digest::MD5.hexdigest(self.id.to_s + "ENERGYFOLKS_SALT" + affiliate_id.to_s)
  end
  def is_visible?(user)
    return true if self.visibility == PUBLIC
    if user.present?
      return true if self.visibility == LOGGED_IN
      if self.visibility == NETWORKS
        self.memberships.approved.each do |a|
          return true if a.affiliate.present? && a.affiliate.member?(user)
        end
      end
      self.memberships.approved.each do |a|
        return true if a.affiliate.present? && a.affiliate.admin?(user, Membership::EDITOR)
      end
    end
    return false
  end
  def broadcast
    return unless self.verified?
    self.memberships.where(broadcast: false).each do |i|
      recipients = i.affiliate.admins(Membership::EDITOR, true)
      recipients.each do |user|
        NotificationMailer.delay.awaiting_moderation(user.id, i.affiliate_id, self.id, self.entity_name, i)
      end
      i.broadcast = true
      i.save(:validate => false)
    end
  end

  def moderation_count
    total = 0
    values = []
    ApplicationController::ENTITIES.each do |e|
      self.memberships.approved.each do |a|
        tot = 0
        tot = e.total_needing_moderation(a.affiliate).count if a.affiliate.admin?(self, Membership::EDITOR)
        if tot > 0
          total += tot
          values << {title: "#{e.new().entity_type.capitalize.pluralize(tot)} - #{a.affiliate.short_name}", aid: a.affiliate_id, method: e.new().method_name, count: tot}
        end
      end
      if self.admin?
        tot = 0
        tot = e.total_needing_moderation(Affiliate.find_by_id(0)).count
        if tot > 0
          total += tot
          values << {title: "#{e.new().entity_type.capitalize.pluralize(tot)} - energyfolks", aid: 0, method:e.new().method_name, count: tot}
        end
      end
    end
    return { total: total, values: values }
  end

  def self.needing_moderation(user, affiliate)
    moderation = []
    if affiliate.id.present?
      user.memberships.approved.each do |a|
        moderation += self.total_needing_moderation(a.affiliate).all if (a.affiliate_id == affiliate.id) && a.affiliate.admin?(user, Membership::EDITOR)
      end
    else
      moderation += self.total_needing_moderation(affiliate).all if user.admin?
    end
    moderation = moderation.map { |m| m.user_id }.compact
    return self.where(id: moderation).all
  end

  def user_posts
    total = 0
    values = []
    ApplicationController::ENTITIES.each do |e|
      next if e == User
      tot = e.where(user_id: self.id).count
      if tot > 0
        total += tot
        values << {title: e.new().entity_type.capitalize.pluralize(tot), method: e.new().method_name, count: tot}
      end
    end
    return { total: total, values: values }
  end

  ## Password hashing and salting algorithm, also used to generate cookie string
  # Functions below used to set password (and also cookie)
  def set_password
    return if self.password.blank?
    random = self.get_random_bytes(6)
    hash = self.crypt_private(self.password, "$P$B#{self.encode64(random, 6)}")
    self.encrypted_password = hash
    self.encrypted_cookie = self.update_encrypted_cookie(self.password)
  end

  def update_encrypted_cookie(hash)
    hash = self.crypt_private(hash, "$P$B#{self.encode64(self.get_random_bytes(6), 6)}")
    self.crypt_private(hash, "$P$B#{self.encode64(self.get_random_bytes(6), 6)}")
  end

  def check_password(password)
    hash = self.crypt_private(password, self.encrypted_password)
    return hash == self.encrypted_password
  end

  def self.find_by_email_and_password(email, password)
    user = User.find_by_email(email.downcase)
    return nil if user.blank?
    return nil unless user.check_password(password) && user.verified
    return user
  end

  def cookie
    hash = self.encrypted_password + self.encrypted_cookie + self.id.to_s
    return Digest::MD5.hexdigest(hash + ITOA64)
  end

  def self.find_by_cookie(cookie)
    where_clause =  "CONCAT(encrypted_password,CONCAT(encrypted_cookie,id))"
    where_clause = "md5(CONCAT(#{where_clause}, '#{ITOA64}')) = '#{cookie}'"
    User.where(where_clause).first
  end

  def password_reset_token
    hash = self.encrypted_password + Time.now.to_s + self.id.to_s
    self.password_reset = Digest::MD5.hexdigest(hash + ITOA64)
    self.save!(validate: false)
    hash = self.encrypted_password + self.password_reset + self.id.to_s
    return Digest::MD5.hexdigest(hash + ITOA64)
  end

  def self.find_by_password_reset_token(token)
    where_clause =  "CONCAT(encrypted_password,CONCAT(password_reset,id))"
    where_clause = "md5(CONCAT(#{where_clause}, '#{ITOA64}')) = '#{token}'"
    User.where(where_clause).first
  end

  def activation_token
    hash = self.encrypted_password + self.first_name + self.id.to_s
    return Digest::MD5.hexdigest(hash + ITOA64)
  end

  def self.find_by_activation_token(token)
    where_clause =  "CONCAT(encrypted_password,CONCAT(first_name,id))"
    where_clause = "md5(CONCAT(#{where_clause}, '#{ITOA64}')) = '#{token}'"
    user = User.where(where_clause).first
    return nil unless user.present? && !user.verified?
    return user
  end

  def verification_token
    hash = self.email + self.email_to_verify + self.id.to_s
    return Digest::MD5.hexdigest(hash + ITOA64)
  end

  def self.find_by_verification_token(token)
    where_clause =  "CONCAT(email,CONCAT(email_to_verify,id))"
    where_clause = "md5(CONCAT(#{where_clause}, '#{ITOA64}')) = '#{token}'"
    user = User.where(where_clause).first
    return nil unless user.present? && user.verified?
    return user
  end

  def update_by_linkedin
    #TODO: add to rake task to auto-update folks profiles each week or so?
    token = ThirdPartyLogin.linkedin.where(:user_id => self.id).first
    return if token.blank?
    begin
      client = LinkedIn::Client.new(LINKEDIN_KEY, LINKEDIN_SECRET)
      client.authorize_from_access(token.token, token.secret)
      info = client.profile(:fields => %w(summary picture-url public-profile-url headline specialties positions first-name last-name email-address interests))
      self.first_name = info.first_name if info.first_name.present?
      self.last_name = info.last_name if info.last_name.present?
      self.linkedin_url = info.public_profile_url if info.public_profile_url.present?
      self.email = info.email_address.downcase if info.email_address.present?
      self.bio = info.summary if info.summary.present?
      self.expertise = info.specialties if info.specialties.present?
      self.interests = info.interests if info.interests.present?
      self.avatar = info.picture_url if info.picture_url.present?
      if info.positions.present? && info.positions.all.present? && info.positions.all[0].present?
        self.position = info.positions.all[0].title if info.positions.all[0].title.present?
        self.organization = info.positions.all[0].company.name if info.positions.all[0].company.present?
      elsif info.headline.present?
        self.position = info.headline
      end
      self.save!
    rescue
    end
  end

  def sync
    google = GoogleClient.new
    google.sync_user(self)

    Affiliate.all.each do |a|
      a.mailchimp_client.sync_user(self) if a.mailchimp_client.present?
      #sync this user's preferences with each affiliate.
      # even if they're not a member of this affiliate now, they might have been previously,
      # in which case we should delete them out of the Mailchimp list for that affiliate.

      # Sync salesforce
      c = SalesforceClient.new(a)
      if c.enabled?
        c.sync_user(self) if c.login == ''
      end

    end

  end

  # After create, setup default email subscriptons
  def setup_subscriptions
    subscription = Subscription.new(user_id: self.id)
    first_affiliate = self.affiliate
    if first_affiliate.present?
      subscription.weekly = first_affiliate.weekly
      subscription.daily = first_affiliate.daily
      subscription.jobs = first_affiliate.jobs
      subscription.events = first_affiliate.events
      subscription.discussions = first_affiliate.discussions
      subscription.job_radius = first_affiliate.job_radius
      subscription.event_radius = first_affiliate.event_radius
    end
    subscription.save
  end

  protected
  # Used in validation to throw error if password do not match
  def password_entered?
    if new_record?
      return true
    end
    !password.blank?
  end

  ## Password hashing and salting algorithm, also used to generate cookie string
  # Support functions

  def get_random_bytes(count)
    output = '';
    i = 0
    while i < count do
      output += Digest::SHA1.hexdigest(Digest::SHA1.hexdigest(Time.now.to_f.to_s))
      i += 16
    end
    output = output[0,count]
    return output
  end

  def encode64(input, count)
    output = ''
    i = 0
    begin
      value = input[i].ord
      i += 1
      output += ITOA64[value & 0x3f]
      value = (value | (input[i].ord << 8)) if i < count
      output += ITOA64[(value >> 6) & 0x3f]
      break if i >= count
      i += 1
      value = (value | (input[i].ord << 16)) if i < count
      output += ITOA64[(value >> 12) & 0x3f]
      break if i >= count
      i += 1
      output += ITOA64[(value >> 18) & 0x3f]
    end while i < count
    return output
  end

  def crypt_private(password, setting)
    output = '*0'
    output = '*1' if (setting[0, 2] == output)

    id = setting[0, 3]
    return output if id != '$P$'
    count_log2 = ITOA64.index(setting[3]);
    return $output if (count_log2 < 7) || (count_log2 > 30)
    count = 1 << count_log2
    salt = setting[4, 8]
    return output if salt.length != 8
    hash = Digest::MD5.digest(salt + password)
    begin
      hash = Digest::MD5.digest(hash + password)
      count -= 1
    end while count > 0
    output = setting[0,12]
    output+= self.encode64(hash, 16)
    return output
  end

end
