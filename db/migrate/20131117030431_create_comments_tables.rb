class CreateCommentsTables < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.timestamps
      t.integer  :user_id
      t.integer  :affiliate_id
      t.string   :unique_hash
      t.string   :user_name
      t.string   :url
      t.text     :comment
    end
    add_index :comments, :unique_hash
    create_table :subcomments do |t|
      t.timestamps
      t.integer  :user_id
      t.integer  :affiliate_id
      t.string   :user_name
      t.integer  :comment_id
      t.text     :comment
    end
    add_index :subcomments, :comment_id
  end
end
