class EventsVersion < ActiveRecord::Base
  belongs_to :event, :foreign_key => :element_id
  default_scope order('version_number DESC')

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :path => "#{Rails.root}/public/system/logos_events_v/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }

  Event::VERSION_CONTROLLED.each do |r|
    attr_accessible r
  end
end