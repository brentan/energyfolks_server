class UserMailer < ActionMailer::Base
  layout 'site_mailer'

  def confirmation_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Confirm your #{@affiliate.name} account")
  end

  def email_verification_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: [@user.email, @user.email_to_verify], from: 'accounts@energyfolks.com', subject: "Confirm your #{@affiliate.name} account email change")
  end

  def email_verification_request_2(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: [@user.email, @user.email_to_verify], from: 'accounts@energyfolks.com', subject: "Your #{@affiliate.name} account email has been changed")
  end

  def reset_password(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @token = user.password_reset_token
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Reset your #{@affiliate.name} password")
  end

  def reset_password_2(user, aid, host)
    @host = host
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your #{@affiliate.name} password has been changed")
  end

  def account_frozen(user, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your #{@affiliate.name} account was frozen")
  end

  def affiliate_approved(user, aid, host)
    @host = host
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your request to join #{@affiliate.name} was approved")
  end

  def affiliate_removed(user, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your membership with #{@affiliate.name} has been revoked")
  end

  def affiliate_rejected(user, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    mail(to: @user.email, from: 'accounts@energyfolks.com', subject: "Your request to join #{@affiliate.name} was approved")
  end

end