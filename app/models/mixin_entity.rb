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
      belongs_to :affiliate
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
      # Date range options
      # Search term option
      # highlighted only option
      # geographic option
      # TODO: IF AFFILIATE IS NIL, ALSO NEED TO DO THINGS USER IS ABLE TO SEE! Should be there, isnt working...
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
        all_attributes = item.attributes
        all_attributes[:logo] = item.respond_to?(:logo) && item.logo.present? && !item.instance_of?(Bulletin)
        all_attributes[:logo_url] = item.logo.url(:thumb) if item.respond_to?(:logo) && item.logo.present? && !item.instance_of?(Bulletin)
        all_attributes[:highlighted] = item.highlighted?(affiliate)
        new_list << all_attributes
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

  def broadcast(version_control =  true)
    if version_control
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
        v = self.class.version_table.where(:entity_id => self.id, :version_number => self.current_version).first
        self.class::VERSION_CONTROLLED.each do |item|
          v.send("#{item}=", self.send(item))
        end
        v.save!
      end
    end
    # EF control: If this is a 'to all' post, we need to also add in affiliates that override EF approval
    if self.affiliate_join.map{|a| a.affiliate_id}.include?(0)
      all_current = self.affiliate_join.map{|a| a.affiliate_id}
      Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
        self.affiliate_join.create({:affiliate_id => a.id, :approved_version => 0, :admin_version => self.current_version, :broadcast => false, :user_broadcast => false}) unless all_current.include?(a.id)
        all_current << a.id unless all_current.include?(a.id)
      end
      # If current user is posting to 'all' but from a group that does not moderate these posts, approve immediately for this group
      # If current user is posting to 'all' but is posting from a group that they are an admin for, immediately approve for this group
      if (self.affiliate_id > 0) && self.affiliate.admin?(self.last_update, Membership::CONTRIBUTOR, self.method_name)
        # Add group to affiliate_join list, next sections will adjust broadcast and approved_version based on current user rights
        self.affiliate_join.create({:affiliate_id => self.affiliate_id, :approved_version => 0, :admin_version => self.current_version, :broadcast => false, :user_broadcast => false}) unless all_current.include?(self.affiliate_id)
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
          i.awaiting_edit = false
          i.approved_versions += ",#{i.admin_version}"
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
          i.awaiting_edit = false
          i.approved_versions += ",#{i.admin_version}"
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
        # Find all users, minus users in groups that do their own super moderation
        recipients = User.select(:id).where(verified: true).all.map { |r| r.id }
        Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
          # TODO: Base this on PRIMARY affiliation, not any affiliation
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
        next if Email.where(entity_type: self.class.name, entity_id: self.id, user_id: user_id).count > 0
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
    return self.highlights.where(:affiliate_id => affiliate.id.present? ? affiliate.id : 0).count > 0
  end

  def version_id(affiliate, user)
    return self.current_version if self.is_editable?(user)
    affiliates = user.present? ? user.memberships.approved.map { |m| m.affiliate_id } : []
    affiliates << affiliate.id if affiliate.present? && affiliate.id.present?
    affiliates << 0 unless affiliate.present? && (affiliate.send("moderate_#{self.method_name}") == Affiliate::ALL)
    v = self.affiliate_join.where("affiliate_id IN (#{affiliates.compact.join(", ")})").order(:approved_version).last
    return v.present? ? v.approved_version : 0
  end

  def last_updated_at(affiliate, user, version = 0)
    version(affiliate, user, version).updated_at
  end
  def last_update
    user = User.find_by_id(self.last_updated_by)
    return user.present? ? user : User.new(first_name: 'Unknown', last_name: 'user')
  end
  def user
    user = User.find_by_id(self.user_id)
    return user.present? ? user : User.new(first_name: 'Unknown', last_name: 'user')
  end

  def version(affiliate, user, version = 0)
    id = version > 0 ? version : self.version_id(affiliate, user)
    return nil if id == 0
    return self.class.version_table.find_by_entity_id_and_version_number(self.id, id)
  end

  # This method is used instead of normal getters because some methods are version controlled, this takes care of it
  def get(method, affiliate, user, version = 0)
    if self.class::VERSION_CONTROLLED.include?(method)
      v = self.version(affiliate, user, version)
      return v.present? ? v.send(method) : nil
    else
      return self.send(method)
    end
  end

  # Will replace current item methods with current version data (or version set in version input)
  def version_control(user, affiliate, version = 0)
    # Will transform data into current version based on current user
    self.class.column_names.each do |cn|
      next if %w(id created_at updated_at).include?(cn)
      self.send("#{cn}=",self.get(cn, affiliate, user, version))
    end
  end

  # When saving a new version, should we increment the version number?  Only needed if someone has approved current version
  def increment_version?
    return true if self.current_version == 0
    total_approved = self.affiliate_join.where(:approved_version => self.current_version).count
    return true if total_approved > 0
    return false
  end

  # highlighting, approving, rejecting workflow
  def toggle_highlight(current_user, affiliate)
    if affiliate.id.present?
      if current_user.present? && affiliate.admin?(current_user, Membership::EDITOR)
        if self.highlighted?(affiliate)
          self.highlights.where(affiliate_id: affiliate.id).first.destroy
          return "Highlight Removed"
        else
          Highlight.create({affiliate_id: affiliate.id, entity: self})
          return "Highlight Added"
        end
      end
    else
      if current_user.present? && current_user.admin?
        if self.highlighted?(affiliate)
          self.highlights.where(affiliate_id: 0).first.destroy
          return "Highlight Removed"
        else
          Highlight.create({affiliate_id: 0, entity: self})
          return "Highlight Added"
        end
      end
    end
    return "You are not authorized here"
  end

  def approve(current_user, affiliate, highlight = false)
    if affiliate.id.present?
      if current_user.present? && affiliate.admin?(current_user, Membership::EDITOR)
        join_item = self.affiliate_join.where(affiliate_id: affiliate.id).first
        return "Something went wrong" if join_item.blank?
        join_item.approved_version = self.current_version
        join_item.admin_version = self.current_version
        join_item.awaiting_edit = false
        join_item.approved_versions += ",#{self.current_version}"
        join_item.save!
        NotificationMailer.delay.item_approved(self, affiliate)
        Highlight.create({affiliate_id: affiliate.id, entity: self}) if highlight && !self.highlighted?(affiliate)
        self.reload
        self.user_broadcast.delay(:run_at => 15.minutes.from_now)
        return "This item has been approved#{highlight ? 'and highlighted' : ''}"
      end
    else
      if current_user.present? && current_user.admin?
        join_item = self.affiliate_join.where(affiliate_id: 0).first
        return "Something went wrong" if join_item.blank?
        join_item.approved_version = self.current_version
        join_item.admin_version = self.current_version
        join_item.awaiting_edit = false
        join_item.approved_versions += ",#{self.current_version}"
        join_item.save!
        NotificationMailer.delay.item_approved(self, affiliate)
        Highlight.create({affiliate_id: 0, entity: self}) if highlight && !self.highlighted?(affiliate)
        self.reload
        self.user_broadcast.delay(:run_at => 15.minutes.from_now)
        return "This item has been approved#{highlight ? 'and highlighted' : ''}"
      end
    end
    return "You are not authorized here"
  end
end