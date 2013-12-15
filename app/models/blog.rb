class Blog < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_blogs
  has_many :affiliates_blogs, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'BlogsVersion',:dependent => :destroy

  after_save :update_comment_details
  before_save :update_lat_lng
  before_destroy :remove_comments

  default_scope order('created_at DESC').where(frozen_by_wordpress: false)

  VERSION_CONTROLLED = %w(name html attachment_file_name attachment_content_type attachment_file_size attachment_updated_at)
  include MixinEntity

  acts_as_moderatable
  acts_as_taggable
  geocoded_by :name # associate with geocode to use activerecord queries, but don't actually geocode based on location

  accepts_nested_attributes_for :affiliates_blogs, :allow_destroy => true

  validates_presence_of :name, :html
  validate :allowed_poster

  has_attached_file :attachment, {
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//attachments/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFsdgfsdgfsdhgsgfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :attachment,
                       :content_type => { :content_type => /^(text|image|application\/pdf|application\/x\-pdf|application\/ms|application\/vnd\.ms|application\/vnd\.openxmlformats|application\/x\-ms).*/ },
                       :size => { :in => 0..26.megabytes }

  attr_accessible :name, :html, :attachment, :affiliates_blogs_attributes, :digest, :last_updated_by, :latitude, :longitude, :affiliate_id, :announcement, :last_updated_by, :url, :wordpress_id, :user_id, :frozen_by_wordpress

  def comment_hash
    self.affiliate_id.present? && self.wordpress_id.present? ? "WORDPRESS_HASH_#{self.affiliate_id}_#{self.wordpress_id}" : "#{self.entity_name}_#{self.id}"
  end
  def author_name
    return 'Unknown user' if self.user.blank?
    "#{self.user.first_name} #{self.user.last_name}"
  end
  def posted_at
    self.created_at.strftime( "%B %-d, %Y")
  end

  private
  def update_comment_details
    CommentDetail.update(self.comment_hash, self.name, self.static_url)
  end
  def update_lat_lng
    affiliate = Affiliate.find_by_id(self.affiliate_id)
    lat = 37.8044
    lng = -122.2708
    if (self.affiliate_id > 0) && affiliate.present?
      lat = affiliate.latitude if affiliate.latitude.present?
      lng = affiliate.longitude if affiliate.longitude.present?
    end
    self.latitude = lat
    self.longitude = lng
  end

  def allowed_poster
    begin
      user = User.find(self.user_id)
      affiliate = Affiliate.find_by_id(self.affiliate_id)
      errors.add(:name, "You are not authorized to create new blog posts" ) if !user.admin? && !affiliate.admin?(user, Membership::AUTHOR)
    rescue
      errors.add(:name, "You are not authorized to create new blog posts" )
    end
  end
  def remove_comments
    Comment.where(:unique_hash => self.comment_hash).all.each { |e| e.destroy }
    CommentDetail.where(:comment_hash => self.comment_hash).all.each { |e| e.destroy }
    CommentSubscriber.where(:comment_hash => self.comment_hash).all.each { |e| e.destroy }
  end

end