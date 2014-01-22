class MailchimpController < ApplicationController

  def edit
    affiliate = Affiliate.find_by_id(params[:affiliate_id])
    debug = true #debug only
    if debug || affiliate.present? && affiliate.admin?(current_user, Membership::EDITOR)
      if affiliate.mailchimp_client.nil?
        affiliate.mailchimp_client.create
      end
      @list_names = affiliate.mailchimp_client.get_lists if affiliate.mailchimp_client.api_key.present?
      @affiliate = affiliate
    else
      flash[:notice] = "You do not have administrative privileges for this affiliate."
    end
  end

  def update
    affiliate = Affiliate.find_by_id(params[:affiliate_id])
    debug = true #debug only
    if debug || affiliate.present? && affiliate.admin?(current_user, Membership::EDITOR)
      affiliate.mailchimp_client.update_attributes(params[:mailchimp_client])
      affiliate.mailchimp_client.save
    end

    render 'edit'
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

end