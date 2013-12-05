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
    key = Google::APIClient::PKCS12.load_key(SERVICE_ACCOUNT_PKCS12_FILE_PATH, 'notasecret')
    asserter = Google::APIClient::JWTAsserter.new(SERVICE_ACCOUNT_EMAIL, %w(https://www.googleapis.com/auth/apps.groups.settings https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group), key)
    @client = Google::APIClient.new(:application_name => "EnergyFolks", :application_version => "v0.0.0")
    @client.authorization = asserter.authorize(ADMIN_EMAIL)
    @admin = @client.discovered_api('admin', 'directory_v1')
    @group = @client.discovered_api('groupssettings','v1')
    @batch_count = 0
  end

  def sync_affiliate(affiliate)
    # TODO: Add this to rake task AND create_affiliate command.
    # TODO: Make mini version of this to run in delay when a user profile is updated (or when user memberships are updated.)
    admins = affiliate.admins(Membership::EDITOR).map{ |u| u.email.downcase }

    #members list
    emails = affiliate.announcement_members.map{ |u| u.email.downcase }
    current_members = get_list_members("#{affiliate.email_name}-members")
    current_admins = get_list_admins("#{affiliate.email_name}-members")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-members@energyfolks.com", memberKey: e}, body_object: {role: 'MANAGER', type: 'USER'}}) }

    #digest list
    emails = affiliate.announcement_members.map{ |u| u.email.downcase }
    current_members = get_list_members("#{affiliate.email_name}-digest")
    current_admins = get_list_admins("#{affiliate.email_name}-digest")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-digest@energyfolks.com", memberKey: e}, body_object: {role: 'MANAGER', type: 'USER'}}) }

    #contributor list
    emails = affiliate.admins(Membership::AUTHOR).map{ |u| u.email.downcase }
    current_members = get_list_members("#{affiliate.email_name}-contributors")
    current_admins = get_list_admins("#{affiliate.email_name}-contributors")
    # Re-assign admins that have been removed
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}, body_object: {role: 'MEMBER'}}) }
    # Remove members that have left
    (current_members - emails).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (emails - current_members).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com"}, body_object: {email: e, role: 'MEMBER', type: 'USER'}}) }
    # Update admins
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.update, parameters: {:groupKey => "#{affiliate.email_name}-contributors@energyfolks.com", memberKey: e}, body_object: {role: 'MANAGER', type: 'USER'}}) }

    #admin list
    current_admins = get_list_members("#{affiliate.email_name}-admins")
    (current_admins - admins).each {|e| batch_add({api_method: @admin.members.delete, parameters: {:groupKey => "#{affiliate.email_name}-admins@energyfolks.com", memberKey: e}}) }
    # Add in new members
    (admins - current_admins).each {|e| batch_add({api_method: @admin.members.insert, parameters: {:groupKey => "#{affiliate.email_name}-admins@energyfolks.com"}, body_object: {email: e, role: 'MANAGER', type: 'USER'}}) }

    batch_execute
  end

  def get_list_members(listname)
    # TODO: deal with longer lists (above max-results)
    output = []
    begin
      output += ActiveSupport::JSON.decode(admin('members.list', {parameters: {:groupKey => "#{listname}@energyfolks.com", maxResults: 50000 }}).body)['members'].map {|m| m['email'].downcase }
    rescue
    end
    output
  end
  def get_list_admins(listname)
    # TODO: deal with longer lists (above max-results)
    output = []
    begin
      output += ActiveSupport::JSON.decode(admin('members.list', {parameters: {:groupKey => "#{listname}@energyfolks.com", maxResults: 50000, roles:'MANAGER' }}).body)['members'].map {|m| m['email'].downcase }
    rescue
    end
    output
  end

  def create_affiliate(affiliate)
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