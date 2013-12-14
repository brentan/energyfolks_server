class ThirdPartyLogin < ActiveRecord::Base
  belongs_to :user
  attr_accessible :service, :user_id, :token, :secret
  scope :linkedin, where(:service => 'linkedin')

  def self.update(user, service, token, secret)
    self.where({user_id: user.id, service: service}).all.each { |e| e.destroy }
    self.create({user_id: user.id, service: service, token: token, secret: secret })
  end
end