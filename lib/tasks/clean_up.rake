# encoding: UTF-8

namespace :clean_up do

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
    MarkReadAction.where("created_at < ?",2.years.ago).all.each { |e| e.destroy }
    MarkRead.all.each do |m|
      m.destroy if m.mark_read_actions.length == 0
    end
    DigestMailer.where("created_at < ?",2.years.ago).all.each { |e| e.destroy }
  end

  desc "resync with cloudsearch"
  task :resync => :environment do
    ApplicationController::ENTITIES.each do |e|
      e.reindex_all
    end
  end

  desc "fix mark_read_actions"
  task :mark_read_fix => :environment do
    MarkRead.all.each do |m|
      if m.mark_read_actions.length == 0
        MarkReadAction.create(:mark_read_id => m.id, :ip => m.ip, :affiliate_id => 0)
      end
    end
  end

end