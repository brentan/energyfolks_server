class UserMailer < ActionMailer::Base
  helper ActionView::Helpers::UrlHelper
  layout 'site_mailer'

  def confirmation_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Confirm your #{@affiliate.name} account")
  end

  def email_verification_request(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: [@user.email, @user.email_to_verify], from: from, subject: "Confirm your #{@affiliate.name} account email change")
  end

  def email_verification_request_2(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: [@user.email, @user.email_to_verify], from: from, subject: "Your #{@affiliate.name} account email has been changed")
  end

  def reset_password(user, aid, host)
    @user = user
    @host = host
    @aid = aid
    @token = user.password_reset_token
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Reset your #{@affiliate.name} password")
  end

  def reset_password_2(user, aid, host)
    @host = host
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{@affiliate.name} password has been changed")
  end

  def account_frozen(user, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = user
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{@affiliate.name} account was frozen")
  end

  def affiliate_approved(user_id, aid, host)
    @host = host
    @aid = aid
    @user = User.find_by_id(user_id)
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your request to join #{@affiliate.name} was approved")
  end

  def affiliate_removed(user_id, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = User.find_by_id(user_id)
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your membership with #{@affiliate.name} has been revoked")
  end

  def affiliate_rejected(user_id, reason, aid, host)
    @host = host
    @reason = reason
    @aid = aid
    @user = User.find_by_id(user_id)
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your request to join #{@affiliate.name} was approved")
  end

  def donation_complete(user_id, donation)
    @host = SITE_HOST
    @donation = donation
    @aid = 0
    @user = User.find_by_id(user_id)
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "EnergyFolks Donation Receipt.  Thank you!")
  end

  def donation_refunded(user_id, donation)
    @host = SITE_HOST
    @donation = donation
    @aid = 0
    @user = User.find_by_id(user_id)
    @affiliate = Affiliate.find_by_id(@aid)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "EnergyFolks Donation Refund Processed")
  end

end