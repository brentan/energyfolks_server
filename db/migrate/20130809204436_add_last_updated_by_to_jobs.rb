class AddLastUpdatedByToJobs < ActiveRecord::Migration
  def change
    add_column :jobs, :last_updated_by, :integer
    add_column :affiliates, :show_details, :boolean, :default => true

    create_table :highlights do |t|
      t.string :entity_type
      t.integer :entity_id
      t.integer :affiliate_id
    end
    add_index :highlights, :entity_id
    add_index :highlights, :entity_type
    add_index :highlights, :affiliate_id
  end
end
