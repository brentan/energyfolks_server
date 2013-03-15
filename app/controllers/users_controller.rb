class UsersController < ApplicationController

  def try_login
    # TODO: aid (affiliate id) is passed and can be used for analytics
    # Get request submitted by javascript library
    params[:user] = params[:user].gsub("ENFOLKSPERCENT","%")
    params[:pass] = params[:pass].gsub("ENFOLKSPERCENT","%")
    url = params[:current_url].gsub("#","").gsub(/_dot_/,".").gsub(/_slash_/,"/").gsub(/_colon_/,":").gsub(/_qmark_/,"?").gsub(/_amp_/,"&").gsub(/_equals_/,"=")

    user = User.find_by_email_and_password(params[:user],params[:pass])
    if user
      session[:userid] = user.id
      cookies[:cookieID] = user.cookie if params[:cook]
      login_hash = UserLoginHash.create(user_id: user.id)
      render :action => 'ajax/success', :locals => { hash: login_hash.login_hash, url: url }
    else
      render :action => 'ajax/error', :locals => { url: url }
    end
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
    render :js => "//Completed"
  end

  def logout
    # TODO: current_url parameter is passed and can be used for analytics
    # TODO: aid (affiliate id) is passed and can be used for analytics
    session[:userid] = nil
    cookies[:cookieID] = nil
    reset_session
    render :js => "EnergyFolks.logout_callback();"
  end

  def index
    if session[:userid] && (session[:userid] > 0)
      @user = User.find(session[:userid])
      render :action => :profile
    else
      redirect_to :action => :login
    end
  end

  def login
    @user = User.new
  end

  def profile
    if params[:id]
      @user = User.find(params[:id])
    elsif session[:userid]
      @user = User.find(session[:userid])
      render :action => :edit
    else
      redirect_to :action => :login
    end
  end

  def edit
  end

  def update
    @user = User.find(params[:id])
    if(@user.do_update(params))
      if(@user.update_attributes(params[:user]))
        flash[:notice]="Your account has been updated"
        redirect_to :action => "index"
      else
        render :action => :edit
      end
    else
      @user = User.find(params[:id])
      @user.attributes=params[:user]
      @user.errors.add(:base,"Incorrect current password")
      render :action => :edit
    end
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])
    if @user.save
      session[:userid]=@user.id
      flash[:notice]="Your account has been created and you are now logged in";
      redirect_to :controller => "meetings"
    else
      render :action => "new"
    end
  end
end
