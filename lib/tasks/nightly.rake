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

end