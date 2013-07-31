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

end