class GoogleController < SamlIdp::IdpController
  layout 'application'
  # This controller is the SAML server that google will talk with when signing on users to use google apps
  def inbound
    if user_logged_in?
      admin_list = []
      current_user.google_emails.each do |e|
        admin_list << {name: 'Personal Email', email: e.email_address, response: idp_make_saml_response(e.email_address)}
      end
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

  def idp_make_saml_response(email)
    encode_SAMLResponse(email, {:issuer_uri => "#{SITE_HOST}/google/saml/inbound"})
  end

  def current_user
    User.find_by_id(session[:userid]) if session[:userid]
  end
  helper_method :current_user

  def user_logged_in?
    current_user.present?
  end
  helper_method :user_logged_in?

end