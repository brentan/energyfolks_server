class Comment < ActiveRecord::Base
  has_many :subcomments, :dependent => :destroy
  belongs_to :user
  belongs_to :affiliate

  default_scope order('created_at ASC')

  validates_presence_of :comment
  attr_accessible :affiliate_id, :unique_hash, :user_id, :comment, :url, :user_name

  def self.get_all_comments(hash)
     Comment.where(unique_hash: hash).includes(:subcomments).all
  end
  def self.count_comments(hash)
    Comment.where(unique_hash: hash).count
  end
end
