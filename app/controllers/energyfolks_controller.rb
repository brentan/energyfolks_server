class EnergyfolksController < ApplicationController

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
