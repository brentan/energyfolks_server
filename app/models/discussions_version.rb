class DiscussionsVersion < ActiveRecord::Base
  belongs_to :discussion, :foreign_key => :element_id
  default_scope order('version_number DESC')

  has_attached_file :attachment, {
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//attachments_v/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }

  Discussion::VERSION_CONTROLLED.each do |r|
    attr_accessible r
  end
end