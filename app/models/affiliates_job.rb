class AffiliatesJob < ActiveRecord::Base
  belongs_to :affiliate
  belongs_to :job
  scope :waiting, where("admin_version > approved_version")

  attr_accessible :job_id, :affiliate_id, :approved_version, :admin_version, :broadcast, :user_broadcast

  def entity_id
    self.job_id
  end

  def approved?
    (self.approved_version == self.admin_version) && (self.approved_version > 0)
  end

  def reason
    return nil if self.approved_version == 0
    return "recent updates"
  end

end