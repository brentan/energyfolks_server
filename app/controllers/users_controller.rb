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


  def show
    @item = User.find_by_id(params[:id])
  end

  def from_hash
    login = UserLoginHash.find_by_login_hash(params['hash'])
    if login.present? && ((Time.now() - login.created_at) < 10)
      render :json => {
          user_id: login.user_id,
          first_name: login.user.first_name,
          last_name: login.user.last_name,
          picture_url: "#{request.protocol}#{request.host_with_port}#{login.user.avatar.url}",
          visibility: login.user.visibility,
          affiliates: login.user.memberships.approved.map{ |m| m.affiliate_id },
          position: login.user.position,
          company: login.user.organization,
          has_posts: false # TODO: update this
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
      flash[:notice]="Your account has been activated"
      redirect_to :action => "profile"
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
      flash[:notice]="Your email address has been changed"
    else
      flash[:alert]="Invalid email change URL"
    end
    redirect_to :action => :login
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
    if user_logged_in?
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
    render :js => "EnergyFolks.logout_callback();"
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
      flash[:notice] = "Settings saved"
    end
  end

  def privacy
  end

  def terms
  end
end
