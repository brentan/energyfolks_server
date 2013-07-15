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
  before_create :notify_admins

  def self.is_admin?(user, affiliate, level)
    member = self.find_by_user_id_and_affiliate_id(user.id, affiliate.id)
    return false if member.blank?
    return false unless member.approved?
    return true if member.admin_level >= level
    return false
  end

  def self.is_member?(user, affiliate)
    member = self.find_by_user_id_and_affiliate_id(user.id, affiliate.id)
    return false if member.blank?
    return false unless member.approved?
    return true
  end

  def set_approval_flag
    self.approved = true if self.affiliate.open == 1
  end

  def notify_admins
    return if self.affiliate.open == 1
    # Find the list of admins for this group and ping them
    # TODO!
  end

end