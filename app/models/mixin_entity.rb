module MixinEntity

  def self.included(base)
    base.extend(ClassMethods)
  end

  # To be overwritten by each individual class
  # Requires the presence of constant VERSION_CONTROLLED which lists methods under version control

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
    self.send("affiliates_#{self.class.name.downcase.pluralize}")
  end

  def version_join
    self.send("#{self.class.name.downcase.pluralize}_versions")
  end

  def extra_info(join_item)

  end

  def entity_type
    "#{entity_name} post"
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
    def acts_as_taggable
      has_many :tags_entities, as: :entity, :dependent => :destroy
      has_many :highlights, as: :entity, :dependent => :destroy
      has_many :tags, :through => :tags_entities
      attr_accessible :raw_tags
      attr_writer :raw_tags
    end

    def total_needing_moderation(affiliate)
      self.join_table.waiting.where(affiliate_id: affiliate.id.present? ? affiliate.id : 0, broadcast: true)
    end

    def needing_moderation(user, affiliate)
      moderation = []
      if affiliate.id.present?
        user.memberships.approved.each do |a|
          moderation += self.total_needing_moderation(a.affiliate).all if (a.affiliate_id == affiliate.id) && a.affiliate.admin?(user, Membership::EDITOR)
        end
      else
        moderation += self.total_needing_moderation(affiliate).all if user.admin?
      end
      moderation = moderation.map { |m| m.entity_id }.compact
      return self.where(id: moderation).all
    end

    def get_mine(user)
      self.where(user_id: user.id).all
    end

    def find_all_visible(user, affiliate = nil, page=0, per_page=20)
      affiliates = user.present? ? user.memberships.approved.map { |a| a.id } : []
      affiliates << affiliate.id if affiliate.present? && affiliate.id.present?
      affiliates << 0 unless affiliate.present? && (affiliate.send("moderate_#{self.new().method_name}") == Affiliate::ALL)
      affiliates.compact!
      select = self.column_names.map { |cn| "#{self.name.downcase.pluralize}.#{cn}"}
      items = self.offset(page * per_page).limit(per_page).select(select)
      items = items.joins("affiliates_#{self.name.downcase.pluralize}".to_sym)
      items = items.where("affiliates_#{self.name.downcase.pluralize}.affiliate_id IN (#{affiliates.join(', ')})")
      items = items.where("affiliates_#{self.name.downcase.pluralize}.approved_version > 0")
      items = items.all
      return version_control(user, affiliate, items)
    end

    def version_control(user, affiliate, items)
      # Will transform data into current version based on current user
      new_list = []
      items.each do |item|
        self.column_names.each do |cn|
          next if %w(id created_at updated_at).include?(cn)
          item.send("#{cn}=",item.get(cn, affiliate, user))
        end
        new_list << item.attributes
      end
      return new_list
    end

    def join_table
      "Affiliates#{self.name.capitalize}".constantize
    end

    def version_table
      "#{self.name.capitalize.pluralize}Version".constantize
    end
  end

  # Common Methods

  def raw_tags
    rt = @raw_tags
    rt = self.tags.map {|t| t.name.capitalize}.join(",") if rt.blank?
    return rt
  end

  def last_update
    User.find_by_id(self.last_updated_by)
  end

  def broadcast
    # Version control: Decide if we need to increment versions or if we can just save
    if self.increment_version?
      v = self.class.version_table.new
      self.class::VERSION_CONTROLLED.each do |item|
        v.send("#{item}=", self.send(item))
      end
      version = self.current_version + 1
      self.update_column(:current_version, version)
      v.version_number = version
      v.entity_id = self.id
      v.save!
      self.affiliate_join.each do |i|
        i.broadcast = false if i.admin_version == i.approved_version
        i.admin_version = version
        i.save(:validate => false)
      end
    else
      v = self.class.version_table.where(:element_id => self.id, :version_number => self.current_version).first
      self.class::VERSION_CONTROLLED.each do |item|
        v.send("#{item}=", self.send(item))
      end
      v.save!
    end
    # EF control: If this is a 'to all' post, we need to also add in affiliates that override EF approval
    if self.affiliate_join.map{|a| a.affiliate_id}.include?(0)
      all_current = self.affiliate_join.map{|a| a.affiliate_id}
      Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
        self.affiliate_join.build({:affiliate_id => a.id, :approved_version => 0, :admin_version => self.current_version, :broadcast => false, :user_broadcast => false}) unless all_current.include?(a.id)
      end
    end
    # Broadcast to admins for approval
    call_user_broadcast = false
    self.affiliate_join.where(broadcast: false).each do |i|
      if i.affiliate_id > 0
        # Check if this edit was made by an admin.  If so, mark as approved immediately
        # Also check if this affiliate simply allows anyone to post, and if so, auto-approve
        if i.affiliate.admin?(self.last_update, Membership::CONTRIBUTOR, self.method_name)
          i.broadcast = true
          i.approved_version = i.admin_version
          i.save(:validate => false)
          call_user_broadcast = true
          next
        end
        recipients = i.affiliate.admins(Membership::EDITOR, true)
        affiliate = Affiliate.find_by_id(i.affiliate_id)
      else
        # Check if this edit was made by an admin.  If so, mark as approved immediately
        if self.last_update.admin?
          i.broadcast = true
          i.approved_version = i.admin_version
          i.save(:validate => false)
          call_user_broadcast = true
          next
        end
        recipients = User.find_by_admin(true)
        affiliate = Affiliate.find_by_id(0)
      end
      NotificationMailer.delay(:run_at => 15.minutes.from_now).awaiting_moderation(recipients, affiliate, self, i) if recipients.length > 0
      i.broadcast = true
      i.save(:validate => false)
    end
    self.user_broadcast.delay(:run_at => 15.minutes.from_now) if call_user_broadcast
  end

  def user_broadcast
    # TODO: This should be called by the 'approve' method
    # This method takes some time...it is meant to be called by a 'delay' action, not directly
    self.affiliate_join.where(user_broadcast: false).where("approved_version > 0").each do |i|
      if i.affiliate_id == 0
        recipients = User.select(:id).where(verified: true).all.map { |r| r.id }
        Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
          recipients = recipients - a.memberships.approved.map { |r| r.user_id }
        end
      else
        recipients = i.affiliate.memberships.approved.map { |r| r.user_id }
      end
      recipients.each do |user_id|
        u = User.find_by_id_and_verified(user_id, true)
        next if u.blank?
        next unless u.subscription.send("#{self.method_name}?")
        if ((self.entity_name == 'Job') || (self.entity_name == 'Event')) && u.geocoded?
          # geocode test
          if self.geocoded?
            distance = u.subscription.send("#{self.class.name}_radius")
            next if (distance > 0) && (self.distance_from([u.latitude, u.longitude]) > distance)
          else
            next if u.subscription.send("#{self.class.name}_radius") > 0
          end
        end
        next if Email.find_by_entity_type_and_entity_id_and_user_id(self.class.name, self.id, user_id).count > 0
        e = Email.new(user_id: user_id)
        e.entity = self
        e.save!
        NotificationMailer.entity(User.find_by_id(user_id), self).deliver()    # TODO: Create the mailer
      end
      i.user_broadcast = true
      i.save(:validate => false)
    end
  end

  def is_visible?(affiliate, user)
    return true if self.version_id(affiliate, user) > 0
  end

  def is_editable?(user)
    return false if user.blank?
    return true if self.user_id == user.id
    return true if user.admin?
    self.affiliate_join.each do |a|
      return true if a.admin?(user, Membership::EDITOR)
    end
    return false
  end

  def highlighted?(affiliate)
    return self.highlights.where(:affiliate_id => affiliate.id).count > 0
  end

  def version_id(affiliate, user)
    return self.current_version if self.is_editable?(user)
    affiliates = user.present? ? user.memberships.approved.map { |m| m.affiliate_id } : []
    affiliates << affiliate.id if affiliate.present?
    affiliates << 0 unless affiliate.present? && (affiliate.send("moderate_#{self.method_name}") == Affiliate::ALL)
    v = self.affiliate_join.where("affiliate_id IN (#{affiliates.join(", ")})").order(:approved_version).last
    return v.present? ? v.approved_version : 0
  end

  def version(affiliate, user)
    id = self.version_id(affiliate, user)
    return nil if id == 0
    return self.class.version_table.find_by_entity_id_and_version_number(self.id, id)
  end

  # This method is used instead of normal getters because some methods are version controlled, this takes care of it
  def get(method, affiliate, user)
    if self.class::VERSION_CONTROLLED.include?(method)
      v = self.version(affiliate, user)
      return v.present? ? v.send(method) : nil
    else
      return self.send(method)
    end
  end

  # When saving a new version, should we increment the version number?  Only needed if someone has approved current version
  def increment_version?
    return true if self.current_version == 0
    total_approved = self.affiliate_join.where(:approved_version => self.current_version).count
    return true if total_approved > 0
    return false
  end
end