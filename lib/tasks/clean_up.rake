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



end