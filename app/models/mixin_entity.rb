module MixinEntity

  def self.included(base)
    base.extend(ClassMethods)
  end

  # To be overwritten by each individual class
  # Requires the presence of constant VERSION_CONTROLLED which lists methods under version control

  def path
    "#command=show&parameters=id%3D#{self.id}%26model%3D#{self.class.name.capitalize}"
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
    "#{entity_name.downcase} post"
  end

  def mmddyyyy
    self.created_at.strftime("%m%d%Y")
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
      before_destroy :remove_from_index
    end
    def acts_as_taggable
      has_many :tags_entities, as: :entity, :dependent => :destroy
      has_many :highlights, as: :entity, :dependent => :destroy
      has_many :tags, :through => :tags_entities
      has_many :mark_reads, as: :entity, :dependent => :destroy
      has_many :emails, as: :entity, :dependent => :destroy
      attr_accessible :raw_tags
      attr_writer :raw_tags
    end

    def date_column
      'created_at'
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
      return version_control(user, affiliate, self.where(id: moderation).all)
    end

    def get_mine(user)
      version_control(user, Affiliate.find_by_id(0), self.where(user_id: user.id).all)
    end

    def search(terms, affiliates, options)
      if options[:display] == 'month'
        year = DateTime.now.year
        month = DateTime.now.month
        month += options[:month]
        while month > 12
          year += 1
          month -= 12
        end
        while month < 1
          year -= 1
          month += 12
        end
        pm = month - 1
        py = year
        pd = 22
        if pm == 0
          pm = 12
          py -= 1
        end
        nm = month + 1
        ny = year
        nd = 8
        if nm == 13
          nm = 1
          ny += 1
        end
        if options[:shift]
          if (self.name.downcase.pluralize == 'events') && (DateTime.now.day > 15)
            pd=28
            nd=28
          end
          if (self.name.downcase.pluralize != 'events') && (DateTime.now.day < 15)
            pd=1
            nd=1
          end
        end
      end
      if USE_CLOUDSEARCH # Only on production do we use cloudfront, otherwise build normal SQL query
        begin
          Asari.mode = :production
          asari = Asari.new(AMAZON_CLOUDSEARCH_ENDPOINT)
          asari.aws_region = AMAZON_REGION

          filters = { and: { type: self.new.entity_name, affiliates: affiliates.map {|a| "ss#{a.to_s(27).tr("0-9a-q", "A-Z")}ee" }.join('|') } }
          filters[:and][:date] = (DateTime.new(py, pm, pd).to_i)..(DateTime.new(ny, nm, nd).to_i) if options[:display] == 'month'
          if options[:display] == 'map'
            bounds = options[:bounds].split('_')
            sw = Asari::Geography.degrees_to_int(lat: bounds[0].to_i, lng: bounds[1].to_i)
            ne = Asari::Geography.degrees_to_int(lat: bounds[2].to_i, lng: bounds[3].to_i)
            filters[:and][:lat] = sw[:lat]..ne[:lat]
            filters[:and][:lng] = sw[:lng]..ne[:lng]
          elsif (options[:radius] > 0) && (self.name.downcase.pluralize != 'discussions')
            latlng = Geocoder::Calculations.bounding_box([options[:location_lat], options[:location_lng]], options[:radius]/1000, :units => :km)
            latlng = Asari::Geography.coordinate_box(lat: options[:location_lat], lng: options[:location_lng], meters: options[:radius])
            filters[:and][:lat] = latlng[:lat]
            filters[:and][:lng] = latlng[:lng]
          end
          filters[:and][:date] = 1..options[:visibility] if options[:visibility].present?  # User visibility info stored here
          filters[:and][:date] = (1.day.ago.to_i)..(1.day.ago.to_i*2) if (options[:display] != 'month') && (self.name.downcase.pluralize == 'events')
          filters[:and][:highlights] = "ss#{options[:highlight].to_i.to_s(27).tr("0-9a-q", "A-Z")}ee" if options[:highlight] > 0
          filters[:and][:primary_id] = options[:source] if options[:source] > 0
          filters[:and][:secondary] = options[:tags].join('|') if options[:tags].present? && (options[:tags].length > 0)
          sort = ["date", :desc]
          sort = "primary,secondary,full_text" if terms.length > 0
          sort = ["date", :asc] if(self.name.downcase.pluralize == 'events')
          sort = ["primary", :asc] if(self.name.downcase.pluralize == 'users')

          asari_options = {
              filter: filters,
              rank: sort,
              page_size: %w(month map).include?(options[:display]) ? 10000 : options[:per_page],
              page: %w(month map).include?(options[:display]) ? 1 : (options[:page]+1)
          }
          if terms.present?
            asari_results = asari.search(terms, asari_options)
          else
            asari_results = asari.search(asari_options)
          end
          ids = asari_results.map { |e| self.entity_id_from_search_id(e) }
          select = self.column_names.map { |cn| "#{self.name.downcase.pluralize}.#{cn}"}
          results = ids.length > 0 ? self.select(select).where("id IN (#{ids.join(",")})").order("FIELD(id, #{ids.join(",")})").all : []
          return results, (asari_results.total_pages < asari_results.current_page)
        rescue
          # Fail gracefully...just run as SQL query instead.  Possibly notify sysadmin?
        end
      end
      # no cloudsearch server, so use local search on SQL database.  Note 'terms' search is limited to name column
      more_pages = false
      if self.name.downcase.pluralize == 'users' # User search, this has different SQL syntax!
        items = User.verified.select([:verified, :active, 'users.id', 'users.affiliate_id',:first_name, :last_name, :position, :organization, :avatar_file_name, :avatar_updated_at]).order('last_name, first_name')
        items = items.where('visibility <= ?',options[:visibility])
        items = items.joins(:memberships).where(:memberships => {:approved => true, :affiliate_id => affiliates[0]}) if affiliates[0] > 0
      else
        select = self.column_names.map { |cn| "#{self.name.downcase.pluralize}.#{cn}"}
        items = self.select("DISTINCT #{select.join(', ')}")
        items = items.joins("affiliates_#{self.name.downcase.pluralize}".to_sym)
        items = items.where("affiliates_#{self.name.downcase.pluralize}.affiliate_id IN (#{affiliates.join(', ')})")
        items = items.where("affiliates_#{self.name.downcase.pluralize}.approved_version > 0")
      end
      items = items.offset(options[:page] * options[:per_page]).limit(options[:per_page] + 1) if %w(list stream).include?(options[:display])
      items = items.where(["#{self.name.downcase.pluralize}.start > ?", 1.day.ago]) if (options[:display] != 'month') && (self.name.downcase.pluralize == 'events')
      if terms.present? && self.name.downcase.pluralize == 'users'
        items = items.where("first_name LIKE ? OR last_name LIKE ?","%#{terms}%","%#{terms}%")
      elsif terms.present?
        items = items.where("name LIKE ?","%#{terms}%")
      end
      if options[:display] == 'map'
        bounds = options[:bounds].split('_')
        items = items.where("latitude > ? AND latitude < ? AND longitude > ? AND longitude < ?", bounds[0], bounds[2], bounds[1], bounds[3])
      elsif (self.name.downcase.pluralize != 'discussions') && options[:radius].present? && (options[:radius] > 0)
        items = items.near([options[:location_lat], options[:location_lng]], options[:radius]/1000, :units => :km)
      end
      if options[:tags].present? && (options[:tags].length > 0)
        count = 0
        wherehash = {}
        wherearray = []
        options[:tags].each do |t|
          wherearray << "name = :n#{count}"
          wherehash["n#{count}".to_sym] = t
          count += 1
        end
        tags = Tag.where(wherearray.join(' OR '),wherehash).all.map{ |t| t.id }
        items = items.joins(:tags_entities).where(tags_entities: { tag_id: tags })
      end
      items = items.joins(:highlights).where("highlights.affiliate_id = ?",options[:highlight]) if options[:highlight] > 0
      items = items.where("#{self.name.downcase.pluralize}.affiliate_id = ?", options[:source]) if options[:source] > 0
      if options[:display] == 'month'
        items = items.where(["#{self.name.downcase.pluralize}.#{self.date_column} > ?", DateTime.new(py, pm, pd)]).where(["#{self.name.downcase.pluralize}.#{self.date_column} < ?", DateTime.new(ny, nm, nd)])
      end
      items = items.all
      if %w(list stream).include?(options[:display]) && (items.length == (options[:per_page] + 1))
        items = items[0...-1]
        more_pages = true
      end
      return items, more_pages
    end

    def find_all_visible(user, affiliate = nil, options = {})
      affiliates = user.present? ? user.memberships.approved.map { |a| a.affiliate_id } : []
      affiliates << affiliate.id if affiliate.present? && affiliate.id.present?
      affiliates << 0 unless affiliate.present? && (affiliate.send("moderate_#{self.new().method_name}") == Affiliate::ALL)
      affiliates.compact!
      items, more_pages = self.search(options[:terms],affiliates, options)
      return version_control(user, affiliate, items), more_pages
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
        all_attributes[:logo] = item.respond_to?(:logo) && item.logo.present?
        all_attributes[:logo_url] = item.logo.url(:thumb) if item.respond_to?(:logo) && item.logo.present?
        all_attributes[:mmddyyyy] = item.mmddyyyy if item.respond_to?(:mmddyyyy)
        all_attributes[:posted_at] = item.posted_at if item.respond_to?(:posted_at)
        all_attributes[:author_name] = item.author_name if item.respond_to?(:author_name)
        if item.respond_to?(:start_time)
          all_attributes[:start_time] = item.start_time
          all_attributes[:end_time] = item.end_time
          all_attributes[:start_date] = item.start_date
          all_attributes[:end_date] = item.end_date
          all_attributes[:tz] = item.tz
        end
        all_attributes[:comments] = item.comment_count if (item.instance_of?(Discussion) || item.instance_of?(Blog))
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
    def entity_id_from_search_id(num)
      num.split('_').last.to_i
    end
    def reindex_all
      return unless USE_CLOUDSEARCH
      begin
        Asari.mode = :production
        asari = Asari.new(AMAZON_CLOUDSEARCH_ENDPOINT)
        asari.aws_region = AMAZON_REGION
        to_remove = asari.search({filter: {and: {date: 1..(1.day.ago.to_i*2), type: self.new.entity_name}},page_size: 100000})
        to_remove = to_remove.map { |e| e }
      rescue
      end
      to_index = self.all
      to_index.each do |i|
        i.update_index
      end
      begin
        to_remove = to_remove - (to_index.map { |t| t.search_index_id})
        to_remove.each do |e|
          asari.remove_item(e)
        end
      rescue
      end
    end
  end

  # Search and indexing methods
  def search_index_id
    # Returns a unique id for use in the index.  Id must be unique for every element from all entity types
    "#{self.class.name.downcase}_#{self.id}"
  end

  def to_index
    begin
      latlng = Asari::Geography.degrees_to_int(lat: self.latitude, lng: self.longitude)
    rescue
      latlng = {lat: 0, lng: 0}
    end
    {
        :primary => self.name,
        :secondary => self.raw_tags,
        :full_text => HTML::FullSanitizer.new.sanitize(self.html,:tags=>[]),
        :lat => latlng[:lat],
        :lng => latlng[:lng],
        :date => self.send(self.class.date_column).to_i,
        :affiliates => "ss#{self.affiliate_join.where("approved_version > 0").map { |e| e.affiliate_id.to_s(27).tr("0-9a-q", "A-Z") }.join("ee ss")}ee",
        :highlights => "ss#{self.highlights.map { |e| e.affiliate_id.to_s(27).tr("0-9a-q", "A-Z") }.join("ee ss")}ee",
        :type => self.entity_name,
        :primary_id => self.affiliate_id
    }
  end

  def remove_from_index
    self.update_index(true)
  end
  def update_index(destroy = false)
    if USE_CLOUDSEARCH # Only on production do we use cloudfront, otherwise do nothing
      # This method updates the cloudfront index
      begin
        Asari.mode = :production
        asari = Asari.new(AMAZON_CLOUDSEARCH_ENDPOINT)
        asari.aws_region = AMAZON_REGION
        if destroy || (self.to_index[:affiliates] == "ssee") || (self.instance_of?(User) && !self.verified?)
          asari.remove_item(self.search_index_id)
        else
          asari.add_item(self.search_index_id, self.to_index)
        end
      rescue
        #TODO: Add mailer here to inform sysadmin of failure
      end
    end
  end

  # Common Methods

  def raw_tags
    rt = @raw_tags
    rt = self.tags.map {|t| t.name.capitalize}.join(",") if rt.blank?
    return rt
  end

  def comment_hash
    "#{self.entity_name}_#{self.id}"
  end
  def comments
    Comment.get_all_comments(self.comment_hash)
  end
  def comment_count
    Comment.count_comments(self.comment_hash)
  end
  def static_url(affil = nil)
    if affil.present?
      affil_url = affil.send("url_#{self.method_name}")
      return "#{affil_url}#command=show&parameters=id%3D#{self.id}%26model%3D#{self.entity_name}" if affil_url.present?
    end
    if (self.affiliate_id) > 0 && self.affiliate.present?
      affil_url = self.affiliate.send("url_#{self.method_name}")
      return "#{affil_url}#command=show&parameters=id%3D#{self.id}%26model%3D#{self.entity_name}" if affil_url.present?
    end
    return "#{SITE_HOST}/#{self.method_name}#command=show&parameters=id%3D#{self.id}%26model%3D#{self.entity_name}"
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
      if !self.instance_of?(Blog)
        Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
          self.affiliate_join.create({:affiliate_id => a.id, :approved_version => 0, :admin_version => self.current_version, :broadcast => false, :user_broadcast => false}) unless all_current.include?(a.id)
          all_current << a.id unless all_current.include?(a.id)
        end
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
        recipients = User.where(admin: true).all
        affiliate = Affiliate.find_by_id(0)
      end
      NotificationMailer.delay(:run_at => 15.minutes.from_now).awaiting_moderation(recipients, affiliate, self, i) if recipients.length > 0
      i.broadcast = true
      i.save(:validate => false)
    end
    self.update_index
    self.user_broadcast.delay(:run_at => 15.minutes.from_now) if call_user_broadcast
  end

  def user_broadcast
    # This method takes some time...it is meant to be called by a 'delay' action, not directly
    self.affiliate_join.where(user_broadcast: false).where("approved_version > 0").each do |i|
      if i.affiliate_id == 0
        # Find all users, minus users in groups that do their own super moderation
        recipients = User.select(:id).where(verified: true).all.map { |r| r.id }
        if !self.instance_of?(Blog)
          Affiliate.where("moderate_#{self.method_name} = #{Affiliate::ALL}").each do |a|
            recipients = recipients - User.find_all_by_affiliate_id(a.id).map { |r| r.id }
          end
        end
      else
        recipients = i.affiliate.memberships.approved.map { |r| r.user_id }
      end
      recipients.each do |user_id|
        u = User.find_by_id_and_verified(user_id, true)
        next if u.blank?
        if self.instance_of?(Blog)
          next if !self.announcement? && !u.subscription.blogs?
          next if self.announcement? && !u.subscription.announcement?
        else
          next unless u.subscription.send("#{self.method_name}?")
        end
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
        token = self.emails.create(user_id: user_id).token
        NotificationMailer.entity(User.find_by_id(user_id), self, token).deliver()
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
      next if (a.affiliate_id == 0) || a.affiliate.blank?
      return true if a.affiliate.admin?(user, Membership::EDITOR)
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
          self.update_index
          return "Highlight Removed"
        else
          Highlight.create({affiliate_id: affiliate.id, entity: self})
          self.update_index
          return "Highlight Added"
        end
      end
    else
      if current_user.present? && current_user.admin?
        if self.highlighted?(affiliate)
          self.highlights.where(affiliate_id: 0).first.destroy
          self.update_index
          return "Highlight Removed"
        else
          Highlight.create({affiliate_id: 0, entity: self})
          self.update_index
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
        self.update_index
        return "This item has been approved#{highlight ? ' and highlighted' : ''}"
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
        self.update_index
        return "This item has been approved#{highlight ? ' and highlighted' : ''}"
      end
    end
    return "You are not authorized here"
  end

  def reject_or_remove(current_user, affiliate, reason)
    if affiliate.id.present?
      if current_user.present? && affiliate.admin?(current_user, Membership::EDITOR)
        join_item = self.affiliate_join.where(affiliate_id: affiliate.id).first
        return "Something went wrong" if join_item.blank?
        if join_item.approved_version == self.current_version
          NotificationMailer.delay.item_removed(self, reason, affiliate)
          join_item.approved_version = 0
          join_item.approved_versions ='0'
          notice = "Item removed"
        else
          NotificationMailer.delay.item_rejected(self, reason, affiliate)
          notice = "Item Rejected"
        end
        join_item.awaiting_edit = true
        join_item.save
        self.update_index
        return notice
      end
    else
      if current_user.present? && current_user.admin?
        join_item = self.affiliate_join.where(affiliate_id: 0).first
        return "Something went wrong" if join_item.blank?
        if join_item.approved_version == self.current_version
          NotificationMailer.delay.item_removed(self, reason, affiliate)
          join_item.approved_version = 0
          join_item.approved_versions ='0'
          notice = "Item removed"
        else
          NotificationMailer.delay.item_rejected(self, reason, affiliate)
          notice = "Item Rejected"
        end
        join_item.awaiting_edit = true
        join_item.save
        self.update_index
        return notice
      end
    end
    return "You are not authorized here"
  end

  def mark_read(user_id, affiliate_id, ip)
    author_id = self.instance_of?(User) ? self.id : self.user_id
    return if user_id == author_id # Don't count our own views
    if user_id > 0
      read = self.mark_reads.where(:user_id => user_id).first
      if read.blank?
        read = MarkRead.new({user_id: user_id})
        read.entity = self
      end
      read.ip = ip
      read.save!
    else
      read = self.mark_reads.where(:ip => ip).first
      if read.blank?
        read = MarkRead.new({ip: ip})
        read.entity = self
        read.save!
      end
    end
    MarkReadAction.create(:mark_read_id => read.id, :ip => ip, :affiliate_id => affiliate_id)
  end


end