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

  desc "IMPORT"
  task :import => :environment do
    User.all.each do |u|
      u.update_column(:encrypted_cookie, u.update_encrypted_cookie(u.encrypted_password))
    end
    Discussion.all.each do |u|
      u.update_comment_details
    end

    #LOAD USER AVATARS:
    puts 'Loading User Avatars'
    fake_user = User.create!({first_name: 'test', last_name: 'user', location: 'denver, co', email: 'test12345@gmail.com', password: 'testtest', password_confirmation: 'testtest'})
    User.where("avatar_file_name IS NOT NULL").all.each do |u|
      begin
        fake_user.avatar = "https://images.energyfolks.com/userimages/#{u.avatar_file_name}.png"
        fake_user.save!
        u.update_column(:avatar_file_name, fake_user.avatar_file_name)
        u.update_column(:avatar_content_type, fake_user.avatar_content_type)
        u.update_column(:avatar_file_size, fake_user.avatar_file_size)
        u.update_column(:avatar_updated_at, fake_user.avatar_updated_at)
      rescue
      end
    end
    puts 'Loading User resumes'
    User.where("resume_file_name IS NOT NULL").all.each do |u|
      begin
        fake_user.resume = "https://www.energyfolks.com/users/GetResume/#{u.id}"
        fake_user.save!
        u.update_column(:resume_file_name, fake_user.resume_file_name)
        u.update_column(:resume_content_type, fake_user.resume_content_type)
        u.update_column(:resume_file_size, fake_user.resume_file_size)
        u.update_column(:resume_updated_at, fake_user.resume_updated_at)
      rescue
      end
    end
    fake_user.destroy

    puts 'Loading Affiliate Logos'
    Affiliate.all.each do |u|
      u.logo = "https://images.energyfolks.com/resourceimage/PartnerPic#{u.id}.png"
      u.save
    end

    puts 'Loading Jobs Logos'
    fake = Job.create!({name: 'test', employer: 'user', location: 'denver, co', how_to_apply: 'ok', html: 'testtest', job_type: 2})
    User.where("logo_file_name IS NOT NULL").all.each do |u|
      begin
        fake.logo = "https://images.energyfolks.com/resourceimage/#{u.logo_file_name}.png"
        fake.save!
        u.update_column(:logo_file_name, fake.logo_file_name)
        u.update_column(:logo_content_type, fake.logo_content_type)
        u.update_column(:logo_file_size, fake.logo_file_size)
        u.update_column(:logo_updated_at, fake.logo_updated_at)
      rescue
      end
    end
    fake.destroy

    puts 'Loading Discussion Files'
    fake = Discussion.create!({name: 'test', html: 'testtest'})
    User.where("attachment_file_name IS NOT NULL").all.each do |u|
      if u.attachment_file_name == ''
        u.update_column(:attachment_file_name, nil)
        next
      end
      begin
        fake.attachment = "https://www.energyfolks.com/announce/GetFile/#{u.id}"
        fake.save!
        u.update_column(:attachment_file_name, fake.attachment_file_name)
        u.update_column(:attachment_content_type, fake.attachment_content_type)
        u.update_column(:attachment_file_size, fake.attachment_file_size)
        u.update_column(:attachment_updated_at, fake.attachment_updated_at)
      rescue
      end
    end
    fake.destroy

  end
end