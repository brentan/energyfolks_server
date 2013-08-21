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

  # Display links to login/create account.  If a user is already logged in, show link to profile/logout
  def loginLinks
    if user_logged_in?
      html = render_to_string :partial => "users/ajax/profile_links"
    else
      html = render_to_string :partial => "users/ajax/login_links"
    end
    render_ajax( {html: html, id: params['id']} )
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
      data = Job.find_all_visible(current_user, current_affiliate, params[:start].to_i, params[:end].to_i - params[:start].to_i)
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
    render_ajax({notice: response, element_id: params[:element_id], remove_item:0, new_item: ajax_link("#{item.highlighted?(affiliate) ? 'Unhighlight' : 'Highlight'} Post", "toggle_highlight", {id: item.id, aid: params[:aid]})})
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
      render :js => "#{set_current_user}EnergyFolks.callbacks[#{params['callback']}](#{output.to_json});EnergyFolks.callbacks[#{params['callback']}] = null;"
    end
  end

end