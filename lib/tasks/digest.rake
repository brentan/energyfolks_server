# encoding: UTF-8

namespace :digest do

  desc "Send Weekly Digest"
  task :weekly => :environment do
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
  end

  desc "Send Daily Digest"
  task :daily => :environment do
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
  end

end