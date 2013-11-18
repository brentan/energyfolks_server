class CommentSubscriber < ActiveRecord::Base
  belongs_to :user

  attr_accessible :comment_hash, :user_id

  def self.subscribe(hash, user)
    self.find_or_create_by_comment_hash_and_user_id(hash, user.id)
  end
  def self.unsubscribe(hash, user)
    self.where(comment_hash: hash, user_id: user.id).all.each { |e| e.destroy }
  end
  def self.subscribed?(hash, user)
    self.where(comment_hash: hash, user_id: user.id).count > 0
  end
end
