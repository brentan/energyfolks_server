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
    if params[:moderation] == "true"
      data = User.needing_moderation(current_user, current_affiliate)
    else
      data = User.find_all_visible(current_user, current_affiliate, params[:start].to_i, params[:end].to_i - params[:start].to_i)
    end
    data = data.map { |i| user_hash(i) }
    render_ajax( {data: data} )
  end

  # Return a list of visible users based on input criteria
  def jobs
    if params[:moderation] == "true"
      data = Job.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Job.get_mine(current_user)
    else
      data = Job.find_all_visible(current_user, current_affiliate, fix_params(params, 'jobs'))
    end
    render_ajax( {data: data} )
  end

  def events
    if params[:moderation] == "true"
      data = Event.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Event.get_mine(current_user)
    else
      data = Event.find_all_visible(current_user, current_affiliate, fix_params(params, 'events'))
    end
    render_ajax( {data: data} )
  end

  def discussions
    if params[:moderation] == "true"
      data = Discussion.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Discussion.get_mine(current_user)
    else
      data = Discussion.find_all_visible(current_user, current_affiliate, fix_params(params, 'discussions'))
    end
    render_ajax( {data: data} )
  end

  def show
    @item = params[:model].constantize.find_by_id(params[:id])
    output = render_to_string :partial => "#{@item.method_name}/show"
    render_ajax( {html: output} )
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

  private
  def render_ajax(output = nil)
    if output.blank?
      render :js => "//Completed"
    else
      output[:width] ||= 900   # default popup window width, if needed
      set_current_user = user_logged_in? ? "EnergyFolks.user_logged_in = true;EnergyFolks.current_user = #{user_hash(current_user).to_json};" : ''
      set_affiliate = current_affiliate.present? && current_affiliate.id.present? ? "EnergyFolks.color = #{current_affiliate.color};EnergyFolks.$('.ef_a_name').html('#{current_affiliate.name.gsub(/'/, "\\'")}');" : ''
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
      set_latlng = "if(EnergyFolks.map_lat == 0) { EnergyFolks.map_location_radius=(EnergyFolks.source == 'events' ? #{rad_e} : #{rad_j});EnergyFolks.map_location_name='#{loc.gsub(/'/, "\\'")}';EnergyFolks.$('#ef_filter_location').val(EnergyFolks.map_location_name);if(EnergyFolks.map_location_radius == 0) { EnergyFolks.$('.ef_location_radio1').prop('checked', true); } else { EnergyFolks.$('.ef_location_radio2').prop('checked', true); }EnergyFolks.$('#ef_filter_radius').val(EnergyFolks.map_location_radius);EnergyFolks.map_lat=#{lat};EnergyFolks.map_lng=#{lng};EnergyFolks.UpdateFilterText(); }"
      render :js => "#{set_current_user}#{set_affiliate}#{set_latlng}EnergyFolks.callbacks[#{params['callback']}](#{output.to_json});EnergyFolks.callbacks[#{params['callback']}] = null;"
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