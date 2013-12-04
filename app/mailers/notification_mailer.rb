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
    if(entity.instance_of?(Discussion))
      from = "comment_0_#{entity.comment_hash}"
      mail(to: @user.email, reply_to: "#{from}@reply.energyfolks.com", from: 'messages@energyfolks.com', subject: "[TODO-MAIN AFFILIATE:#{entity.entity_name} #{entity.entity_type}] #{entity.name}")
    else
      mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "[TODO-MAIN AFFILIATE:#{entity.entity_name} #{entity.entity_type}] #{entity.name}")
    end
  end

  def new_comment_or_reply(user, entity)
    @entity = entity
    @user = user
    from = "comment_#{entity.comment_id}_#{entity.unique_hash}"
    mail(to: @user.email, from: 'messages@energyfolks.com', reply_to: "#{from}@reply.energyfolks.com", subject: "[TODO-MAIN AFFILIATE:New Comment] #{entity.name}")
  end

  def item_removed(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @reason = reason
    @affiliate = affiliate
    @user = @item.user
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been removed")

  end

  def item_rejected(item, reason, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @reason = reason
    @affiliate = affiliate
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been rejected")
  end

  def item_approved(item, affiliate)
    return if item.instance_of?(Blog) #Blogs are only posted by admins, so approval/denial notices are not needed
    @item = item
    @user = @item.user
    @host = SITE_HOST #"http://dev.energyfolks.com:3000" #TODO: Fix this to be based on affiliate
    @affiliate = affiliate
    mail(to: @user.email, from: 'donotreply@energyfolks.com', subject: "Your #{item.entity_name} #{item.entity_type} has been approved")
  end

end