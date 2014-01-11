class MailchimpController < ApplicationController
  before_action :setup_mailchimp_api

  def setup_mailchimp_api
    if user_logged_in?
      api_key = ??    #a string the mailchimp list admin can find in the list settings. Example:  'b4d5cf71998106c7b8cf0f860549d348-us3'
      @mc = Mailchimp::API.new(api_key)
    end
  end

  layout 'application'
  # use the Mailchimp gem to communicate with the Mailchimp server, for the account set up for this user / affiliate
  def inbound
    if user_logged_in?
      admin_list = []
      admin_list << {name: 'Personal Account', email: "#{current_user.first_name}@energyfolks.com", response: idp_make_saml_response("#{current_user.first_name}@energyfolks.com")} if current_user.admin?
      current_user.memberships.approved.where("admin_level > ?", Membership::AUTHOR).all.each do |m|
        next if m.affiliate.blank?
        admin_list << {name: m.affiliate.name, email: "#{m.affiliate.email_name}@energyfolks.com", response: idp_make_saml_response("#{m.affiliate.email_name}@energyfolks.com")}
      end
      if admin_list.length == 0
        return render :inline => 'You are not authorized'
      elsif admin_list.length == 1
        @saml_response = admin_list[0][:response]
        render :template => "google/saml_post", :layout => false
      else
        @admin_list = admin_list
      end
    end
  end

  def logout
    # log user out!
    session[:userid] = nil
    cookies[:cookieID] = nil
    reset_session
    redirect_to "/"
  end

  private

  def current_user
    User.find_by_id(session[:userid]) if session[:userid]
  end
  helper_method :current_user

  def user_logged_in?
    current_user.present?
  end
  helper_method :user_logged_in?

end