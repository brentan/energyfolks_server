class AffiliatesBlog < ActiveRecord::Base
  belongs_to :affiliate
  belongs_to :blog
  scope :waiting, where("(admin_version > approved_version) AND awaiting_edit = 0")

  attr_accessible :blog_id, :affiliate_id, :approved_version, :admin_version, :broadcast, :user_broadcast, :awaiting_edit

  def entity_id
    self.blog_id
  end

  def approved?
    (self.approved_version == self.admin_version) && (self.approved_version > 0)
  end

  def reason
    return nil if self.approved_version == 0
    return "recent updates"
  end

end