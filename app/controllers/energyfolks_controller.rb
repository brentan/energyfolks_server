class EnergyfolksController < ApplicationController
  def temp_wordpress_fix
    if user_logged_in? && (current_user.id == 1)
      output = {
          picture_url: '',
          visibility: 1,
          affiliates: [],
          position: 'position',
          company: 'company',
          has_posts: false,
          posts: [],
          email: 'brentan@energyfolks.com',
          first_name: 'Brentan',
          last_name: 'Alexander',
          user_id: 1,
          user: 'EnergyfolksUser_1',
          pass: Digest::MD5.hexdigest("#{params['c']}EnergyFolks1"),
          role: 4
      }
    else
      output = {}
    end
    render json: output
  end

  def index

  end
  def privacy

  end
  def terms

  end
  def contact

  end
  def add_your_group

  end
  def new

  end
  def locate
    name = ''
    success = false
    begin
      results = Geocoder.search(params[:location])
      if results.length > 0
        name = results[0].data['formatted_address'].gsub(', USA','')
        success = true
      end
    rescue
    end
    render :json => {success: success, name: name}
  end
end
