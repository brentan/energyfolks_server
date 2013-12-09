class EmailSettingsToken < ActiveRecord::Base

  belongs_to :user
  validates_presence_of :user

  before_create :set_token_details

  def update_token
    self.last_user_at =  Time.now.to_s(:db)
    self.increment!(:use_count)
    self.save
  end

  private

  def set_token_details
    self.expires_at = 30.days.from_now
    self.token = SecureRandom.urlsafe_base64
    self.use_count = 0
  end

end