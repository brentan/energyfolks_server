class CreateNightlyStatTable < ActiveRecord::Migration
  def change
    create_table :nightly_stats do |t|
      t.timestamps
      t.integer :affiliate_id
      t.integer :total_users
      t.integer :total_active_users
      t.integer :total_users_moderation
      t.integer :total_jobs
      t.integer :total_jobs_moderation
      t.integer :total_events
      t.integer :total_events_moderation
      t.integer :total_discussions
      t.integer :total_discussions_moderation
      t.integer :total_blogs
      t.integer :total_blogs_moderation
      t.integer :visits
    end
    add_index :nightly_stats, :affiliate_id
  end
end
