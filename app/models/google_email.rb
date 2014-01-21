class GoogleEmail < ActiveRecord::Base
  belongs_to :user
  attr_accessible :address, :domain

  DOMAINS = %w(energyfolks.com sparkcleanenergy.org)

  def self.domains
    out = []
    DOMAINS.each_with_index do |v, i|
      out << [v, i]
    end
    return out
  end

  def email_address
    "#{self.address}@#{DOMAINS[self.domain]}"
  end

end