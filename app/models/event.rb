class Event < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_events
  has_many :affiliates_events, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'EventsVersion',:dependent => :destroy

  default_scope order('created_at DESC')

  VERSION_CONTROLLED = %w(name host start end html synopsis location location2 logo_file_name logo_content_type logo_file_size logo_updated_at)
  include MixinEntity

  acts_as_locatable
  acts_as_moderatable
  acts_as_taggable

  accepts_nested_attributes_for :affiliates_events, :allow_destroy => true

  validates_presence_of :name, :synopsis, :location, :html
  validates_length_of :synopsis, :maximum => 120

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//logos_events/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :logo,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }

  attr_accessible :name, :host, :location, :location2, :html, :synopsis, :start, :end, :logo, :affiliates_events_attributes, :last_updated_by
end