class Affiliate < ActiveRecord::Base
  has_many :users, :through => :memberships
  has_many :memberships, :dependent => :destroy

  attr_accessible :name, :short_name, :email_name, :url, :url_calendar, :url_jobs, :url_bulletins, :url_users, :url_blog,
                  :email, :live, :open, :visible, :color, :email_header, :web_header, :location, :latitude, :longitude,
                  :moderate_bulletins, :moderate_jobs, :moderate_calendar, :shared_secret, :cpanel_user, :cpanel_password,
                  :send_digest, :radius, :logo

  validates_presence_of :name, :location, :url, :short_name, :email_name
  validates :url, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_calendar, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_jobs, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_bulletins, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_users, :format => URI::regexp(%w(http https)), :allow_blank => true
  validates :url_blog, :format => URI::regexp(%w(http https)), :allow_blank => true

  validates_each :email do |record, attr, value|
    if value.present?
      record.errors.add(attr, 'Invalid email address') unless value.upcase =~ /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/\
    else
      record.errors.add(attr, 'Please provide an email address')
    end
  end

  geocoded_by :location
  after_validation :geocode

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
      :url => "/system/affiliate_logo/:hash.:extension",
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
      affiliate = Affiliate.new(:name => 'Energyfolks', :url => 'https://www.energyfolks.com/', :location => 'Oakland, CA', :short_name => 'energyfolks')
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
    member = Membership.where({user_id: user.id, affiliate_id: self.id, approved: true}).first()
    return member.present?
  end

  def admin?(user, level = Membership::ADMINISTRATOR)
    member = Membership.where({user_id: user.id, affiliate_id: self.id, approved: true}).where("admin_level >= #{level}").first()
    return member.present?
  end

end