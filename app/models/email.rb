class Email < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true

  attr_accessible :user_id

  def mark_read
    return if self.opened?
    self.opened = true
    self.open_date = Time.now()
    self.save!
  end
end