class CreateAffiliatesAndMembers < ActiveRecord::Migration
  def change
    add_column :users, :radius, :integer, :default => 100
    add_column :users, :admin, :boolean, :default => false
    create_table :affiliates do |t|
      t.timestamps
      t.string :name
      t.string :short_name
      t.string :email_name
      t.string :url
      t.string :url_calendar
      t.string :url_jobs
      t.string :url_discussions
      t.string :url_users
      t.string :url_blog
      t.string :email
      t.boolean :live, :default => false
      t.integer :open, :default => Affiliate::OPEN
      t.boolean :visible, :default => true
      t.string :color, :default => '777777'
      t.text :email_header
      t.text :web_header
      t.string :location
      t.float :latitude
      t.float :longitude
      t.integer :moderate_discussions, :default => Affiliate::DIRECT
      t.integer :moderate_jobs, :default => Affiliate::DIRECT
      t.integer :moderate_calendar, :default => Affiliate::DIRECT
      t.string :shared_secret
      t.string :cpanel_user
      t.string :cpanel_password
      t.boolean :send_digest, :default => true
      t.integer :radius, :default => 50
      t.attachment :logo
    end
    create_table :memberships do |t|
      t.timestamps
      t.integer :user_id
      t.integer :affiliate_id
      t.boolean :approved
      t.integer :admin_level, :default => Membership::USER
      t.boolean :moderation_emails, :default => false
    end

  end
end
