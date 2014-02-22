class SalesforceClient

  def initialize(affiliate)
    @affiliate = affiliate
  end

  def enabled?
    @affiliate.salesforce_username.present? && @affiliate.salesforce_password.present? && @affiliate.salesforce_token.present?
  end

  def login(send_email_failure = false)
    #return 'Salesforce not enabled on development' unless Rails.env.production?
    begin
      @client = Soapforce::Client.new
      @client.authenticate(:username => @affiliate.salesforce_username, :password => "#{@affiliate.salesforce_password}#{@affiliate.salesforce_token}")
      return ''
    rescue Exception => e
      return "Login error: #{e}"
    end
  end

  def fields
    out = @client.describe('Contact')
    fields = []
    out[:fields].each do |i|
      next unless %w(string double int email textarea boolean url phone picklist multipicklist).include?(i[:type])
      item = {name: i[:name], type: i[:type], label: i[:label]}
      if %w(picklist multipicklist).include?(i[:type])
        item[:options] = []
        i[:picklist_values].each do |p|
          item[:options] << {label: p[:label], value: p[:value]} if p[:active]
        end
      end
      fields << item
    end
    return fields
  end
end