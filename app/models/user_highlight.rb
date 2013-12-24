class UserHighlight < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :user

  attr_accessible :user_id, :entity


end