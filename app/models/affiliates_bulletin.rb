class AffiliatesBulletin < ActiveRecord::Base
  belongs_to :affiliate
  belongs_to :bulletin
  scope :waiting, where("(admin_version > approved_version) AND awaiting_edit = 0")

  attr_accessible :bulletin_id, :affiliate_id, :approved_version, :admin_version, :broadcast, :user_broadcast

  def entity_id
    self.bulletin_id
  end

  def approved?
    (self.approved_version == self.admin_version) && (self.approved_version > 0)
  end

  def reason
    return nil if self.approved_version == 0
    return "recent updates"
  end

end