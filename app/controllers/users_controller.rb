class UsersController < ApplicationController

  # STILL TO DO:
  # email subscriptions (tokens as well to edit from email footer)
  # social media logins

  def try_login
    # TODO: aid (affiliate id) is passed and can be used for analytics
    # Get request submitted by javascript library
    params[:user] = params[:user].gsub("ENFOLKSPERCENT","%")
    params[:pass] = params[:pass].gsub("ENFOLKSPERCENT","%")
    url = params[:current_url].gsub("#","").gsub(/_dot_/,".").gsub(/_slash_/,"/").gsub(/_colon_/,":").gsub(/_qmark_/,"?").gsub(/_amp_/,"&").gsub(/_equals_/,"=")

    user = User.find_by_email_and_password(params[:user],params[:pass])
    if user
      user.last_login = Time.now
      user.save!(validate: false)
      session[:userid] = user.id
      cookies[:cookieID] = user.cookie if params[:cook]
      login_hash = UserLoginHash.create(user_id: user.id)
      render :action => 'ajax/success', :locals => { hash: login_hash.login_hash, url: url }
    else
      render :action => 'ajax/error', :locals => { url: url }
    end
  end

  def avatar
    user = User.find_by_id(params[:id])
    if user.blank? || (user.present? && user.avatar.blank?)
      image_url = "#{Rails.root}/app/assets/images/noimage.png" # Render the base noimage
    else
      image_url = user.avatar.url(:thumb) # Render the image directly for this user here
      image_url = user.avatar.path(:thumb) if image_url[0..0] == '/' # Non-s3 is local
    end
    response.headers['Cache-Control'] = "public, max-age=#{96.hours.to_i}"
    response.headers['Content-Type'] = 'image/jpeg'
    response.headers['Content-Disposition'] = 'inline'
    render :text => open(image_url, 'rb').read
  end

  def show
    @item = User.find_by_id(params[:id])
  end

  def from_hash
    return render :inline => 'badsecret' unless current_affiliate.check_hash(params[:secret], params[:hash])
    login = UserLoginHash.find_by_login_hash(params[:hash])
    if login.present? && ((Time.now() - login.created_at) < 10.seconds)
      if current_affiliate.id.present?
        role = login.user.memberships.approved.where(:affiliate_id => current_affiliate.id).first
        if role.present? && (role.admin_level == Membership::CONTRIBUTOR)
          role = '1'
        elsif role.present? && (role.admin_level == Membership::AUTHOR)
          role = '2'
        elsif role.present? && (role.admin_level == Membership::EDITOR)
          role = '3'
        elsif role.present? && (role.admin_level == Membership::ADMINISTRATOR)
          role = '4'
        end
      else
        role = '0'
      end
      render :json => {
          user_id: login.user_id,
          user: "Energyfolks_#{login.user_id}",
          first_name: login.user.first_name,
          last_name: login.user.last_name,
          email: login.user.email,
          role: role,
          pass: login.user.wordpress_password(current_affiliate.id.present? ? current_affiliate.id : 0),
          picture_url: login.user.avatar.present? ? login.user.avatar.url(:thumb) : "#{SITE_HOST}/assets/noimage.png",
          visibility: login.user.visibility,
          affiliates: login.user.memberships.approved.map{ |m| m.affiliate_id },
          position: login.user.position,
          company: login.user.organization
      }
      login.destroy
    else
      render :json => {}
    end
  end

  def activate
    user = params['token'].present? ? User.find_by_activation_token(params['token']) : nil
    if user.present? && user.active?
      user.verified= true
      user.save!(validate:false)
      session[:userid]=user.id
      user.update_index
      flash[:notice]="Your account has been activated!  Please setup your profile."
      redirect_to "/users/profile?iframe=1&current_url=#{params[:current_url]}&aid=#{params[:aid]}"
    else
      @message = "Invalid validation URL"
      render 'common/blank'
    end
  end

  def verify
    # Verify changes to email address
    user = params['token'].present? ? User.find_by_verification_token(params['token']) : nil
    if user.present?
      UserMailer.delay.email_verification_request_2(user, @aid, @host)
      user.email = user.email_to_verify
      user.email_to_verify = nil
      user.save!(validate:false)
      user.update_index
      session[:userid]=user.id
      flash[:notice]="Your email address has been changed"
      redirect_to "/users/profile?iframe=1&current_url=#{params[:current_url]}&aid=#{params[:aid]}"
    else
      @message = "Invalid email change URL"
      render 'common/blank'
    end
  end

  def moderation
    @code = "EnergyFolks.get_moderated = true;EnergyFolks.showPage({source: 'users', format: 'list'});"
    render '/common/load_js'
  end

  def try_cookie
    # TODO: current_url parameter is passed and can be used for analytics
    # TODO: aid (affiliate id) is passed and can be used for analytics
    if !user_logged_in? && cookies[:cookieID].present?
      user = User.find_by_cookie(cookies[:cookieID])
      if user.present?
        session[:userid] = user.id if user.present?
        login_hash = UserLoginHash.create(user_id: current_user.id)
        render :js => "EnergyFolks.login_callback('#{login_hash.login_hash}');"
        return
      end
    end
    if user_logged_in? && params[:force_login].present?
      login_hash = UserLoginHash.create(user_id: current_user.id)
      render :js => "EnergyFolks.login_callback('#{login_hash.login_hash}');"
    elsif user_logged_in?
      render :js => "EnergyFolks.user_logged_in = true;EnergyFolks.current_user = #{user_hash(current_user).to_json};EnergyFolks.CreateTopBar();"
    else
      render :js => "EnergyFolks.CreateTopBar();"
    end
  end

  def logout
    # TODO: current_url parameter is passed and can be used for analytics
    # TODO: aid (affiliate id) is passed and can be used for analytics
    session[:userid] = nil
    cookies[:cookieID] = nil
    reset_session
    if params[:no_callback].present? && current_affiliate.present? && current_affiliate.id.present?
      redirect_to current_affiliate.url
    else
      render :js => "EnergyFolks.logout_callback();"
    end
  end

  def login
    @user = User.new
  end

  def profile
    if session[:userid]
      @user = User.find(session[:userid])
      render :action => :edit
    else
      redirect_to :action => :login
    end
  end

  def delete
    @user = User.find(session[:userid])
    @user.destroy
    flash[:notice]="Your account has been completely removed."
    redirect_to '/'
  end

  def update
    params[:user][:admin].delete if params[:user][:admin].present?
    @user = User.find(session[:userid])
    if (params[:user][:password_old].blank? && params[:user][:password].blank?) || (params[:user][:password_old].present? && @user.check_password(params[:user][:password_old]))
      old_email = @user.email_to_verify
      if(@user.update_attributes(params[:user]))
        Tag.update_tags(@user.raw_tags, @user)
        UserMailer.delay.email_verification_request(@user, @aid, @host) if (old_email != @user.email_to_verify) && @user.email_to_verify.present?
        UserMailer.delay.reset_password_2(@user, @aid, @host) if params[:user][:password_old].present? && params[:user][:password].present?
        @user.delay.sync
        @user.update_index
        flash[:notice]="Your account has been updated"
      else
        flash[:alert]="There are errors in your profile.  Please correct and resubmit."
      end
    else
      @user.errors.add(:password_old,"Incorrect current password")
      @user.attributes=params[:user]
      flash[:alert]="There are errors in your profile.  Please correct and resubmit."
    end
    render :action => :edit
  end

  def new
    @user = User.new
  end

  def create
    params[:user][:admin].delete if params[:user][:admin].present?
    @user = User.new(params[:user])
    if !@user.save
      render :action => "new"
    else
      Tag.update_tags(@user.raw_tags, @user)
      UserMailer.delay.confirmation_request(@user, @aid, @host)
    end
  end

  def resend_activation
    @step = params['step']
    if @step == '2'
      user = User.find_by_email(params['email'].downcase)
      if user.present? && !user.verified? && user.active?
        UserMailer.delay.confirmation_request(user, @aid, @host)
        flash[:notice]="The activation email has been resent.  Please check your inbox."
      elsif user.present? && !user.verified?
        flash[:alert]="This account is frozen.  Please contact admins (contact@energyfolks.com) to re-enable account."
      elsif user.present?
        flash[:alert]="Account has already been activated."
      else
        flash[:alert]="Email address not found."
      end
    end
  end

  def resend_email_change_verification
    UserMailer.delay.email_verification_request(current_user, @aid, @host)
    render :nothing => true, :status => 200, :content_type => 'text/html'
  end

  def reset_password
    @step = params['step']
    if @step == '2'
      user = User.find_by_email(params['email'].downcase)
      if user.present? && user.verified?
        UserMailer.delay.reset_password(user, @aid, @host)
        flash[:notice]="Password reset instruction have been sent.  Please check your inbox."
      elsif user.present?
        flash[:alert]="Account has not yet been activated."
      else
        flash[:alert]="Email address not found."
      end
    elsif @step == '3'
      @user = User.find_by_password_reset_token(params['token'])
      @token = params['token']
      if @user.blank?
        @step = '2'
        flash[:alert]="The password reset URL is invalid."
      end
    elsif @step == '4'
      @user = User.find_by_password_reset_token(params['token'])
      @token = params['token']
      if @user.blank?
        @step = '2'
        flash[:alert]="The password reset URL is invalid."
      else
        params['password'] = 'ERR' if params['password'].blank?
        @user.password = params['password']
        @user.password_confirmation = params['password_confirmation']
        begin
          @user.save!
          UserMailer.delay.reset_password_2(@user, @aid, @host)
        rescue
          @step = '3'
          flash[:alert]=@user.errors.messages[:password].map{|e| "Password #{e}"}.join(", ")
        end
      end
    end
  end

  def manual_verify
    return redirect_to "/" unless current_user.admin?
    user = User.find_by_id(params[:id])
    if user.present?
      user.verified = true
      user.active = true
      user.save!(validate:false)
      user.update_index
    end
  end

  def freeze_account
    return redirect_to "/" unless current_user.admin?
    @user = User.find_by_id(params[:id])
    if @user.present? && params[:reason].present?
      @user.verified = false
      @user.active = false
      @user.save!(validate:false)
      UserMailer.delay.account_frozen(@user, params[:reason],@aid, @host)
      @user.update_index
    end
  end

  def rights
    return redirect_to "/" unless current_user.admin?
    @user = User.find_by_id(params[:id])
    if @user.present? && params[:iframe_next].present?
      params[:user].keys.each do |key|
        @user.send("#{key}=",params[:user][key])
      end
      @user.save!(:validate => false)
      @user.delay.sync
      flash[:notice] = "Settings saved"
    end
  end

  def memberships
    return redirect_to "/" unless current_user.admin?
    @user = User.find_by_id(params[:id])
    @status = []
    @user.memberships.each do |m|
      @status[m.affiliate_id] = {mid: m.id, admin: m.admin_level, approved: m.approved? }
    end
    @memberships = @user.memberships.map {|m| m.affiliate_id }
  end

  def memberships_add
    return redirect_to "/" unless current_user.admin?
    @user = User.find_by_id(params[:id])
    Membership.create({affiliate_id: params[:aid], user_id: params[:id], approved: true})
    @user.delay.sync
    redirect_to "/users/memberships?id=#{@user.id}&iframe_next=1", :notice => 'User added to group'
  end

  def memberships_remove
    return redirect_to "/" unless current_user.admin?
    @user = User.find_by_id(params[:id])
    Membership.find_by_id(params[:mid]).destroy
    @user.delay.sync
    redirect_to "/users/memberships?id=#{@user.id}&iframe_next=1", :notice => 'User removed from group'
  end

  def privacy
  end

  def terms
  end

  def digest
    return redirect_to "/", :notice => 'Must be logged in' unless user_logged_in?
    digest = DigestMailer.create(user: current_user, weekly: true)
    items, send_it = digest.items
    @user = current_user
    @token = digest.token
    @items = items
    @affiliate = current_user.affiliate
    @weekly = true
    digest.destroy
    render 'digest/digest', :layout => 'site_mailer'
  end

  def external_login
    # Use an external service to login the user
    cookies[:aid] = current_affiliate.id.present? ? current_affiliate.id : 0
    cookies[:parent_url] = @url
    return redirect_to "/auth/linkedin" if params[:service] == 'linkedin'
    redirect_to "/", :notice => "Unrecognized service"
  end

  def omniauth_failure
    return redirect_to env['PATH_INFO'].gsub("callback","") if env['omniauth.error'].problem == 'parameter_absent'
    redirect_to "/", :notice => 'There was an error during the authentication process'
  end

  def linkedin
    begin
      hash = request.env['omniauth.auth']
      return redirect_to "/auth/linkedin" if hash.nil?
      # Find user email:
      email = hash.info.email
      # Attempt to login this user:
      user = User.find_by_linkedin_hash(hash.uid)
      user ||= User.find_by_email(email)
      user ||= current_user if user_logged_in?
      if user && user_logged_in? && (current_user.id != user.id)
        # Linkedin is linked to another user account
        @alert = 'This linkedin account is associated with a different EnergyFolks account.  You can delete this account, or you can delete the other account and synchronize this account with linkedin (first logout, then use the "login with linkedin" button, then delete that account, then login with this account, and then associate this account with linkedin).'
        render 'common/refresh_parent', layout: "iframe"
      elsif user
        # We know who this user is...lets log them in
        redirect_to "/", :alert => "Your account is frozen and your login is not allowed." unless user.active?
        user.last_login = Time.now
        user.linkedin_hash = hash.uid
        user.save!(validate: false)
        ThirdPartyLogin.update(user, 'linkedin', hash.credentials.token, hash.credentials.secret)
        user.update_by_linkedin
        user.update_index
        session[:userid] = user.id
        cookies[:cookieID] = user.cookie
        render 'common/refresh_parent', layout: "iframe"
      elsif params[:create_new].present?
        cookies.delete(:create_new)
        if current_affiliate.id.present?
          user = User.new({ memberships_attributes: [ { affiliate_id: current_affiliate.id, reason: 'linkedin login' } ] })
        else
          user = User.new()
        end
        user.email = hash.info.email
        user.first_name = hash.info.first_name
        user.last_name = hash.info.last_name
        user.location = hash.info.location
        user.linkedin_hash = hash.uid
        pass = rand(1..10000000).to_s
        user.password = pass
        user.password_confirmation = pass
        user.verified = true
        user.active = true
        user.save!
        ThirdPartyLogin.update(user, 'linkedin', hash.credentials.token, hash.credentials.secret)
        user.update_by_linkedin
        user.update_index
        user.delay.sync
        session[:userid] = user.id
        cookies[:cookieID] = user.cookie
        render 'common/refresh_parent', layout: "iframe"
      else
        # We have never seen this user...ask what they want to do
        @name = hash.info.name
        @service = 'LinkedIn'
        @link = 'linkedin'
        render 'common/new_external', layout: "iframe"
      end
    rescue
      redirect_to "/", :notice => 'There was an error during the authentication process'
    end
  end
end
