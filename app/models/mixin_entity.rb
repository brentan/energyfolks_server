module MixinEntity

  def self.included(base)
    base.extend(ClassMethods)
  end

  # To be overwritten by each individual class

  def path
    "/#{self.method_name}/#{self.id}"
  end

  def method_name
    self.class.name.pluralize.downcase
  end

  def entity_name
    self.class.name.capitalize
  end

  def affiliate_join

  end

  def extra_info(join_item)

  end

  def entity_type
    "post"
  end

  # Class Methods

  module ClassMethods
    def acts_as_locatable
      #acts_as_mappable
      geocoded_by :location
      after_validation :geocode
    end
    def acts_as_moderatable
      after_save :broadcast
    end

    def total_needing_moderation(affiliate)
      join_table.waiting.where(affiliate_id: affiliate.id, broadcast: true)
    end

    def needing_moderation(user)
      moderation = []
      user.memberships.approved.each do |a|
        moderation += self.total_needing_moderation(a.affiliate).all if a.affiliate.admin?(user, Membership::EDITOR)
      end
      # TODO: Somehow super admin moderation count.
      moderation = moderation.map { |m| m.entity_id }.compact
      return self.where(id: moderation).all
    end

    def join_table

    end
  end

  # Common Methods
  def broadcast
    return if self.respond_to?('verified') && !self.verified?
    self.affiliate_join.where(broadcast: false).each do |i|
      recipients = i.affiliate.admins(Membership::EDITOR, true)
      NotificationMailer.delay.awaiting_moderation(recipients, i.affiliate, self, i) if recipients.length > 0
      i.broadcast = true
      i.save(:validate => false)
    end
  end

  def is_visible?(user)
    # TODO: Write this based on normal entity stuff, different for users
  end
end