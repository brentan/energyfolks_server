class GoogleClient
  #google_client = GoogleClient.new
  #google_client.create_affiliate(Affiliate.find_by_id(1))
  #@output = google_client.sync_affiliate(Affiliate.find_by_id(1))

  require 'google/api_client'

  ## Email of the Service Account #
  SERVICE_ACCOUNT_EMAIL = SITE_SPECIFIC['google']['service_email']

  ## Email account of the Admin User ##
  ADMIN_EMAIL = SITE_SPECIFIC['google']['admin_email']

  ## Path to the Service Account's Private Key file #
  SERVICE_ACCOUNT_PKCS12_FILE_PATH = "#{Rails.root}#{SITE_SPECIFIC['google']['cert_relative_path']}"

  # Connect to google to enable api calls
  def initialize
    return unless Rails.env.production?
    key = Google::APIClient::PKCS12.load_key(SERVICE_ACCOUNT_PKCS12_FILE_PATH, 'notasecret')
    asserter = Google::APIClient::JWTAsserter.new(SERVICE_ACCOUNT_EMAIL, %w(https://www.googleapis.com/auth/apps.groups.settings https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group), key)
    @client = Google::APIClient.new(:application_name => "EnergyFolks", :application_version => "v0.0.0")
    @client.authorization = asserter.authorize(ADMIN_EMAIL)
    @admin = @client.discovered_api('admin', 'directory_v1')
    @group = @client.discovered_api('groupssettings','v1')
    @batch_count = 0
  end

  def sync_user(user)
    return unless Rails.env.production?
    # This will sync user with all affiliates they should be a member of
    current_groups = get_members({ userKey: user.email.downcase },'groups.list').map { |g| g.email.downcase }
    add_groups = ['energyfolks-users@energyfolks.com']
    add_groups << 'energyfolks-admins@energyfolks.com' if user.admin?
    add_admins = user.admin? ? ['energyfolks-users@energyfolks.com', 'energyfolks-admins@energyfolks.com']: []
    user.memberships.approved.each do |m|
      next if m.affiliate.blank?
      next if user.subscription.blank?
      add_groups << "#{m.affiliate.email_name}-members@energyfolks.com".downcase if user.subscription.announcement? || (m.admin_level >= Membership::EDITOR)
      add_groups << "#{m.affiliate.email_name}-digest@energyfolks.com".downcase if user.subscription.weekly? || (m.admin_level >= Membership::EDITOR)
      add_groups << "#{m.affiliate.email_name}-contributors@energyfolks.com".downcase if m.admin_level >= Membership::AUTHOR
      add_groups << "#{m.affiliate.email_name}-admins@energyfolks.com".downcase if m.admin_level >= Membership::EDITOR
      if(m.admin_level >= Membership::EDITOR)
        add_groups << 'energyfolks-admins@energyfolks.com' unless add_groups.include?('energyfolks-admins@energyfolks.com')
        add_admins << "#{m.affiliate.email_name}-members@energyfolks.com".downcase
        add_admins << "#{m.affiliate.email_name}-digest@energyfolks.com".downcase
        add_admins << "#{m.affiliate.email_name}-contributors@energyfolks.com".downcase
        add_admins << "#{m.affiliate.email_name}-admins@energyfolks.com".downcase
      end
    end
    (current_groups - add_groups).each do |to_remove|
      next if to_remove.split('-').length == 1  # These are custom email lists that should not be touched
      batch_add({api_method: @admin.members.delete, parameters: {:groupKey => to_remove, memberKey: user.email.downcase }})
    end
    (add_groups - current_groups).each { |to_add| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => to_add}, body_object: {email: user.email.downcase, role: 'MEMBER', type: 'USER'}})}
    add_admins.each { |to_admin| batch_add({api_method: @admin.members.update, parameters: {:groupKey => to_admin, memberKey: user.email.downcase}, body_object: {role: 'OWNER', type: 'USER'}}) }
    batch_execute
  end

  def sync_affiliate(affiliate)
    return unless Rails.env.production?
    # This will sync affiliate email lists with their user database.
    admins = affiliate.admins(Membership::EDITOR).map{ |u| u.email.downcase }
    admins << "#{affiliate.email_name}@energyfolks.com"

    #members list
    emails = affiliate.announcement_members.map{ |u| u.email.downcase } | admins
    current_members = get_list_members("#{affiliate.email_name}-members")
    current_admins = get_list_admins("#{affiliate.email_name}-members")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}, body_object: {role: 'OWNER', type: 'USER'}}) }

    #digest list
    emails = affiliate.announcement_members.map{ |u| u.email.downcase } | admins
    current_members = get_list_members("#{affiliate.email_name}-digest")
    current_admins = get_list_admins("#{affiliate.email_name}-digest")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}, body_object: {role: 'OWNER', type: 'USER'}}) }

    #contributor list
    emails = affiliate.admins(Membership::AUTHOR).map{ |u| u.email.downcase } | admins
    current_members = get_list_members("#{affiliate.email_name}-contributors")
    current_admins = get_list_admins("#{affiliate.email_name}-contributors")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}, body_object: {role: 'OWNER', type: 'USER'}}) }

    #admin list
    current_admins = get_list_members("#{affiliate.email_name}-admins")
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-admins@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-admins@energyfolks.com"}, body_object: {email: e, role: 'OWNER', type: 'USER'}}) }

    batch_execute
  end

  def sync_global
    return unless Rails.env.production?
    # This will sync the energyfolks-users and energyfolks-admins lists

    # all users
    emails = User.verified.all.map{ |u| u.email.downcase }
    admins = User.verified.where(admin: true).all.map{ |u| u.email.downcase }
    current_members = get_list_members("energyfolks-users")
    current_admins = get_list_admins("energyfolks-users")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "energyfolks-users@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "energyfolks-users@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "energyfolks-users@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "energyfolks-users@energyfolks.com", memberKey: e}, body_object: {role: 'OWNER', type: 'USER'}}) }

    # all admins
    emails = User.verified.joins(:memberships).where("memberships.approved = 1").where("memberships.admin_level >= ?", Membership::EDITOR).all.map{ |u| u.email.downcase }
    emails += admins
    emails = emails.uniq
    current_members = get_list_members("energyfolks-admins")
    current_admins = get_list_admins("energyfolks-admins")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "energyfolks-admins@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "energyfolks-admins@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "energyfolks-admins@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "energyfolks-admins@energyfolks.com", memberKey: e}, body_object: {role: 'OWNER', type: 'USER'}}) }

    batch_execute
  end



  def create_affiliate(affiliate)
    return unless Rails.env.production?
    # New affiliate, we should update google information
    first_name = affiliate.name.split(" ")[0]
    last_name = affiliate.name.split(" ")
    last_name[0] = ''
    last_name = last_name.length == 1 ? 'Leadership' : last_name.join(' ')
    new_user = @admin.users.insert.request_schema.new({
         'password' => (0...10).map{ ('a'..'z').to_a[rand(26)] }.join,
         'primaryEmail' => "#{affiliate.email_name}@energyfolks.com",
         'name' => {
             'familyName' => last_name,
             'givenName' => first_name
         }
    })
    admin('users.insert', { :body_object => new_user })
    new_group = @admin.groups.insert.request_schema.new({
                                                            'email' => "#{affiliate.email_name}-members@energyfolks.com",
                                                            'name' => "#{affiliate.name} Members",
                                                        })
    admin('groups.insert', { :body_object => new_group })
    new_group = @admin.groups.insert.request_schema.new({
                                                            'email' => "#{affiliate.email_name}-digest@energyfolks.com",
                                                            'name' => "#{affiliate.name} Weekly Digest",
                                                        })
    admin('groups.insert', { :body_object => new_group })
    new_group = @admin.groups.insert.request_schema.new({
                                                            'email' => "#{affiliate.email_name}-contributors@energyfolks.com",
                                                            'name' => "#{affiliate.name} Authors and Contributors",
                                                        })
    admin('groups.insert', { :body_object => new_group })
    new_group = @admin.groups.insert.request_schema.new({
                                                            'email' => "#{affiliate.email_name}-admins@energyfolks.com",
                                                            'name' => "#{affiliate.name} Editors and Administrators",
                                                        })
    admin('groups.insert', { :body_object => new_group })

    # Update group settings
    settings = {
        :whoCanJoin => 'CAN_REQUEST_TO_JOIN',
        :whoCanViewGroup => 'ALL_MEMBERS_CAN_VIEW',
        :allowGoogleCommunication => 'false',
        :whoCanPostMessage => 'ALL_MEMBERS_CAN_POST',
        :whoCanViewMembership => 'ALL_MANAGERS_CAN_VIEW ',
        :whoCanInvite => 'ALL_MANAGERS_CAN_INVITE',
        :allowExternalMembers => 'true',
        :membersCanPostAsTheGroup => 'false',
        :sendMessageDenyNotification => 'true',
        :defaultMessageDenyNotificationText => 'You are not authorized to send to this list.',
    }
    groups('groups.update', {parameters: {:groupUniqueId => "#{affiliate.email_name}-admins@energyfolks.com"}, body_object: settings}).body
    groups('groups.update', {parameters: {:groupUniqueId => "#{affiliate.email_name}-contributors@energyfolks.com"}, body_object: settings}).body
    settings = {
        :whoCanJoin => 'CAN_REQUEST_TO_JOIN',
        :whoCanViewGroup => 'ALL_MEMBERS_CAN_VIEW',
        :allowGoogleCommunication => 'false',
        :whoCanPostMessage => 'ALL_MANAGERS_CAN_POST',
        :whoCanViewMembership => 'ALL_MANAGERS_CAN_VIEW ',
        :whoCanInvite => 'ALL_MANAGERS_CAN_INVITE',
        :allowExternalMembers => 'true',
        :membersCanPostAsTheGroup => 'false',
        :sendMessageDenyNotification => 'true',
        :defaultMessageDenyNotificationText => 'You are not authorized to send to this list.',
    }
    groups('groups.update', {parameters: {:groupUniqueId => "#{affiliate.email_name}-digest@energyfolks.com"}, body_object: settings}).body
    groups('groups.update', {parameters: {:groupUniqueId => "#{affiliate.email_name}-members@energyfolks.com"}, body_object: settings}).body

  end
  def remove_affiliate(affiliate)
    return unless Rails.env.production?
    admin('groups.delete', {parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com"}})
    admin('groups.delete', {parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com"}})
    admin('groups.delete', {parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com"}})
    admin('groups.delete', {parameters: {:groupKey => "#{affiliate.email_name}-admins@energyfolks.com"}})
    admin('users.delete', {parameters: {:userKey => "#{affiliate.email_name}@energyfolks.com"}})
  end

  private
  @client = nil
  @admin = nil
  @group = nil
  @batch = nil
  @batch_count = 0

  def get_list_members(listname)
    get_members({:groupKey => "#{listname}@energyfolks.com" }).map { |m| m.email }
  end
  def get_list_admins(listname)
    get_members({:groupKey => "#{listname}@energyfolks.com" , roles:'MANAGER,OWNER'}).map { |m| m.email }
  end

  def admin(input_method, options)
    method = @admin
    input_method.split('.').each { |m| method = method.send(m) }
    options[:api_method] = method
    return @client.execute(options)
  end

  def groups(input_method, options)
    method = @group
    input_method.split('.').each { |m| method = method.send(m) }
    options[:api_method] = method
    return @client.execute(options)
  end

  def get_members(parameters, method = 'members.list')
    # Get list members.  This is done in a loop because we may have to page through multiple results.
    result = Array.new
    page_token = nil
    begin
      parameters['pageToken'] = page_token if page_token.to_s != ''
      parameters['maxResults'] = 900
      api_result = admin(method, {parameters: parameters})
      if api_result.status == 200
        files = api_result.data
        if method == 'members.list'
          result.concat(files.members)
        else
          result.concat(files.groups)
        end
        page_token = files.next_page_token
      else
        page_token = nil
      end
    end while page_token.to_s != ''
    return result
  end

  def batch_add(item)
    if @batch.nil?
      @batch = Google::APIClient::BatchRequest.new do |result|
        # Do something with the animal result.
      end
    end
    @batch.add(item)
    @batch_count += 1
    batch_execute if @batch_count == 80
  end

  def batch_execute
    @batch_count = 0
    @client.execute(@batch)
    @batch = nil
  end

end