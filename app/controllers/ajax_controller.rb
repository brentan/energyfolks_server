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
    render_ajax( {html: html, id: params['id']}.to_json , params['callback'])
  end

  # Display links to login/create account.  If a user is already logged in, show link to profile/logout
  def loginLinks
    if user_logged_in?
      html = render_to_string :partial => "users/ajax/profile_links"
    else
      html = render_to_string :partial => "users/ajax/login_links"
    end
    render_ajax( {html: html, id: params['id']}.to_json , params['callback'])
  end

  private
  def render_ajax(output = nil,callback = nil)
    if output.blank?
      render :js => "//Completed"
    else
      render :js => "EnergyFolks.callbacks[#{callback}](#{output});EnergyFolks.callbacks[#{callback}] = null;"
    end
  end

end