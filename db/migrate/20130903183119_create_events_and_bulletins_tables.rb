class CreateEventsAndDiscussionsTables < ActiveRecord::Migration
  def change
    # EVENTS:
    create_table :events do |t|
      t.timestamps
      t.datetime  :start
      t.datetime  :end
      t.string  :location
      t.string  :location2
      t.float   :latitude
      t.float   :longitude
      t.integer :user_id
      t.integer :affiliate_id
      t.integer :current_version, :default => 0
      t.string  :name
      t.string  :host
      t.integer :last_updated_by
      t.text  :html
      t.text  :synopsis
      t.attachment :logo
    end
    create_table :events_versions do |t|
      t.timestamps
      t.integer :entity_id
      t.integer :version_number
      t.string  :name
      t.string  :host
      t.datetime  :start
      t.datetime  :end
      t.text  :html
      t.text  :synopsis
      t.string  :location
      t.string :location2
      t.attachment :logo
    end
    add_index :events_versions, :entity_id
    add_index :events_versions, :version_number
    create_table :affiliates_events do |t|
      t.integer :event_id
      t.integer :affiliate_id
      t.integer :approved_version, :default => 0
      t.integer :admin_version, :default => 0
      t.boolean :broadcast, :default => false
      t.boolean :user_broadcast, :default => false
    end
    add_index :affiliates_events, :event_id
    add_column :affiliates_events, :awaiting_edit, :boolean, :default => true
    add_column :affiliates_events, :approved_versions, :string, :default => '0'
    # BULLETINS:
    create_table :discussions do |t|
      t.timestamps
      t.integer :user_id
      t.integer :affiliate_id
      t.integer :current_version, :default => 0
      t.string  :name
      t.integer :last_updated_by
      t.text  :html
      t.attachment :attachment
    end
    create_table :discussions_versions do |t|
      t.timestamps
      t.integer :entity_id
      t.integer :version_number
      t.string  :name
      t.text  :html
      t.attachment :attachment
    end
    add_index :discussions_versions, :entity_id
    add_index :discussions_versions, :version_number
    create_table :affiliates_discussions do |t|
      t.integer :discussion_id
      t.integer :affiliate_id
      t.integer :approved_version, :default => 0
      t.integer :admin_version, :default => 0
      t.boolean :broadcast, :default => false
      t.boolean :user_broadcast, :default => false
    end
    add_index :affiliates_discussions, :discussion_id
    add_column :affiliates_discussions, :awaiting_edit, :boolean, :default => true
    add_column :affiliates_discussions, :approved_versions, :string, :default => '0'
  end
end
