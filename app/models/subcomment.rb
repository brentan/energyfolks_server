class Subcomment < ActiveRecord::Base
  belongs_to :parent_comment, :class_name => "Comment", :foreign_key => "comment_id"
  belongs_to :user
  belongs_to :affiliate
  before_save :sanitize
  after_create :update_parent
  before_destroy :drop_parent

  default_scope order('created_at ASC')

  validates_presence_of :comment
  attr_accessible :comment_id, :affiliate_id, :user_id, :comment, :user_name


  def subscribers
    self.parent_comment.subscribers
  end
  def subscribed?(user)
    self.parent_comment.subscribed?(user)
  end
  def subscribe(user)
    self.parent_comment.subscribe(user)
  end
  def broadcast(user)
    Comment.broadcast(user, self)
  end
  def name
    self.parent_comment.name
  end
  def url
    self.parent_comment.url
  end
  def unique_hash
    self.parent_comment.unique_hash
  end

  private
  def sanitize
    self.comment = ActionController::Base.helpers.sanitize(self.comment.gsub(/(?:\n\r?|\r\n?)/, '<br>'), tags: %w(i u br))
  end
  def update_parent
    self.parent_comment.update_parent
  end
  def drop_parent
    self.parent_comment.drop_parent
  end
end
