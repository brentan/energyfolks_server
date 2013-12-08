class MarkRead < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :user
  has_many :mark_read_actions, :dependent => :destroy

  scope :registered, where('user_id IS NOT NULL')
  scope :anonymous, where('user_id IS NULL')

  attr_accessible :ip, :user_id, :entity, :entity_id, :entity_type

  def self.total_reads(results)
    results.blank? ? MarkReadAction.where("id = -1") : MarkReadAction.where("mark_read_id IN (#{results.map {|m| m.id }.join(',')})")
  end

  def self.by_affiliate(affiliate)
    if affiliate.id.present?
      return self.select('DISTINCT mark_reads.id').joins(:mark_read_actions).where(:mark_read_actions => {:affiliate_id => affiliate.id})
    else
      return self.select('DISTINCT mark_reads.id').joins(:mark_read_actions).where('mark_read_actions.affiliate_id IS NULL')
    end
  end
end
