class NotificationMailer < ActionMailer::Base
  layout 'site_mailer'

  def awaiting_moderation(recipients, affiliate, item, join_item)
    @item = item
    @join_item = join_item
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    recipients.each do |user|
      @user = user
      mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "A new #{item.entity_type} is awaiting moderation")
    end
  end

  def entity(user, entity, token)
    @item = entity
    @user = user
    @token = token
    @affiliate = user.affiliate
    @host = @affiliate.entity_url(entity)
    if(entity.instance_of?(Discussion))
      from = "comment_0_#{entity.comment_hash}"
      mail(to: @user.email, reply_to: "#{from}@reply.energyfolks.com", from: 'messages@energyfolks.com', subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:#{entity.entity_type}] #{entity.name}")
    else
      mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:#{entity.entity_type}] #{entity.name}")
    end
  end

  def new_comment_or_reply(user, entity)
    @entity = entity
    @user = user
    @affiliate = user.affiliate
    from = "comment_#{entity.comment_id}_#{entity.unique_hash}"
    mail(to: @user.email, from: 'messages@energyfolks.com', reply_to: "#{from}@reply.energyfolks.com", subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:New Comment] #{entity.name}")
  end

  def item_removed(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @reason = reason
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    @user = @item.user
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_type} has been removed")

  end

  def item_rejected(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @reason = reason
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_type} has been rejected")
  end

  def item_approved(item, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_type} has been approved")
  end

end