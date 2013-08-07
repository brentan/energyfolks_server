class CreateTagsTableAndJoinTable < ActiveRecord::Migration
  def change
    create_table :tags do |t|
      t.string :name
      t.integer :count, :default => 0
    end
    add_index :tags, :name
    create_table :tags_entities do |t|
      t.integer :entity_id
      t.string :entity_type
      t.integer :tag_id
    end
    add_index :tags_entities, :entity_id
    add_index :tags_entities, :tag_id
    add_index :tags_entities, :entity_type
  end
end
