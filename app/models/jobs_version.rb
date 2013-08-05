class JobsVersion < ActiveRecord::Base
  belongs_to :job, :foreign_key => :element_id

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :url => "/system/logos/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }

  Job::VERSION_CONTROLLED.each do |r|
    attr_accessible r
  end
end