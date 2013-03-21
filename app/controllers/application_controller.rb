class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :check_for_iframe
  layout :choose_layout

  private
  def check_for_iframe
    if params['iframe'].present? && (params['iframe'] == '1')
      @layout = "iframe"
      @url = params[:current_url].gsub("#","").gsub(/_dot_/,".").gsub(/_slash_/,"/").gsub(/_colon_/,":").gsub(/_qmark_/,"?").gsub(/_amp_/,"&").gsub(/_equals_/,"=")
    else
      @layout = "application"
    end
  end

  def choose_layout
    @layout
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
