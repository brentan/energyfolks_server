# encoding: UTF-8

namespace :nightly do

  desc "Synchronize information with all wordpress affiliates"
  task :wordpress => :environment do
    operation = ScheduledOperation.start('wordpress sync')
    require 'open-uri'
    Affiliate.all.each do |affiliate|
      next if affiliate.shared_secret.blank?
      next if affiliate.url.blank?
      begin
        js_hash = Rails.application.assets.find_asset('energyfolks.js').digest_path.split('-')[1].split('.')[0]
        css_hash = Rails.application.assets.find_asset('energyfolks.css').digest_path.split('-')[1].split('.')[0]
        response = open("#{affiliate.url}?enfolks_update=true&color=#{affiliate.color}&js_hash=#{js_hash}&css_hash=#{css_hash}").read
        if response == 'COMPLETE'
          affiliate.update_column(:wordpress_css_hash, css_hash)
          affiliate.update_column(:wordpress_js_hash, js_hash)
        end
      rescue
      end
    end
    operation.mark_complete
  end

  desc "Send Analytics Emails"
  task :analytics => :environment do
    operation = ScheduledOperation.start('send analytics')
    start = 14.days.ago
    endt = 15.days.ago
    Job.where(donate: true).where("first_approved_at < ? AND first_approved_at > ?",start, endt).all.each do |j|
      NotificationMailer.item_analytics(j.user, j).deliver() if j.user.present?
    end
    start = 28.days.ago
    endt = 29.days.ago
    Job.where(donate: true).where("first_approved_at < ? AND first_approved_at > ?",start, endt).all.each do |j|
      NotificationMailer.item_analytics(j.user, j).deliver() if j.user.present?
    end
    operation.mark_complete
  end

  desc "Resynchronize with google"
  task :google => :environment do
    operation = ScheduledOperation.start('google sync')
    google = GoogleClient.new
    google.sync_global
    Affiliate.all.each { |a|
      google.sync_affiliate(a)
    }
    operation.mark_complete
  end

  desc "Resynchronize with mailchimp"
  task :mailchimp => :environment do
    operation = ScheduledOperation.start('mailchimp sync')
    Affiliate.all.each { |a|
      a.mailchimp_client.sync_lists if a.mailchimp_client.present?
    }
    operation.mark_complete
  end

  desc "Test Salesforce"
  task :salesforce => :environment do
    operation = ScheduledOperation.start('Salesforce tests')
    Affiliate.all.each do |a|
      c = SalesforceClient.new(a)
      if c.enabled?
        c.login(true)
      end
    end
    operation.mark_complete
  end

  desc "Force Salesforce BERC test"
  task :force_salesforce => :environment do
    @affiliate = Affiliate.find(18)
    @client = SalesforceClient.new(@affiliate)
    if @client.enabled? && @client.login.blank?
      fail = 0
      tot = 0
      end_m = ''
      @affiliate.approved_members.each do |u|
        if @client.sync_user(u) == 2
          fail += 1
          end_m += "#{u.email},"
        end
        tot += 1
      end
      puts "Manual Sync Complete: #{fail} failure#{fail == 1 ? '' : 's'} out of #{tot} total."
      puts "Your membership has been synced."
      puts end_m
    else
      puts "Could not authenticate to Salesforce.  Check your settings."
    end
  end

  desc "Archive Old Stuff"
  task :archive => :environment do
    operation = ScheduledOperation.start('archive old stuff')
    ApplicationController::ENTITIES.each do |e|
      e.to_archive.each do |i|
        i.update_column(:archived, true)
        i.remove_from_index
      end
    end
    operation.mark_complete
  end

  desc "NightlyStats"
  task :stats => :environment do
    operation = ScheduledOperation.start('Nightly Statistics')
    Affiliate.all.each do |a|
      NightlyStat.create!(a.measure_stats)
    end
    operation.mark_complete
  end

  desc "AutoImport"
  task :autoimport => :environment do
    operation = ScheduledOperation.start('Auto-Import')
    to_send_ef = []
    to_send_affiliate = {}
    imports = CalendarImport.all
    imports.each do |i|
      aid, url, total, total_ef = i.import_events
      if total > 0
        if to_send_affiliate.has_key?(aid)
          to_send_affiliate[aid] << {aid: aid, url: url, total: total}
        else
          to_send_affiliate[aid] = [{aid: aid, url: url, total: total}]
        end
      end
      if total_ef > 0
        to_send_ef << {aid: aid, url: url, total: total_ef}
      end
    end
    to_send_affiliate.each do |k, v|
      recipients = Affiliate.find_by_id(k.to_i).admins(Membership::EDITOR, true)
      recipients.each do |user|
        NotificationMailer.auto_import_complete(user, k.to_i, v).deliver()
      end
    end
    if to_send_ef.present?
      recipients = User.where(admin: true, admin_emails: true).all
      recipients.each do |user|
        NotificationMailer.auto_import_complete(user, 0, to_send_ef).deliver()
      end
    end
    operation.mark_complete
  end

end