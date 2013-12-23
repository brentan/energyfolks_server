class NotificationMailer < ActionMailer::Base
  helper ActionView::Helpers::UrlHelper
  layout 'site_mailer'

  def awaiting_moderation(recipients, affiliate, item, join_item)
    @item = item
    @join_item = join_item
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    recipients.each do |user|
      @user = user
      mail(to: @user.email, from: from, subject: "A new #{item.entity_type} is awaiting moderation")
    end
  end

  def entity(user, entity, token)
    @item = entity
    @user = user
    @token = token
    @affiliate = Affiliate.find_by_id(user.affiliate_id)
    @host = @affiliate.entity_url(entity)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    if(entity.instance_of?(Discussion))
      reply_to = CommentEmailHash.get_hash("comment_0_#{entity.comment_hash}")
      mail(to: @user.email, reply_to: "comment_#{reply_to}@reply.energyfolks.com", from: from, subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:#{entity.entity_type}] #{entity.name}")
    else
      mail(to: @user.email, from: from, subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:#{entity.entity_type}] #{entity.name}")
    end
  end

  def digest(user, items, token, weekly)
    @user = user
    @token = token
    @items = items
    @affiliate = Affiliate.find_by_id(user.affiliate_id)
    @weekly = weekly
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}] Your #{weekly ? 'Weekly' : 'Daily'} digest")
  end

  def new_comment_or_reply(user, entity)
    @entity = entity
    @user = user
    @affiliate = Affiliate.find_by_id(user.affiliate_id)
    reply_to = CommentEmailHash.get_hash("comment_#{entity.comment_id}_#{entity.unique_hash}")
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, reply_to: "comment_#{reply_to}@reply.energyfolks.com", subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}:New Comment] #{entity.name}")
  end

  def item_removed(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @reason = reason
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    @user = @item.user
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been removed")

  end

  def item_rejected(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @reason = reason
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been rejected")
  end

  def item_approved(item, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @affiliate = affiliate
    @host = affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been approved")
  end

end