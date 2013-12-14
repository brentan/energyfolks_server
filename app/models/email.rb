class Email < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  before_create :set_token_details

  attr_accessible :user_id, :entity_id, :entity_type, :entity

  def mark_read
    return if self.opened?
    self.opened = true
    self.open_date = Time.now()
    self.save!
    self.entity.mark_read if self.entity.present? && self.entity.instance_of?(Digest)
  end

  private

  def set_token_details
    self.token = SecureRandom.urlsafe_base64
  end

end