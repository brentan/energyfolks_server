# encoding: UTF-8

namespace :digest do

  desc "Send Weekly Digest"
  task :weekly => :environment do
    operation = ScheduledOperation.start('Weekly Digest')
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
    operation.mark_complete
  end

  desc "Send Daily Digest"
  task :daily => :environment do
    operation = ScheduledOperation.start('Daily Digest')
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
    operation.mark_complete
  end


  desc "Force Send Weekly Digest"
  task :force_weekly => :environment do
    operation = ScheduledOperation.start('Force Weekly Digest')
    User.verified.joins(:subscription).where(subscriptions: {weekly: true}).all.each do |u|
      next if u.affiliate.present? && !u.affiliate.send_digest?
      begin
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
    operation.mark_complete
  end

  desc "Force Send Daily Digest"
  task :force_daily => :environment do
    operation = ScheduledOperation.start('Force Daily Digest')
    User.verified.joins(:subscription).where(subscriptions: {daily: true}).all.each do |u|
      next if u.affiliate.present? && !u.affiliate.send_digest?
      begin
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
    operation.mark_complete
  end
end