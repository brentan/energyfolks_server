class SalesforceClient

  def initialize
    #return unless Rails.env.production?
    @client = Soapforce::Client.new
    @client.authenticate(:username => "brentan@energyfolks.com", :password => "")
  end

  def output
    out = @client.describe('Contact')
    out[:fields]
  end
end