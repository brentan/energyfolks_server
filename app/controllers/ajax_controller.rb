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
      data = Job.find_all_visible(current_user, current_affiliate, fix_params(params))
    end
    render_ajax( {data: data} )
  end

  def events
    if params[:moderation] == "true"
      data = Event.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Event.get_mine(current_user)
    else
      data = Event.find_all_visible(current_user, current_affiliate, fix_params(params))
    end
    render_ajax( {data: data} )
  end

  def bulletins
    if params[:moderation] == "true"
      data = Bulletin.needing_moderation(current_user, current_affiliate)
    elsif params[:my_posts] == "true"
      data = Bulletin.get_mine(current_user)
    else
      data = Bulletin.find_all_visible(current_user, current_affiliate, fix_params(params))
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
      set_affiliate = current_affiliate.present? && current_affiliate.id.present? ? "EnergyFolks.color = #{current_affiliate.color};" : ''
      lat = 37.8044
      lng = -122.2708
      if current_affiliate.present? && current_affiliate.id.present? && current_affiliate.latitude.present?
        lat = current_affiliate.latitude
        lng = current_affiliate.longitude
      elsif user_logged_in? && current_user.latitude.present?
        lat = current_user.latitude
        lng = current_user.longitude
      end
      set_latlng = "if(EnergyFolks.map_lat == 0) { EnergyFolks.map_lat=#{lat};EnergyFolks.map_lng=#{lng}; }"
      render :js => "#{set_current_user}#{set_affiliate}#{set_latlng}EnergyFolks.callbacks[#{params['callback']}](#{output.to_json});EnergyFolks.callbacks[#{params['callback']}] = null;"
    end
  end
  def fix_params(inputs)
    inputs[:month] = inputs[:month].to_i
    inputs[:per_page] = inputs[:per_page].to_i
    inputs[:page] = inputs[:page].to_i
    inputs[:shift] = (inputs[:shift] == 'true')
    inputs[:highlight] = (inputs[:highlight] == 'true')
    return inputs
  end

end