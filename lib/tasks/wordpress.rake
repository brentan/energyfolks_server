# encoding: UTF-8

namespace :wordpress do

  desc "Synchronize information with all wordpress affiliates"
  task :nightly_sync => :environment do
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
  end

end