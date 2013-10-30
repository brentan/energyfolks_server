class BulletinsVersion < ActiveRecord::Base
  belongs_to :bulletin, :foreign_key => :element_id
  default_scope order('version_number DESC')

  has_attached_file :attachment, {
      :path => "#{Rails.root}/public/system/attachments_v/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }

  Bulletin::VERSION_CONTROLLED.each do |r|
    attr_accessible r
  end
end