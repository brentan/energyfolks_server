class Affiliate < ActiveRecord::Base
  has_many :users, :through => :memberships
  has_many :memberships, :dependent => :destroy
  has_many :affiliates_jobs, :dependent => :destroy
  has_many :affiliates_events, :dependent => :destroy
  has_many :affiliates_discussions, :dependent => :destroy
  has_many :emails, as: :entity, :dependent => :destroy
  has_many :highlights, :dependent => :destroy
  has_many :comments, :dependent => :destroy
  has_many :subcomments, :dependent => :destroy

  attr_accessible :name, :short_name, :email_name, :url, :url_events, :url_jobs, :url_discussions, :url_users, :url_blogs,
                  :email, :live, :open, :visible, :color, :email_header, :web_header, :location, :latitude, :longitude,
                  :moderate_discussions, :moderate_jobs, :moderate_events, :shared_secret, :cpanel_user, :cpanel_password,
                  :send_digest, :logo, :weekly, :daily, :jobs, :events, :discussions, :event_radius, :job_radius,
                  :show_details, :timezone

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
    affiliate = super(id)
    if affiliate.blank?
      affiliate = Affiliate.new(:name => 'Energyfolks', :url => 'https://www.energyfolks.com/', :location => 'Oakland, CA', :short_name => 'energyfolks', :show_details => true, :timezone => 'Pacific Time (US & Canada)')
    end
    return affiliate
  end

  def admins(type = Membership::ADMINISTRATOR, emails_only = false)
    search = self.memberships.where("admin_level >= #{type}")
    search = search.where("moderation_emails = 1") if emails_only
    return search.all.map{|u| u.user }
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
    # TODO: Add email notice to user informing them that thier primary group has left EF
    User.find_by_affiliate_id(self.id).all.each do |u|
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

  def url_users
    url = super
    url = "#{SITE_HOST}/users" if url.blank?
    url
  end

  def url_events
    url = super
    url = "#{SITE_HOST}/events" if url.blank?
    url
  end

  def url_jobs
    url = super
    url = "#{SITE_HOST}/jobs" if url.blank?
    url
  end

  def url_discussions
    url = super
    url = "#{SITE_HOST}/discussions" if url.blank?
    url
  end

  def url_blogs
    url = super
    url = "#{SITE_HOST}/blogs" if url.blank?
    url
  end

end