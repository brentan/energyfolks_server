class UserMailer < ActionMailer::Base
  layout 'site_mailer'

  def confirmation_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    # TODO: set @affiliate and use its name
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Confirm your #{'energyfolks'} account")
  end

  def email_verification_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    # TODO: set @affiliate and use its name
    mail(to: [@user.email, @user.email_to_verify], from: 'accounts@energyfolks.com', subject: "Confirm your #{'energyfolks'} account email change")
  end

  def email_verification_request_2(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    # TODO: set @affiliate and use its name
    mail(to: [@user.email, @user.email_to_verify], from: 'accounts@energyfolks.com', subject: "Your #{'energyfolks'} account email has been changed")
  end

  def reset_password(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @token = user.password_reset_token
    # TODO: set @affiliate and use its name
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Reset your #{'energyfolks'} password")
  end

  def reset_password_2(user, aid, host)
    @host = host
    @aid = aid
    @user = user
    # TODO: set @affiliate and use its name
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your #{'energyfolks'} password has been changed")
  end

end