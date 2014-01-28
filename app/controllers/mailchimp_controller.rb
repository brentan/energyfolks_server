class MailchimpController < ApplicationController

  def edit
    if params[:affiliate_id] == "0"
      #with no affiliate id, the user is attempting to edit the global Energyfolks list
      if current_user.admin?
        @affiliate = nil
        @mailchimp_client = MailchimpClient.where(affiliate_id: nil).first
        if @mailchimp_client.nil?
          @mailchimp_client = MailchimpClient.new
          @mailchimp_client.save
        end
        @list_names = @mailchimp_client.get_list_names
      else
        flash[:notice] = "You do not have administrative privileges to edit global list settings."
      end
    else
      @affiliate = Affiliate.find_by_id(params[:affiliate_id])
      if @affiliate.present? && @affiliate.admin?(current_user, Membership::EDITOR)
        if @affiliate.mailchimp_client.nil?
          @affiliate.mailchimp_client = MailchimpClient.new
          @affiliate.mailchimp_client.save
        end
        @mailchimp_client = @affiliate.mailchimp_client
        @list_names = @mailchimp_client.get_list_names
      else
        flash[:notice] = "You do not have administrative privileges for this affiliate."
      end
    end

  end

  def update
    if params[:affiliate_id] == "0"
      if current_user.admin?
        @affiliate = nil
        @mailchimp_client = MailchimpClient.where(affiliate_id: nil).first

        @mailchimp_client.update_attributes(params[:mailchimp_client])
        @mailchimp_client.save

        @list_names = @mailchimp_client.get_list_names
      else
        flash[:notice] = "You do not have administrative privileges to update global list settings."
      end
    else
      @affiliate = Affiliate.find_by_id(params[:affiliate_id])
      if @affiliate.present? && @affiliate.admin?(current_user, Membership::EDITOR)
        @affiliate.mailchimp_client.update_attributes(params[:mailchimp_client])
        @affiliate.mailchimp_client.save

        @mailchimp_client = @affiliate.mailchimp_client
        @list_names = @mailchimp_client.get_list_names
      else
        flash[:notice] = "You do not have administrative privileges for this affiliate."
      end
    end

    render 'edit'
  end

  def sync_now
    @affiliate = Affiliate.find_by_id(params[:affiliate_id])
    if @affiliate.present? && @affiliate.admin?(current_user, Membership::EDITOR)

      @mailchimp_client.sync_global
    end

    render 'edit'
  end

  #layout 'application'

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

end