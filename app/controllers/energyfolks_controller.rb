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
  def expenses
    redirect_to "http://goo.gl/forms/cfRKKmD4mu"
  end

  def donate
    @user = current_user if user_logged_in?
    if params[:card].present?
      if params[:card] == 'new'
        customer = StripeToken.new_customer(@user, params[:token], params[:card_type], params[:last4])
        card = StripeToken.create!(user_id: @user.id, token: customer, last4: params[:last4], card_type: params[:card_type])
      else
        card = StripeToken.where(user_id: @user.id, id: params[:card].to_i).first
      end
      success, message = card.charge(params[:amount], nil)
      card.destroy unless success
      flash[success ? :notice : :alert] = message
      @just_donated = success
    else
      @just_donated = false
    end
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
