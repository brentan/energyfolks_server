class Affiliate < ActiveRecord::Base
  has_many :users, :through => :memberships
  has_many :memberships, :dependent => :destroy
  has_many :affiliates_jobs, :dependent => :destroy
  has_many :affiliates_events, :dependent => :destroy
  has_many :affiliates_discussions, :dependent => :destroy
  has_many :affiliates_blogs, :dependent => :destroy
  has_many :emails, as: :entity, :dependent => :destroy
  has_many :highlights, :dependent => :destroy
  has_many :comments, :dependent => :destroy
  has_many :calendar_imports, :dependent => :destroy
  has_many :visits, :dependent => :destroy
  has_many :user_logins
  has_many :nightly_stats, :dependent => :destroy
  has_many :subcomments, :dependent => :destroy
  has_many :blog_posts, :class_name => 'Blog', :dependent => :destroy
  has_one :mailchimp_client, :dependent => :destroy
  has_many :salesforce_items, :dependent => :destroy
  has_many :programs, :dependent => :destroy


  attr_accessible :name, :short_name, :email_name, :url, :url_events, :url_jobs, :url_discussions, :url_users, :url_blogs,
                  :email, :live, :open, :visible, :color, :email_header, :custom_header, :location, :latitude, :longitude,
                  :moderate_discussions, :moderate_jobs, :moderate_events, :shared_secret, :cpanel_user, :cpanel_password,
                  :send_digest, :logo, :weekly, :daily, :jobs, :events, :discussions, :event_radius, :job_radius, :calendar_imports_attributes,
                  :show_details, :timezone, :date_founded, :president_name, :description, :blogs, :announcement, :year_founded,
                  :salesforce_username, :salesforce_password, :salesforce_token, :salesforce_items_attributes, :custom_feedback_message, :programs_attributes


  validates_presence_of :name, :location, :url, :short_name, :email_name
  validates :url, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_events, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_jobs, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_discussions, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_users, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_blogs, :format => URI::regexp(%w(http https)), :allow_blank => true

  validates_each :email do |record, attr, value|
    if value.present?
      record.errors.add(attr, 'Invalid email address') unless value.upcase =~ /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/\
    else
      record.errors.add(attr, 'Please provide an email address')
    end
  end

  geocoded_by :location
  after_validation :geocode

  before_destroy :remove_all_primary_references
  before_destroy :remove_from_google
  after_create :add_to_google

  accepts_nested_attributes_for :calendar_imports, :allow_destroy => true
  accepts_nested_attributes_for :salesforce_items, :allow_destroy => true
  accepts_nested_attributes_for :programs, :allow_destroy => true

  # 'open' codes
  OPEN = 1
  MODERATED = 2
  INVITE_ONLY = 3

  # 'moderate' codes
  ALL = 1    # all posts moderated, even if EF already moderated globally
  DIRECT = 2 # only posts directly to the group moderated...EF global moderation accepted
  NONE = 3   # all posts automatically accepted

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//affiliate_logo/:hash.:extension",
      :hash_secret => "34fQfadfbdhbfladsbfadilsbfaldksfbt49javsdnaaasdfasdfva9sbdf7a909-"
  }
  validates_attachment :logo,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }

  def self.all_visible_affiliates(current_user, current_affiliate = nil, hide_invite_only = false)
    where_clause = "visible = TRUE AND live = TRUE"
    where_clause += " AND open < 3" if hide_invite_only
    if current_user.present?
      affiliates = current_user.memberships.approved.map {|m| "id = #{m.affiliate_id}" }
      where_clause = "(#{where_clause}) OR #{affiliates.join(" OR ")}" if affiliates.present?
    end
    where_clause = "(#{where_clause}) OR id = #{current_affiliate.id}" if(current_affiliate.present? && current_affiliate.id.present?)
    Affiliate.order(:name).where(where_clause).all
  end

  def self.find_by_id(id)
    affiliate = super(id.present? ? id : 0)
    if affiliate.blank?
      affiliate = Affiliate.new(:name => 'Energyfolks', :url => SITE_HOST, :location => 'Oakland, CA', :short_name => 'energyfolks', :show_details => true, :timezone => 'Pacific Time (US & Canada)')
    end
    return affiliate
  end

  def admins(type = Membership::ADMINISTRATOR, emails_only = false)
    search = self.memberships.approved.where("admin_level >= #{type}").joins(:user)
    search = search.where("moderation_emails = 1") if emails_only
    return search.all.map{|u| u.user }
  end

  def approved_members
    self.memberships.approved.joins(:user).all.map {|u| u.user }
  end

  def announcement_members
    User.joins(:subscription).joins(:memberships).where(:subscriptions => {:announcement => true}, :memberships => {:approved => true, :affiliate_id => self.id}).all
  end

  def digest_members
    User.joins(:subscription).joins(:memberships).where(:subscriptions => {:weekly => true}, :memberships => {:approved => true, :affiliate_id => self.id}).all
  end

  def daily_digest_members
    User.joins(:subscription).joins(:memberships).where(:subscriptions => {:daily => true}, :memberships => {:approved => true, :affiliate_id => self.id}).all
  end

  def measure_stats
    {
      affiliate_id: self.id,
      total_users: self.memberships.approved.count,
      total_active_users: self.memberships.approved.joins(:user).where('users.last_login > ?',3.months.ago).count,
      total_users_moderation: self.memberships.waiting.count,
      total_jobs: Job.where(:affiliate_id => self.id).count,
      total_jobs_moderation: self.affiliates_jobs.waiting.count,
      total_events: Event.where(:affiliate_id => self.id).count,
      total_events_moderation: self.affiliates_events.waiting.count,
      total_discussions: Discussion.where(:affiliate_id => self.id).count,
      total_discussions_moderation: self.affiliates_discussions.waiting.count,
      total_blogs: Blog.where(:affiliate_id => self.id).count,
      total_blogs_moderation: self.affiliates_blogs.waiting.count,
      visits: Visit.unique_visits(affiliate_id: self.id)
    }
  end


  def email
    email = super
    email = 'contact@energyfolks.com' if email.blank?
    return email
  end

  def member?(user)
    return false if user.id.blank?
    member = Membership.where({user_id: user.id, affiliate_id: self.id, approved: true}).first()
    return member.present?
  end

  def admin?(user, level = Membership::ADMINISTRATOR, entity = nil)
    return false if user.id.blank?
    return true if entity.present? && (level == Membership::CONTRIBUTOR) && (self.send("moderate_#{entity}") == NONE)
    return true if self.id.blank? && user.admin?
    member = Membership.where({user_id: user.id, affiliate_id: self.id, approved: true}).where("admin_level >= #{level}").first()
    return member.present?
  end

  def remove_all_primary_references
    # TODO: Add email notice to user informing them that their primary group has left EF
     User.where(affiliate_id: self.id).all.each do |u|
      u.affiliate_id = 0
      u.save(:validate => false)
    end
  end

  def check_hash(hash, salt='worddet')
    return false if self.shared_secret.blank?
    return hash == Digest::MD5.hexdigest("#{self.shared_secret}#{salt}")
  end

  def create_shared_secret
    self.update_column(:shared_secret, Digest::MD5.hexdigest("#{Time.now()}.energyfolkssalt"))
  end

  def set_entity_url(url, entity)
    self.update_column(:url_users,url) if (entity == 'users') && self.url_users(true).blank?
    self.update_column(:url_events,url) if (entity == 'events') && self.url_events(true).blank?
    self.update_column(:url_jobs,url) if (entity == 'jobs') && self.url_jobs(true).blank?
    self.update_column(:url_discussions,url) if (entity == 'discussions') && self.url_discussions(true).blank?
    self.update_column(:url_blogs,url) if (entity == 'blogs') && self.url_blogs(true).blank?
  end

  def entity_url(entity = nil)
    if entity.nil?
      url = self.url
    else
      url = url_users if entity.instance_of?(User)
      url = url_events if entity.instance_of?(Event)
      url = url_jobs if entity.instance_of?(Job)
      url = url_discussions if entity.instance_of?(Discussion)
      url = url_blogs if entity.instance_of?(Blog)
    end
    url
  end

  def level_name(user)
    return 'Administrator' if self.admin?(user, Membership::ADMINISTRATOR)
    return 'Editor' if self.admin?(user, Membership::EDITOR)
    return 'Author' if self.admin?(user, Membership::AUTHOR)
    return 'Contributor' if self.admin?(user, Membership::CONTRIBUTOR)
    return 'no rights'
  end

  def url_users(force = false)
    return super() if force
    url = super()
    url = "#{SITE_HOST}/users" if url.blank?
    url
  end

  def url_events(force = false)
    return super() if force
    url = super()
    url = "#{SITE_HOST}/events" if url.blank?
    url
  end

  def url_jobs(force = false)
    return super() if force
    url = super()
    url = "#{SITE_HOST}/jobs" if url.blank?
    url
  end

  def url_discussions(force = false)
    return super() if force
    url = super()
    url = "#{SITE_HOST}/discussions" if url.blank?
    url
  end

  def url_blogs(force = false)
    return super() if force
    url = super()
    url = "#{SITE_HOST}/blogs" if url.blank?
    url
  end

  def moderate_blogs
    Affiliate::NONE
  end

  def add_to_google
    return unless Rails.env.production?
    google_client = GoogleClient.new
    google_client.create_affiliate(self)
  end

  def remove_from_google
    return unless Rails.env.production?
    google_client = GoogleClient.new
    google_client.remove_affiliate(self)
  end

end