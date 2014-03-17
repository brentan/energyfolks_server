class StripeToken < ActiveRecord::Base
  belongs_to :user

  attr_accessible :user_id, :token, :last4, :card_type

  def self.new_customer(user, token, type, last4)
    require 'stripe'
    Stripe.api_key = SITE_SPECIFIC['stripe']['private']
    customer = Stripe::Customer.create(
        :card => token,
        :description => "#{user.name} (#{type} #{last4})",
        :email => user.email
    )
    return customer.id
  end

  def charge(amount, entity = nil)
    require 'stripe'
    Stripe.api_key = SITE_SPECIFIC['stripe']['private']

    begin
      response = Stripe::Charge.create(
          :amount => (amount.to_i*100),
          :currency => 'usd',
          :customer => self.token,
          :description => entity.present? ? "Donation for #{entity.method_name} id #{entity.id} (#{entity.name})" : "General Donation",
          :statement_description => 'Donation',
          :metadata => {
              user: self.user_id,
              email: self.user.email,
              entity_type: entity.present? ? entity.method_name : '',
              entity_id: entity.present? ? entity.id : ''
          }
      )
      donation = Donation.create!(
          :user_id => self.user_id,
          :entity => entity,
          :amount => amount,
          :stripe_id => response.id
      )
      UserMailer.donation_complete(self.user_id, donation).deliver()
      return true, 'Thank you for your donation!'
    rescue Stripe::CardError => e
      body = e.json_body
      err  = body[:error]
      return false, err[:message]
    end
    return false, 'There was a server error.  Please try your donation at a later date.'

  end

end