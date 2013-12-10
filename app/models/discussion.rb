class Discussion < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_discussions
  has_many :affiliates_discussions, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'DiscussionsVersion',:dependent => :destroy

  after_save :update_comment_details
  before_create :update_now

  default_scope order('last_comment_at DESC')

  VERSION_CONTROLLED = %w(name html attachment_file_name attachment_content_type attachment_file_size attachment_updated_at)
  include MixinEntity

  acts_as_moderatable
  acts_as_taggable

  accepts_nested_attributes_for :affiliates_discussions, :allow_destroy => true

  validates_presence_of :name, :html

  has_attached_file :attachment, {
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//attachments/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :attachment,
                       :content_type => { :content_type => /^(text|image|application\/pdf|application\/x\-pdf|application\/ms|application\/vnd\.ms|application\/vnd\.openxmlformats|application\/x\-ms).*/ }, #TODO: More content types (pdf, word, excel)
                       :size => { :in => 0..26.megabytes }

  attr_accessible :name, :html, :attachment, :affiliates_discussions_attributes, :last_updated_by

  def self.date_column
    'last_comment_at'
  end
  private
  def update_comment_details
    CommentDetail.update(self.comment_hash, self.name, self.static_url)
  end
  def update_now
    self.last_comment_at = Time.now()
  end

end