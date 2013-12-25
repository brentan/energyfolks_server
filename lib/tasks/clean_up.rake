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

  desc "resync with cloudsearch"
  task :resync => :environment do
    ApplicationController::ENTITIES.each do |e|
      e.reindex_all
    end
  end

  desc "IMPORT"
  task :import => :environment do

    User.all.each do |u|
      u.update_column(:encrypted_cookie, u.update_encrypted_cookie(u.encrypted_password))
    end
    Discussion.all.each do |u|
      u.update_comment_details
    end

    #LOAD USER AVATARS:
    puts '--- Loading User Avatars ---'
    User.where("avatar_file_name IS NOT NULL").all.each do |u|
      puts u.full_name
      begin
        u.avatar = "http://www.energy-folks.com/userimages/#{u.avatar_file_name}.png"
        u.save
      rescue
      end
    end
    puts '--- Loading User resumes ---'
    User.where("resume_file_name IS NOT NULL").all.each do |u|
      u.full_name
      begin
        u.resume = "http://www.energy-folks.com/users/GetResume/#{u.id}"
        u.save
      rescue
      end
    end

    puts '--- Loading Jobs Logos ---'
    Job.where("logo_file_name IS NOT NULL").all.each do |u|
      puts u.name
      begin
        u.logo = "http://www.energy-folks.com/resourceimage/#{u.logo_file_name}.png"
        u.disable_broadcast_callback
        u.save!
        k = JobsVersion.where(entity_id: u.id).first
        k.update_column(:logo_file_name, u.logo_file_name)
        k.update_column(:logo_content_type, u.logo_content_type)
        k.update_column(:logo_file_size, u.logo_file_size)
        k.update_column(:logo_updated_at, u.logo_updated_at)
      rescue
      end
    end

    puts '--- Loading Discussion Files ---'
    Discussion.where("attachment_file_name IS NOT NULL").all.each do |u|
      if u.attachment_file_name == ''
        u.update_column(:attachment_file_name, nil)
        next
      end
      puts u.name
      begin
        u.attachment = "http://www.energy-folks.com/announce/GetFile/#{u.id}"
        u.disable_broadcast_callback
        u.save!
        k = DiscussionsVersion.where(entity_id: u.id).first
        k.update_column(:attachment_file_name, u.attachment_file_name)
        k.update_column(:attachment_content_type, u.attachment_content_type)
        k.update_column(:attachment_file_size, u.attachment_file_size)
        k.update_column(:attachment_updated_at, u.attachment_updated_at)
      rescue
      end
    end

  end
end