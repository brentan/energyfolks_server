class CreateUserHighlightsTable < ActiveRecord::Migration
  def change

    create_table :user_highlights do |t|
      t.string :entity_type
      t.integer :entity_id
      t.integer :user_id
    end
    add_index :user_highlights, :entity_id
    add_index :user_highlights, :entity_type
    add_index :user_highlights, :user_id
  end
end
