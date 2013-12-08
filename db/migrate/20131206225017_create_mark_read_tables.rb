class CreateMarkReadTables < ActiveRecord::Migration
  def change
    create_table :mark_reads do |t|
      t.string  :ip
      t.integer :entity_id
      t.string :entity_type
      t.integer :user_id
    end
    create_table :mark_read_actions do |t|
      t.timestamps
      t.string  :ip
      t.integer :mark_read_id
      t.integer :affiliate_id
    end
    add_index :mark_read_actions, :mark_read_id
    add_index :mark_reads, :entity_id
    add_index :mark_reads, :entity_type
  end
end
