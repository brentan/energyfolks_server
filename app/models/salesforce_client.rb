class SalesforceClient

  def initialize(affiliate)
    @affiliate = affiliate
  end

  def enabled?
    return false unless Rails.env.production?
    return @affiliate.salesforce_username.present? && @affiliate.salesforce_password.present? && @affiliate.salesforce_token.present?
  end

  def login(send_email_failure = false)
    return 'Salesforce not enabled on development' unless Rails.env.production?
    begin
      @client = Soapforce::Client.new
      output = @client.authenticate(:username => @affiliate.salesforce_username, :password => "#{@affiliate.salesforce_password}#{@affiliate.salesforce_token}")
      ErrorMailer.mailerror(output).deliver();
      return ''
    rescue Exception => e
      if send_email_failure
        recipients = @affiliate.admins(Membership::ADMINISTRATOR, true)
        recipients.each do |user|
          NotificationMailer.salesforce_failure(user, @affiliate.id, "Error: #{e}").deliver()
        end
      end
      return "Login error: #{e}"
    end
  end

  def fields
    out = @client.describe('Contact')
    fields = []
    out[:fields].each do |i|
      next unless SalesforceItem.type_strings.include?(i[:type])
      next if i[:name] == 'Email'
      next if i[:name] == 'Name'
      next if i[:name] == 'LastName'
      next if i[:name] == 'FirstName'
      item = {name: i[:name], type: i[:type], label: i[:label], options: []}
      if %w(picklist multipicklist).include?(i[:type])
        i[:picklist_values].each do |p|
          item[:options] << {label: p[:label], value: p[:value]} if p[:active]
        end
      end
      fields << item
    end
    return fields
  end

  def find_user(user)
    begin
      data = @client.find_where('Contact', Email: user.email)
      @data = data.first
      @found = @data.present?
      return
    rescue
    end
    @found = false
  end
  def get_data(item)
    return nil unless @found
    return @data.send(item)
  end

  def update_user(user, params)
    begin
      if sync_user(user)
        params[:Email] = user.email
        out = @client.upsert('Contact', 'Email', params)
      end
    rescue
    end
  end
  def sync_user(user)
    begin
      if @affiliate.member?(user)
        params = {}
        params[:Email] = user.email
        params[:LastName] = user.last_name
        params[:FirstName] = user.first_name
        SalesforceItem.where(affiliate_id: @affiliate.id).where('energyfolks_name IS NOT NULL').all.each do |i|
          next if i.energyfolks_name.blank?
          if(i.energyfolks_name.include?('member_'))
            params[i.salesforce_name] = user.send(i.energyfolks_name, @affiliate.id)
          else
            params[i.salesforce_name] = user.send(i.energyfolks_name)
          end
        end
        out = @client.upsert('Contact', 'Email', params)
        return true
      else
        find_user(user)
        @client.destroy(@data.id) if @found
      end
    rescue
    end
    return false
  end

  def update_email(user)
    begin
      find_user(user)
      id = @data.id
      id = id.first if id.kind_of?(Array)
      @client.upsert('Contact', 'Id', {Id:id , Email: user.email_to_verify}) if @found
    rescue
    end
  end
end