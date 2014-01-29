class NotificationMailer < ActionMailer::Base
  helper ActionView::Helpers::UrlHelper
  layout 'site_mailer'

  def awaiting_moderation(user_id, aid, item_id, item_model, join_item)
    @item = item_model.constantize.find(item_id)
    @join_item = join_item
    @affiliate = Affiliate.find_by_id(aid)
    @host = @affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    @user = User.find_by_id(user_id)
    mail(to: @user.email, from: from, subject: "A new #{item.entity_type} is awaiting moderation")
  end

  def auto_import_complete(user, aid, numbers)
    @user = user
    @affiliate = Affiliate.find_by_id(aid)
    @numbers = numbers
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "New imported events awaiting moderation")
  end

  def auto_import_failure(user, aid, url)
    @user = user
    @affiliate = Affiliate.find_by_id(aid)
    @url = url
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Auto-import failure")
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
      mail(to: @user.email, reply_to: "comment_#{reply_to}@reply.energyfolks.com", from: from, subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}: #{entity.entity_type(true)}] #{entity.name}")
    else
      mail(to: @user.email, from: from, subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}: #{entity.entity_type(true)}] #{entity.name}")
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
    @condensed_header = true
    reply_to = CommentEmailHash.get_hash("comment_#{entity.comment_id}_#{entity.unique_hash}")
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, reply_to: "comment_#{reply_to}@reply.energyfolks.com", subject: "[#{@affiliate.present? ? @affiliate.name : 'EnergyFolks'}: New Comment] #{entity.name}")
  end

  def item_removed(item_id, item_model, reason, aid)
    item = item_model.constantize.find(item_id)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    return if item.user_id.blank? || (item.user_id == -1)
    @item = item
    @reason = reason
    @affiliate = Affiliate.find_by_id(aid)
    @host = @affiliate.entity_url(item)
    @user = @item.user
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been removed")

  end

  def item_rejected(item_id, item_model, reason, aid)
    item = item_model.constantize.find(item_id)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    return if item.user_id.blank? || (item.user_id == -1)
    @item = item
    @user = @item.user
    @reason = reason
    @affiliate = Affiliate.find_by_id(aid)
    @host = @affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been rejected")
  end

  def item_approved(item_id, item_model, aid)
    item = item_model.constantize.find(item_id)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    return if item.user_id.blank? || (item.user_id == -1)
    @item = item
    @user = @item.user
    @affiliate = Affiliate.find_by_id(aid)
    @host = @affiliate.entity_url(item)
    from = @affiliate.present? && @affiliate.id.present? ? "#{@affiliate.name} <#{@affiliate.email_name}@energyfolks.com>" : "EnergyFolks <donotreply@energyfolks.com>"
    mail(to: @user.email, from: from, subject: "Your #{item.entity_type} has been approved")
  end

end