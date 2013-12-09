class EmailsController < ApplicationController

  def edit
    @email_settings_token= EmailSettingsToken.find_by_token(params[:token])

    if @email_settings_token
      @user = @email_settings_token.user
      @email_settings_token.update_token
    else
      redirect_to '/', notice: "Unable to find token"
    end
  end

  def update
    @email_settings_token= EmailSettingsToken.find_by_token(params[:token])

    if @email_settings_token
      @email_settings_token.update_token
      user = @email_settings_token.user
      params[:user][:subscription_attributes].each do |key,item|
        user.subscription.send("#{key}=", item)
      end
      user.subscription.save!
      user.delay.sync
      redirect_to :back, notice: 'Email Settings Saved!'
    else
      redirect_to :back, alert: "Unable to update settings"
    end

  end

  def open
    email = Email.find_by_token(params[:token])
    email.mark_read if email.present?
    # Serve a small transparent 1x1 gif image
    send_data(Base64.decode64("R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="), :type => "image/gif", :disposition => "inline")
  end
end
