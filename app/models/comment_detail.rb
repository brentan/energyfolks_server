class CommentDetail < ActiveRecord::Base

  attr_accessible :comment_hash, :name, :url

  def self.update(hash, name, url)
    item = self.find_or_create_by_comment_hash(hash)
    item.name = name
    item.url = url
    item.save!
  end
end
