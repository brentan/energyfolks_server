class Comment < ActiveRecord::Base
  has_many :subcomments, :dependent => :destroy
  belongs_to :user
  belongs_to :affiliate

  before_save :sanitize
  before_destroy :remove_details
  after_create :update_parent
  before_destroy :drop_parent

  default_scope order('created_at DESC')

  validates_presence_of :comment
  attr_accessible :affiliate_id, :name, :unique_hash, :user_id, :comment, :url, :user_name

  def self.get_all_comments(hash)
     Comment.where(unique_hash: hash).includes(:subcomments).all
  end
  def self.count_comments(hash)
    Comment.where(unique_hash: hash).count
  end
  def self.broadcast(user, item)
    item.subscribers.each do |e|
      next if e.user.blank?
      next if e.user_id == user.id
      NotificationMailer.new_comment_or_reply(e.user, item).deliver()
    end
  end

  def subscribers
    CommentSubscriber.where(comment_hash: self.unique_hash).includes(:user).all
  end
  def subscribed?(user)
    CommentSubscriber.subscribed?(self.unique_hash, user)
  end
  def subscribe(user)
    CommentSubscriber.subscribe(self.unique_hash, user)
  end

  def broadcast(user)
    Comment.broadcast(user, self)
  end
  def name
    CommentDetail.where(:comment_hash => self.unique_hash).first.name
  end
  def url
    CommentDetail.where(:comment_hash => self.unique_hash).first.url
  end
  def comment_id
    self.id
  end
  def update_parent
    if self.unique_hash.include?('Discussion_')
      discussion = Discussion.find_by_id(self.unique_hash.gsub('Discussion_','').to_i)
      return if discussion.blank?
      discussion.update_column(:last_comment_at , Time.now())
      discussion.update_column(:total_comments, discussion.total_comments + 1)
      discussion.update_index
    end
  end
  def drop_parent
    if self.unique_hash.include?('Discussion_')
      discussion = Discussion.find_by_id(self.unique_hash.gsub('Discussion_','').to_i)
      return if discussion.blank?
      discussion.update_column(:total_comments, discussion.total_comments - 1)
    end
  end

  private
  def sanitize
    self.comment = ActionController::Base.helpers.sanitize(self.comment.gsub(/(?:\n\r?|\r\n?)/, '<br>'), tags: %w(i u br))
  end
  def remove_details
    CommentDetail.where(:comment_hash => self.unique_hash).all.each {|e| e.destroy }
  end
end
