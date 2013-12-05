class GoogleController < SamlIdp::IdpController
  # This controller is the SAML server that google will talk with when signing on users to use google apps


  def inbound
    if user_logged_in?
      admin_list = []
      admin_list << {name: 'Personal Account', email: "#{current_user.first_name}@energyfolks.com", response: encode_SAMLResponse("#{current_user.first_name}@energyfolks.com")} if current_user.admin?
      current_user.memberships.approved.where("admin_level > ?", Membership::CONTRIBUTOR).all.each do |m|
        next if m.affiliate.blank?
        admin_list << {name: m.affiliate.name, email: "#{m.affiliate.email_name}@energyfolks.com", response: encode_SAMLResponse("#{m.affiliate.email_name}@energyfolks.com")}
      end
      if admin_list.length == 0
        return render :inline => 'You are not authorized'
      elsif admin_list.length == 1
        @saml_response = admin_list[0].response
        render :template => "saml_idp/idp/saml_post", :layout => false
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
  end

  def idp_make_saml_response(user)
    encode_SAMLResponse(user.email)
  end

end