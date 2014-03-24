class Donation < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :user

  attr_accessible :user_id, :entity_type, :entity_id, :entity, :amount, :stripe_id, :card_type, :last4

end