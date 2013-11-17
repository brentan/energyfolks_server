class Comment < ActiveRecord::Base
  has_many :subcomments, :dependent => :destroy
  belongs_to :user

  attr_accessible :hash, :user_id, :comment
end
