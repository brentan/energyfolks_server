class Donation < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :user
  default_scope order('created_at DESC')

  attr_accessible :user_id, :entity_type, :entity_id, :entity, :amount, :stripe_id, :card_type, :last4


  def refund
    require 'stripe'
    Stripe.api_key = SITE_SPECIFIC['stripe']['private']
    begin
      charge = Stripe::Charge.retrieve(self.stripe_id)
      charge.refund
      return true
    rescue
      return false
    end
  end

end