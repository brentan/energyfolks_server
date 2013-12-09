class Email < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  before_create :set_token_details

  attr_accessible :user_id

  def mark_read
    return if self.opened?
    self.opened = true
    self.open_date = Time.now()
    self.save!
  end

  private

  def set_token_details
    self.token = SecureRandom.urlsafe_base64
  end

end