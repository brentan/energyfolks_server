class GoogleEmail < ActiveRecord::Base
  belongs_to :user
  attr_accessible :address, :domain

  DOMAINS = %w(energyfolks.com sparkcleanenergy.org)

  def email_address
    "#{self.address}@#{self.domain}"
  end

end