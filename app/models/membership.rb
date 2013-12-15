class Membership < ActiveRecord::Base

  attr_accessible :approved, :admin_level, :moderation_emails, :user_id, :affiliate_id, :reason

  scope :approved, where(:approved => true)
  scope :waiting, where(:approved => false)

  belongs_to :affiliate
  belongs_to :user

  # Admin levels
  USER = 0          # No special rights
  CONTRIBUTOR = 1   # Can post without moderation, wordpress contributor
  AUTHOR = 2        # Can post without moderation, wordpress author
  EDITOR = 3        # Can moderate posts, wordpress editor
  ADMINISTRATOR = 4 # Full rights to assign other admins

  before_save :set_approval_flag


  def set_approval_flag
    if self.affiliate.open == 1
      self.approved = true
      self.broadcast = true
    end
  end

  def entity_id
    self.user_id
  end

end