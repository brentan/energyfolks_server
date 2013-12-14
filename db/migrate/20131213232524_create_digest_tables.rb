class CreateDigestTables < ActiveRecord::Migration
  def change
    create_table :digest_mailers do |t|
      t.timestamps
      t.integer :user_id
      t.boolean :opened, :default => false
      t.boolean :weekly, :default => true
      t.datetime :open_date
    end
    create_table :digest_items do |t|
      t.integer :entity_id
      t.string :entity_type
      t.boolean :weekly, :default => true
      t.integer :digest_mailer_id
      t.boolean :opened, :default => false
      t.datetime :open_date
    end
    add_index :digest_items, :entity_type
    add_index :digest_items, :entity_id
    add_index :digest_items, :opened
    add_index :digest_items, :weekly
  end
end
