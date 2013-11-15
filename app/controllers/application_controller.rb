class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :check_for_iframe
  before_filter :find_aid
  before_filter :analytics
  before_filter :set_timezone
  layout :choose_layout

  ENTITIES = [ User, Job, Event, Discussion ]


  #
  # Intercept the generic error pages and handle them ourselves.
  #
  unless Rails.application.config.consider_all_requests_local
    rescue_from Exception, with: :render_500
    rescue_from ActionController::RoutingError, with: :render_404
    rescue_from ActionController::UnknownController, with: :render_404
    rescue_from AbstractController::ActionNotFound, with: :render_404
    rescue_from ActiveRecord::RecordNotFound, with: :render_404
  end

  private
  def check_for_iframe
    if params['iframe'].present? && (params['iframe'] == '1')
      @layout = 'iframe'
      @url = params[:current_url].gsub("#","").gsub(/_dot_/,".").gsub(/_slash_/,"/").gsub(/_colon_/,":").gsub(/_qmark_/,"?").gsub(/_amp_/,"&").gsub(/_equals_/,"=")
    elsif params['iframe_next'].present?
      @layout = 'iframe'
    elsif request.fullpath.include?('developer')
      @layout = 'developer'
    else
      @layout = 'application'
    end
  end

  def find_aid
    # TODO: check for subdomain and then set AID accordingly
    @aid = 0
    @host = SITE_HOST #"http://dev.energyfolks.com:3000"
    @aid = params[:aid] if params[:aid].present?
  end

  def set_timezone
    Time.zone = current_user.timezone if current_user.present?
    Time.zone = current_affiliate.timezone
  end

  def choose_layout
    @layout
  end

  def analytics
    # TODO: current_url parameter may be passed and can be used for analytics
    # TODO: aid (affiliate id) may be passed and can be used for analytics
  end

  def current_user
    User.find_by_id(session[:userid]) if session[:userid]
  end
  helper_method :current_user

  def user_logged_in?
    current_user.present?
  end
  helper_method :user_logged_in?

  def current_affiliate
    Affiliate.find_by_id(@aid)
  end
  helper_method :current_affiliate

  def user_hash(i)
    {
        :first_name => i.first_name,
        :last_name => i.last_name,
        :position => i.position,
        :organization => i.organization,
        :id => i.id,
        :verified => i.verified?,
        :super_admin => i.admin?,
        :affiliate_id => i.affiliate_id,
        :avatar => i.avatar,
        :avatar_url => i.avatar.url(:thumb),
        :affiliates => i.memberships.approved.map { |m| { id: m.affiliate_id, admin_level: m.admin_level, approved: m.approved? } },
        :moderation_count => i.moderation_count,
        :user_posts => i.user_posts,
    }
  end
  helper_method :user_hash



  def render_404(exception)
    @not_found_path = exception.message
    respond_to do |format|
      format.html { render template: 'errors/error_404', status: 404 }
      format.all { render nothing: true, status: 404 }
    end
  end

  def render_500(exception)
    @error = exception
    ErrorMailer.experror(exception, current_user, current_affiliate, request).deliver
    #ExceptionNotifier::Notifier.exception_notification(request.env, exception).deliver
    respond_to do |format|
      format.html { render template: 'errors/error_500', status: 500 }
      format.all { render nothing: true, status: 500 }
    end
  end
end
