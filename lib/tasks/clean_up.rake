# encoding: UTF-8

namespace :clean_up do

  desc "Remove old login hashes"
  task :user_login_hash => :environment do
    UserLoginHash.destroy_all("created_at < '#{Time.now.utc-10.seconds}'")
  end

  desc "Remove old sessions"
  task :sessions => :environment do
    Session.delete_all("updated_at < '#{Time.now-2.days}'")
  end

  desc "Update Tag Counts"
  task :tag_count => :environment do
    Tag.all.each do |t|
      t.refresh_count
    end
  end
end