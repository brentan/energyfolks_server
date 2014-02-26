class AjaxController < ApplicationController

  # This controller handles ajax requests from the energyfolks library.  Because these requests are not true ajax to avoid
  # same-origin policy issues, what really happens is a js file is returned that acts on the EnergyFolks object

  # Display a login box to allow a user to login.  If a user is already logged in, show a profile box instead
  def loginBox
    if user_logged_in?
      html = render_to_string :partial => "users/ajax/profile"
    else
      html = render_to_string :partial => "users/ajax/login"
    end
    render_ajax( {html: html, id: params['id']} )
  end

  # Display a small login box to allow a user to login.  If a user is already logged in, show a profile box instead
  def smallLoginBox
    if user_logged_in?
      html = render_to_string :partial => "users/ajax/profile"
    else
      html = render_to_string :partial => "users/ajax/login_small"
    end
    render_ajax( {html: html, id: params['id']} )
  end

  # Display links to login/create account.  If a user is already logged in, show link to profile/logout
  def loginLinks
    if user_logged_in?
      html = render_to_string :partial => "users/ajax/profile_links"
    else
      html = render_to_string :partial => "users/ajax/login_links"
    end
    render_ajax( {html: html, id: params['id']} )
  end

  # Privacy policy
  def privacy
    html = render_to_string :partial => "users/privacy"
    render_ajax( {html: html})
  end
  # Terms of use
  def terms
    html = render_to_string :partial => "users/terms"
    render_ajax( {html: html} )
  end

  # Return a list of visible users based on input criteria
  def users
    current_affiliate.set_entity_url(request.referrer, 'users') if current_affiliate.present? && current_affiliate.id.present?
    more_pages = false
    if params[:moderation] == "true"
      data = User.needing_moderation(current_user, current_affiliate)
    else
      data, more_pages = User.find_all_visible(current_user, current_affiliate, fix_params(params, 'users'))
    end
    if session[:visits_user].nil?
      Visit.create(:page => Visit::USERS,:user_id => (user_logged_in? ? current_user.id : nil), :affiliate_id => (current_affiliate.id.present? ? current_affiliate.id : 0), :ip => request.remote_ip)
      session[:visits_user] = true
    end
    data = data.map { |i| user_hash(i) }
    render_ajax( {data: data, more_pages: more_pages} )
  end

  # Return a list of visible users based on input criteria
  def jobs
    current_affiliate.set_entity_url(request.referrer, 'jobs') if current_affiliate.present? && current_affiliate.id.present?
    more_pages = false
    if params[:moderation] == "true"
      data = Job.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Job.get_mine(current_user)
    else
      data, more_pages = Job.find_all_visible(current_user, current_affiliate, fix_params(params, 'jobs'))
    end
    if session[:visits_job].nil?
      Visit.create(:page => Visit::JOBS,:user_id => (user_logged_in? ? current_user.id : nil), :affiliate_id => (current_affiliate.id.present? ? current_affiliate.id : 0), :ip => request.remote_ip)
      session[:visits_job] = true
    end
    render_ajax( {data: data, more_pages: more_pages} )
  end

  def events
    current_affiliate.set_entity_url(request.referrer, 'events') if current_affiliate.present? && current_affiliate.id.present?
    more_pages = false
    if params[:moderation] == "true"
      data = Event.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Event.get_mine(current_user)
    else
      data, more_pages = Event.find_all_visible(current_user, current_affiliate, fix_params(params, 'events'))
    end
    if session[:visits_event].nil?
      Visit.create(:page => Visit::EVENTS,:user_id => (user_logged_in? ? current_user.id : nil), :affiliate_id => (current_affiliate.id.present? ? current_affiliate.id : 0), :ip => request.remote_ip)
      session[:visits_event] = true
    end
    render_ajax( {data: data, more_pages: more_pages} )
  end

  def discussions
    current_affiliate.set_entity_url(request.referrer, 'discussions') if current_affiliate.present? && current_affiliate.id.present?
    more_pages = false
    if params[:moderation] == "true"
      data = Discussion.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Discussion.get_mine(current_user)
    else
      data, more_pages = Discussion.find_all_visible(current_user, current_affiliate, fix_params(params, 'discussions'))
    end
    if session[:visits_discussion].nil?
      Visit.create(:page => Visit::DISCUSSIONS,:user_id => (user_logged_in? ? current_user.id : nil), :affiliate_id => (current_affiliate.id.present? ? current_affiliate.id : 0), :ip => request.remote_ip)
      session[:visits_discussion] = true
    end
    render_ajax( {data: data, more_pages: more_pages} )
  end

  def blogs
    current_affiliate.set_entity_url(request.referrer, 'blogs') if current_affiliate.present? && current_affiliate.id.present?
    more_pages = false
    if params[:moderation] == "true"
      data = Blog.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Blog.get_mine(current_user)
    else
      data, more_pages = Blog.find_all_visible(current_user, current_affiliate, fix_params(params, 'blogs'))
    end
    if session[:visits_blog].nil?
      Visit.create(:page => Visit::BLOGS,:user_id => (user_logged_in? ? current_user.id : nil), :affiliate_id => (current_affiliate.id.present? ? current_affiliate.id : 0), :ip => request.remote_ip)
      session[:visits_blog] = true
    end
    render_ajax( {data: data, more_pages: more_pages} )
  end

  def get_comments
    params[:title] = '' if params[:title].blank?
    CommentDetail.update(params[:hash], params[:title], params[:url])
    output = Comment.get_all_comments(params[:hash])
    render_ajax "{ title: \"#{params[:title].gsub('"','')}\", subscribed: #{user_logged_in? && CommentSubscriber.subscribed?(params[:hash], current_user) ? 'true' : 'false'}, data: #{output.to_json(:include => :subcomments)}, hash: '#{params[:hash]}' }"
  end

  def get_comment
    if params[:model] == 'Comment'
      output = Comment.find(params[:id].to_i)
    else
      output = Subcomment.find(params[:id].to_i)
    end
    render_ajax( {data: output} )
  end
  def delete_comment
    if params[:model] == 'Comment'
      output = Comment.find(params[:id].to_i)
    else
      output = Subcomment.find(params[:id].to_i)
    end
    output.destroy if current_user.present? && ((current_user == output.user) || current_user.admin?)
    render_ajax
  end
  def subscribe_comment
    CommentSubscriber.subscribe(params[:hash], current_user)
    render_ajax
  end
  def unsubscribe_comment
    CommentSubscriber.unsubscribe(params[:hash], current_user)
    render_ajax
  end

  def show
    return render_ajax( {html: '<h1>An error has occurred</h1><p>We have been notified and will work to fix this issue.</p>'}) if params[:model].nil? || params[:id].nil?
    item = params[:model].constantize.find_by_id(params[:id])
    return render_ajax(html: 'This item no longer exists.  It may have been removed by its author.') unless item.present?
    item.mark_read(user_logged_in? ? current_user.id : 0, current_affiliate.id, request.remote_ip)
    @item = item
    @item.version_control(current_user, current_affiliate)
    output = render_to_string :partial => "#{@item.method_name}/show", :locals => {ajax: 1}
    if item.instance_of?(Discussion) || item.instance_of?(Blog)
      CommentDetail.update(item.comment_hash, item.name, item.static_url)
      comments = Comment.get_all_comments(item.comment_hash)
      execute = "EnergyFolks.Populate_Comments({ title: \"#{item.name.present? ? item.name.gsub('"','') : ''}\", subscribed: #{user_logged_in? && CommentSubscriber.subscribed?(item.comment_hash, current_user) ? 'true' : 'false'}, data: #{comments.to_json(:include => :subcomments)}, hash: '#{item.comment_hash}' });"
      render_ajax( {html: output, execute: execute} )
    else
      render_ajax( {html: output} )
    end
  end

  def tags
    tag = Tag.where("name LIKE ?", "%#{params[:q].downcase}%").all.map{ |r| {id: r.name.capitalize, text: r.name.capitalize } }
    render :json => tag.to_json
  end

  def toggle_highlight
    item = params[:model].constantize.find_by_id(params[:id])
    affiliate = Affiliate.find_by_id(params[:aid])
    response = item.toggle_highlight(current_user, affiliate)
    output = render_to_string :partial => "common/ajax_link", :locals => {text: "#{item.highlighted?(affiliate) ? 'Unhighlight' : 'Highlight'} Post", command: "toggle_highlight", params: {id: item.id, aid: params[:aid], model: params[:model]}, delete: false}
    render_ajax({notice: response, element_id: params[:element_id], remove_item:0, new_item: output})
  end

  def delete
    item = params[:model].constantize.find_by_id(params[:id])
    if current_user.present? && ((current_user.id == item.user_id) || current_user.admin?)
      item.destroy
      render_ajax({notice: 'Item has been deleted', element_id: params[:element_id], new_item: '', remove_item: params[:id]})
    else
      render_ajax({notice: 'Not authorized!', element_id: params[:element_id], new_item: 'ERROR', remove_item: 0})
    end
  end

  def approve
    item = params[:model].constantize.find_by_id(params[:id])
    affiliate = Affiliate.find_by_id(params[:aid])
    response = item.approve(current_user, affiliate, params[:highlight] == "true")
    render_ajax({notice: response, element_id: params[:element_id], new_item: '', remove_item: item.id})
  end

  def reject
    affiliate = Affiliate.find_by_id(params[:aid])
    item = params[:model].constantize.find_by_id(params[:id])
    response = item.reject_or_remove(current_user, affiliate, params[:reason])
    render_ajax({notice: response, element_id: params[:element_id], new_item: '', remove_item: item.id})
  end

  private
  def render_ajax(output = nil)
    if output.blank?
      render :js => "//Completed"
    else
      output[:width] ||= 900 unless output.is_a?(String)  # default popup window width, if needed
      if params['load_all'] == 'true'
        set_current_user = user_logged_in? ? "EnergyFolks.user_logged_in = true;EnergyFolks.current_user = #{user_hash(current_user).to_json};" : ''
        set_affiliate = current_affiliate.present? && current_affiliate.id.present? ? "EnergyFolks.color = '#{current_affiliate.color}';EnergyFolks.url_events = '#{current_affiliate.url_events}';EnergyFolks.url_discussions = '#{current_affiliate.url_discussions}';EnergyFolks.url_users = '#{current_affiliate.url_users}';EnergyFolks.url_jobs = '#{current_affiliate.url_jobs}';EnergyFolks.url_blogs = '#{current_affiliate.url_blogs}';EnergyFolks.$('.ef_a_name').html('#{current_affiliate.name.gsub(/'/, "\\'")}');" : ''
        lat = 37.8044
        lng = -122.2708
        loc = 'Oakland, CA'
        rad_e = 50
        rad_j = 0
        if current_affiliate.present? && current_affiliate.id.present? && current_affiliate.latitude.present?
          lat = current_affiliate.latitude
          lng = current_affiliate.longitude
          loc = current_affiliate.location
          rad_e = current_affiliate.event_radius
          rad_j = current_affiliate.job_radius
        elsif user_logged_in? && current_user.latitude.present?
          lat = current_user.latitude
          lng = current_user.longitude
        end
        set_tags = Tag.popular_tags.map { |t| "'#{t.name.capitalize.gsub("'",'')}'" }.join(',')
        set_latlng = "if(EnergyFolks.map_lat == 0) { EnergyFolks.map_lat=#{lat};EnergyFolks.map_lng=#{lng}; } if(EnergyFolks.map_location_lat == 0) { EnergyFolks.map_location_lat=#{lat};EnergyFolks.map_location_lng=#{lng};EnergyFolks.map_location_radius=(EnergyFolks.source == 'events' ? #{rad_e} : #{rad_j});EnergyFolks.map_location_name='#{loc.gsub(/'/, "\\'")}';EnergyFolks.$('#ef_filter_location').val(EnergyFolks.map_location_name);if(EnergyFolks.map_location_radius == 0) { EnergyFolks.$('.ef_location_radio1').prop('checked', true); } else { EnergyFolks.$('.ef_location_radio2').prop('checked', true); }EnergyFolks.$('#ef_filter_radius').val(EnergyFolks.map_location_radius);EnergyFolks.UpdateFilterText(); }"
      else
        set_current_user = ''
        set_affiliate = ''
        set_tags = ''
        set_latlng = ''
      end
      render :js => "EnergyFolks.load_all = false;if(EnergyFolks.tag_list.length == 0) { EnergyFolks.tag_list = [#{set_tags}]; EnergyFolks.tag_list.sort(); EnergyFolks.UpdateFilterText(); } #{set_current_user}#{set_affiliate}#{set_latlng}EnergyFolks.callbacks[#{params['callback']}](#{output.is_a?(String) ? output : output.to_json});EnergyFolks.callbacks[#{params['callback']}] = null;EnergyFolks.load_all = false;"
    end
  end
  def fix_params(inputs, source)
    inputs[:month] = inputs[:month].to_i
    inputs[:per_page] = inputs[:per_page].to_i
    inputs[:page] = inputs[:page].to_i
    inputs[:shift] = (inputs[:shift] == 'true')
    inputs[:highlight] = 0
    inputs[:radius] = inputs[:radius].to_i
    inputs[:source] = inputs[:source].to_i
    inputs[:location_lat] = inputs[:location_lat].to_f
    inputs[:location_lng] = inputs[:location_lng].to_f
    if(inputs[:location_lng] == 0) && (inputs[:location_lat] == 0)
      lat = 37.8044
      lng = -122.2708
      rad_e = 50
      rad_j = 0
      if current_affiliate.present? && current_affiliate.id.present? && current_affiliate.latitude.present?
        lat = current_affiliate.latitude
        lng = current_affiliate.longitude
        rad_e = current_affiliate.event_radius
        rad_j = current_affiliate.job_radius
      elsif user_logged_in? && current_user.latitude.present?
        lat = current_user.latitude
        lng = current_user.longitude
      end
      inputs[:location_lat] = lat
      inputs[:location_lng] = lng
      inputs[:radius] = source == 'events' ? rad_e : rad_j
    end
    inputs[:radius] = inputs[:radius] * 1609.34
    if (inputs[:source] == 3) && current_affiliate.present? && current_affiliate.id.present?
      inputs[:highlight] = current_affiliate.id
    end
    if (inputs[:source] == 2) && current_affiliate.present? && current_affiliate.id.present?
      inputs[:source] = current_affiliate.id
    else
      inputs[:source] = 0
    end
    return inputs
  end

end