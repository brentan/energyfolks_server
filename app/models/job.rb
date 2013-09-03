class Job < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_jobs
  has_many :affiliates_jobs, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'JobsVersion',:dependent => :destroy

  default_scope order('created_at DESC')

  FULL_TIME = 1
  PART_TIME = 2
  TEMPORARY = 3
  ONE_TIME = 4

  VERSION_CONTROLLED = %w(name employer html job_type logo_file_name logo_content_type logo_file_size logo_updated_at how_to_apply)
  include MixinEntity

  acts_as_locatable
  acts_as_moderatable
  acts_as_taggable

  accepts_nested_attributes_for :affiliates_jobs, :allow_destroy => true

  validates_presence_of :name, :employer, :location, :job_type, :html, :how_to_apply

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :url => "/system/logos/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :logo,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }

  attr_accessible :name, :employer, :location, :html, :how_to_apply, :job_type, :logo, :affiliates_jobs_attributes, :last_updated_by
end