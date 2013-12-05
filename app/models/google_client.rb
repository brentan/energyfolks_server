class GoogleClient
  require 'google/api_client'

  ## Email of the Service Account #
  SERVICE_ACCOUNT_EMAIL = ''

  ## Email account of the Admin User ##
  ADMIN_EMAIL = 'energyfolks@energyfolks.com'

  ## Path to the Service Account's Private Key file #
  SERVICE_ACCOUNT_PKCS12_FILE_PATH = "#{Rails.root}/../google_privatekey.p12"

  ##
  # Build an Admin SDK client instance authorized with the service account
  # that acts on behalf of the given user.
  #
  # @param [String] user_email
  #   The email of the user.
  # @return [Google::APIClient]
  #   Client instance
  def self.build_client
    key = Google::APIClient::PKCS12.load_key(SERVICE_ACCOUNT_PKCS12_FILE_PATH, 'notasecret')
    asserter = Google::APIClient::JWTAsserter.new(SERVICE_ACCOUNT_EMAIL, 'https://www.googleapis.com/auth/admin.directory.user', key)
    client = Google::APIClient.new({:application_name => "EnergyFolks", :application_version => "1.0"})
    client.authorization = asserter.authorize
    groups = client.discovered_api('admin', 'directory_v1')
    response = client.execute(api_method: groups.users.list, parameters: {'domain' => 'energyfolks.com'}).body
    client
  end

end