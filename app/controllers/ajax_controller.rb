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
    data = User.find_all_visible(current_user, current_affiliate, params[:start].to_i, params[:end].to_i - params[:start].to_i)
    data = data.map { |i| user_hash(i) }
    #TODO: moderation count!
    render_ajax( {data: data} )
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