class AddBlogTables < ActiveRecord::Migration
  def change
    create_table :blogs do |t|
      t.timestamps
      t.integer :user_id
      t.integer :affiliate_id
      t.integer :current_version, :default => 0
      t.string  :name
      t.string  :url
      t.integer :wordpress_id
      t.integer :last_updated_by
      t.float   :latitude
      t.float   :longitude
      t.boolean :announcement, :default => false
      t.text  :html
      t.attachment :attachment
    end
    create_table :blogs_versions do |t|
      t.timestamps
      t.integer :entity_id
      t.integer :version_number
      t.string  :name
      t.text  :html
      t.attachment :attachment
    end
    add_index :blogs_versions, :entity_id
    add_index :blogs_versions, :version_number
    create_table :affiliates_blogs do |t|
      t.integer :blog_id
      t.integer :affiliate_id
      t.integer :approved_version, :default => 0
      t.integer :admin_version, :default => 0
      t.boolean :broadcast, :default => false
      t.boolean :user_broadcast, :default => false
    end
    add_index :affiliates_blogs, :blog_id
    add_column :affiliates_blogs, :awaiting_edit, :boolean, :default => true
    add_column :affiliates_blogs, :approved_versions, :string, :default => '0'
    add_column :subscriptions, :blogs, :boolean, :default => false
    add_column :subscriptions, :announcement, :boolean, :default => true
    add_column :affiliates, :blogs, :boolean, :default => false
    add_column :affiliates, :announcement, :boolean, :default => true
  end
end
