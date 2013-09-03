class Bulletin < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_bulletins
  has_many :affiliates_bulletins, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'BulletinsVersion',:dependent => :destroy

  default_scope order('created_at DESC')

  VERSION_CONTROLLED = %w(name html attachment_type attachment_file_name attachment_content_type attachment_file_size attachment_updated_at)
  include MixinEntity

  acts_as_moderatable
  acts_as_taggable

  accepts_nested_attributes_for :affiliates_bulletins, :allow_destroy => true

  validates_presence_of :name, :html

  has_attached_file :attachment, {
      :url => "/system/attachments/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :attachment,
                       :content_type => { :content_type => /^(image).*/ }, #TODO: More content types (pdf, word, excel)
                       :size => { :in => 0..10.megabytes }

  attr_accessible :name, :html, :attachment, :affiliates_bulletins_attributes, :last_updated_by
end