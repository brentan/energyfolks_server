class CreateJobsTable < ActiveRecord::Migration
  def change
    create_table :jobs do |t|
      t.timestamps
      t.date    :expire
      t.string  :location
      t.float   :latitude
      t.float   :longitude
      t.integer :user_id
      t.integer :affiliate_id
      t.integer :current_version, :default => 0
      t.string  :name
      t.string  :employer
      t.text  :html
      t.text  :how_to_apply
      t.integer :job_type
      t.attachment :logo
    end
    create_table :jobs_versions do |t|
      t.timestamps
      t.integer :entity_id
      t.integer :version_number
      t.string  :name
      t.string  :employer
      t.text  :html
      t.text  :how_to_apply
      t.integer :job_type
      t.attachment :logo
    end
    add_index :jobs_versions, :entity_id
    add_index :jobs_versions, :version_number
    create_table :affiliates_jobs do |t|
      t.integer :job_id
      t.integer :affiliate_id
      t.integer :approved_version, :default => 0
      t.integer :admin_version, :default => 0
      t.boolean :broadcast, :default => false
      t.boolean :user_broadcast, :default => false
    end
    add_index :affiliates_jobs, :job_id

    create_table :emails do |t|
      t.timestamps
      t.integer  :entity_id
      t.string   :entity_type
      t.integer  :user_id
      t.boolean  :opened, :default => false
      t.datetime :open_date
    end
    add_index :emails, :entity_id
    add_index :emails, :entity_type
    add_index :emails, :user_id
  end
end
