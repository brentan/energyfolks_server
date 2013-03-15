class UserLoginHash < ActiveRecord::Base
  before_create :set_hash
  attr_accessible :user_id
  belongs_to :user

  def self.find_user_by_hash(login_hash)
    login_hash = self.find_by_login_hash(login_hash)
    return login_hash.user if login_hash.present? && login_hash.user.present? && ((Time.now.utc - login_hash.created_at) < 10.seconds)
  end

  def set_hash
    i = 0
    temp_hash = rand(1000000).to_s + Time.now.to_s + 'EnergyFolksSalt'
    while i < 4 do
      temp_hash = Digest::SHA1.hexdigest(temp_hash + User::ITOA64)
      i += 1
    end
    self.login_hash = temp_hash
  end
end