class User < ActiveRecord::Base
  has_many :user_login_hashes, :dependent => :destroy
  has_many :affiliates, :through => :memberships
  has_many :memberships, :dependent => :destroy
  has_many :emails, :dependent => :destroy
  has_many :jobs, :dependent => :destroy
  has_one :subscription, :dependent => :destroy
  scope :verified, where(:verified => true)
  include MixinEntity
  default_scope order(:last_name, :first_name)

  attr_accessible :email, :first_name, :last_name, :latitude, :longitude, :visibility, :timezone, :location, :avatar, :resume,
                  :password, :password_confirmation, :password_old, :email_to_verify, :bio, :interests, :expertise,
                  :resume_visibility, :position, :organization, :radius, :memberships_attributes, :subscription_attributes
  attr_accessor :password, :password_old

  validates_presence_of :first_name
  validates_length_of :password, :within => 4..40, :if => :password_entered?
  validates_confirmation_of :password, :if => :password_entered?

  accepts_nested_attributes_for :memberships, :allow_destroy => true
  accepts_nested_attributes_for :subscription

  acts_as_locatable
  acts_as_taggable

  after_save :broadcast

  after_create :setup_subscriptions

  # Visibility codes
  PUBLIC = 1
  LOGGED_IN = 2
  NETWORKS = 3
  PRIVATE = 4

  # We dont use version control
  VERSION_CONTROLLED = []

  validates_each :email do |record, attr, value|
    if value.present?
      record.errors.add(attr, 'Invalid email address') unless value.upcase =~ /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/
      user = User.find_by_email(value.downcase)
      record.errors.add(attr, 'email address already in use') if user.present? && (user.id != record.id)
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
      :url => "/system/profile_avatar/:hash.:extension",
      :hash_secret => "34fQfadfbdhbfladsbfadilsbfaldksfbt49javsdnva9sbdf7a909-"
  }
  has_attached_file :resume, {
      :url => "/system/resume/:hash.:extension",
      :hash_secret => "34fQfadfinasdna2-9jrq49f8acn748q3t49javsdnva9sbdf7a909-"
  }
  validates_attachment :avatar,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }
  validates_attachment :resume,
                       :content_type => { :content_type => /^(text|application\/pdf|application\/x\-pdf|application\/ms|application\/vnd\.ms|application\/vnd\.openxmlformats|application\/x\-ms).*/ },
                       :size => { :in => 0..20.megabytes }

  ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  def self.find_all_visible(current_user, affiliate = nil, page=0, per_page=20)
    visibility = User::PUBLIC
    visibility = User::LOGGED_IN if current_user.present?
    visibility = User::NETWORKS if current_user.present? && affiliate.present? && Membership.is_member?(current_user, affiliate)
    visibility = User::PRIVATE if current_user.present? && affiliate.present? && Membership.is_admin?(current_user, affiliate, Membership::EDITOR)
    visibility = User::PRIVATE if current_user.present? && current_user.admin?
    users = User.verified.select([:verified, :active, 'users.id', :first_name, :last_name, :position, :organization, :avatar_file_name, :avatar_updated_at]).order('last_name, first_name').offset(page * per_page).limit(per_page)
    users = users.joins(:memberships).where(:memberships => {:approved => true, :affiliate_id => affiliate.id}) if affiliate.present?
    users.all
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
  def self.join_table
    Membership
  end
  def is_visible?(user)
    return true if self.visibility == PUBLIC
    if user.present?
      return true if self.visibility == LOGGED_IN
      if self.visibility == NETWORKS
        self.memberships.approved.each do |a|
          return true if a.member?(user)
        end
      end
      self.memberships.approved.each do |a|
        return true if a.admin?(user, Membership::EDITOR)
      end
    end
    return false
  end
  def broadcast
    return unless self.verified?
    self.memberships.where(broadcast: false).each do |i|
      recipients = i.affiliate.admins(Membership::EDITOR, true)
      NotificationMailer.delay.awaiting_moderation(recipients, i.affiliate, self, i) if recipients.length > 0
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
    end
    # TODO: Somehow super admin moderation count.
    return { total: total, values: values }
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
    random = self.get_random_bytes(6)
    hash = self.crypt_private(hash, "$P$B#{self.encode64(random, 6)}")
    self.encrypted_cookie = hash
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

  # After create, setup default email subscriptons
  def setup_subscriptions
    subscription = Subscription.new(user_id: self.id)
    first_affiliate = self.affiliates.first
    if first_affiliate.present?
      # TODO: Rewrite the below to just be in a loop and set all possible subscription attributes with affiliate equivalent
      subscription.weekly = first_affiliate.weekly
      subscription.daily = first_affiliate.daily
      subscription.jobs = first_affiliate.jobs
      subscription.events = first_affiliate.events
      subscription.bulletins = first_affiliate.bulletins
      subscription.job_radius = first_affiliate.job_radius
      subscription.event_radius = first_affiliate.event_radius
    end
    subscription.save
  end
end
