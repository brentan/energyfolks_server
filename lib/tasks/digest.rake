# encoding: UTF-8

namespace :digest do

  desc "Send Weekly Digest"
  task :weekly => :environment do
    if false
    now = Time.now()
    User.verified.joins(:subscription).where(subscriptions: {weekly: true}).all.each do |u|
      next if u.affiliate.present? && !u.affiliate.send_digest?
      begin
        next unless now.in_time_zone(u.timezone).strftime('%w') == '1'
        next unless now.in_time_zone(u.timezone).strftime('%H') == '02'
        digest = DigestMailer.create(user: u, weekly: true)
        items, send_it = digest.items
        if send_it
          NotificationMailer.digest(u, items, digest.token, true).deliver
        else
          digest.destroy
        end
      rescue
      end
    end
    end
  end

  desc "Send Daily Digest"
  task :daily => :environment do
    if false
    now = Time.now()
    User.verified.joins(:subscription).where(subscriptions: {daily: true}).all.each do |u|
      next if u.affiliate.present? && !u.affiliate.send_digest?
      begin
        next unless now.in_time_zone(u.timezone).strftime('%H') == '02'
        digest = DigestMailer.create(user: u, weekly: false)
        items, send_it = digest.items
        if send_it
          NotificationMailer.digest(u, items, digest.token, false).deliver
        else
          digest.destroy
        end
      rescue
      end
    end
    end
  end

end