# encoding: UTF-8

namespace :clean_up do

  class Session < ActiveRecord::Base
  end

  desc "Remove old login hashes"
  task :user_login_hash => :environment do
    UserLoginHash.destroy_all("created_at < '#{Time.now.utc-10.seconds}'")
  end

  desc "Remove old sessions"
  task :sessions => :environment do
    Session.delete_all("updated_at < '#{Time.now-2.days}'")
    EmailSettingsToken.delete_all("expires_at < '#{Time.now}'")
  end

  desc "Update Tag Counts"
  task :tag_count => :environment do
    Tag.all.each do |t|
      t.refresh_count
    end
  end

  desc "Clear out old analytics to control table size"
  task :old_analytics => :environment do
    MarkReadAction.where("created_at < ?",2.years.ago).all.each do |e|
      id = e.mark_read_id
      e.destroy
      m = MarkRead.find_by_id(id)
      m.destroy if m.present? && m.mark_read_actions.length == 0
    end
    DigestMailer.where("created_at < ?",2.years.ago).all.each { |e| e.destroy }
    AdminMessage.where("created_at < ?",1.year.ago).all.each { |e| e.destroy }
  end

  desc "resync with cloudsearch"
  task :resync => :environment do
    ApplicationController::ENTITIES.each do |e|
      e.reindex_all
    end
  end

  desc "resync with cloudsearch"
  task :scheduled_operations => :environment do
    ScheduledOperation.where("created_at < ?",1.month.ago).all do |e|
      e.destroy
    end
  end

  desc "Find admins for BEN"
  task :find_admins => :environment do
    Affiliate.all.each do |a|
      puts '--------'
      puts a.name.upcase
      admins = a.admins(Membership::EDITOR).map{ |u| "#{u.first_name} #{u.last_name}: #{u.email.downcase}" }
      admins << "Main: #{a.email_name}@energyfolks.com"
      admins.each do |a|
        puts a
      end
    end
  end

  desc "Test for delayed job failure"
  task :delayed_job_test => :environment do
    res = ActiveRecord::Base.connection.execute("SELECT COUNT(*) FROM delayed_jobs")
    ErrorMailer.mailerror("CHECK DELAYED_JOB...IT MAY HAVE SHUT DOWN! #{res.first[0]} ITEM IN QUEUE").deliver() if res.first[0] > 20
  end

  desc "Check for and correct malformed submission"
  task :fix_bad_submissions => :environment do
    # This shouldn't be necessary, but something occasionally causes submitted posts to have approved and admin versions
    # of 0 in the affiliate join table.  This script will look for that and correct them...but really we should one day
    # find the bug that causes this issue in the submission workflow and fix
    [Job Event Discussion Blog].each do |model|
      model.join_table.where(:admin_version => 0).each do |item|
        entity = model.find_by_id(item.entity_id)
        if entity.present? && (entity.current_version > 0)
          item.update_column(:admin_version, entity.current_version)
          item.update_column(:broadcast, false)
          entity.broadcast(false)
        end
      end
    end
  end


end