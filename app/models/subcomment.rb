class Subcomment < ActiveRecord::Base
  belongs_to :parent_comment, :class_name => "Comment", :foreign_key => "comment_id"
  belongs_to :user
  belongs_to :affiliate

  default_scope order('created_at ASC')

  validates_presence_of :comment
  attr_accessible :comment_id, :affiliate_id, :user_id, :comment, :user_name
end
