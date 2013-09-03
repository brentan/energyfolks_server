class NotificationMailer < ActionMailer::Base
  layout 'site_mailer'

  def awaiting_moderation(recipients, affiliate, item, join_item)
    @item = item
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @join_item = join_item
    @affiliate = affiliate
    recipients.each do |user|
      @user = user
      mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "A new #{item.entity_name} #{item.entity_type} is awaiting moderation")
    end
  end

  def entity(user, entity)
    @item = entity
    @user = user
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "[TODO-MAIN AFFILIATE:#{entity.entity_name} #{entity.entity_type}] #{entity.name}")
  end

  def item_removed(item, reason, affiliate)
    @item = item
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @reason = reason
    @affiliate = affiliate
    @user = @item.user
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been removed")

  end

  def item_rejected(item, reason, affiliate)
    @item = item
    @user = @item.user
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @reason = reason
    @affiliate = affiliate
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been rejected")
  end

  def item_approved(item, affiliate)
    @item = item
    @user = @item.user
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @affiliate = affiliate
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been approved")
  end

end