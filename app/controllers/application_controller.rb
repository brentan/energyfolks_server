class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :check_for_iframe
  before_filter :find_aid
  before_filter :analytics
  layout :choose_layout

  private
  def check_for_iframe
    if params['iframe'].present? && (params['iframe'] == '1')
      @layout = 'iframe'
      @url = params[:current_url].gsub("#","").gsub(/_dot_/,".").gsub(/_slash_/,"/").gsub(/_colon_/,":").gsub(/_qmark_/,"?").gsub(/_amp_/,"&").gsub(/_equals_/,"=")
    elsif params['iframe_next'].present?
      @layout = 'iframe'
    else
      @layout = 'application'
    end
  end

  def find_aid
    # TODO: check for subdomain and then set AID accordingly
    @aid = 0
    @host = "http://dev.energyfolks.com:3000"
    @aid = params[:aid] if params[:aid].present?
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
        :avatar => i.avatar,
        :avatar_url => "#{request.protocol}#{request.host_with_port}#{i.avatar.url(:thumb)}",
        :affiliates => i.memberships.approved.map { |m| { id: m.affiliate_id, admin_level: m.admin_level, approved: m.approved? } },
        :moderation_count => { total: 0, values: [{ title: 'Events', method: 'events', count: 0}] }, # TODO: Moderation count goes here
        :user_posts => { total: 0, values: [{ title: 'Events', method: 'events', count: 0}] }, # TODO: User posts go here
    }
  end
  helper_method :user_hash
end
