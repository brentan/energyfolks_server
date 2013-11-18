class UpdateAffiliateColumns < ActiveRecord::Migration
  def change
    rename_column :affiliates, :url_calendar, :url_events
    rename_column :affiliates, :url_blog, :url_blogs
  end
end
