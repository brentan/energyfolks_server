class CreateSubscriptionsTable < ActiveRecord::Migration
  def change
    create_table :subscriptions do |t|
      t.integer :user_id
      t.boolean :weekly, :default => true
      t.boolean :daily, :default => false
      t.boolean :events, :default => false
      t.boolean :jobs, :default => false
      t.boolean :bulletins, :default => false
      t.integer :event_radius, :default => 50
      t.integer :job_radius, :default => 0
    end
    add_index :subscriptions, :user_id
    add_column :affiliates, :weekly, :boolean, :default => true
    add_column :affiliates, :daily, :boolean, :default => false
    add_column :affiliates, :events, :boolean, :default => false
    add_column :affiliates, :jobs, :boolean, :default => false
    add_column :affiliates, :bulletins, :boolean, :default => false
    add_column :affiliates, :event_radius, :integer, :default => 50
    add_column :affiliates, :job_radius, :integer, :default => 0
  end
end
