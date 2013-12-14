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
    MarkReadAction.where("created_at > ?",2.years.ago).all.each { |e| e.destroy }
    DigestMailer.where("created_at > ?",2.years.ago).all.each { |e| e.destroy }
  end
end