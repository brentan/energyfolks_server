class CreateCommentSubscriber < ActiveRecord::Migration
  def change
    create_table :comment_subscribers do |t|
      t.integer :user_id
      t.string :comment_hash
    end
    add_index :comment_subscribers, :comment_hash
    create_table :comment_details do |t|
      t.string :name
      t.string :url
      t.string :comment_hash
    end
    add_index :comment_details, :comment_hash
    remove_column :comments, :url
  end
end
