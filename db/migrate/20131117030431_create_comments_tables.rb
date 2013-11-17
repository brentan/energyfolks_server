class CreateCommentsTables < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.timestamps
      t.integer  :user_id
      t.string   :hash
      t.string   :url
      t.text     :comment
    end
    add_index :comments, :hash
    create_table :subcomments do |t|
      t.timestamps
      t.integer  :user_id
      t.integer  :comment_id
      t.text     :comment
    end
    add_index :subcomments, :comment_id
  end
end
