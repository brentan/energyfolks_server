class EnergyfolksController < ApplicationController
  def index
    GoogleClient.build_client
    redirect_to '/'
  end
  def privacy

  end
  def terms

  end
end
