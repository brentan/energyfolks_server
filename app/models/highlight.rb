class Highlight < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :affiliate

  attr_accessible :affiliate_id, :entity


end