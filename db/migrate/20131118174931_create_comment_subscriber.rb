class CreateCommentSubscriber < ActiveRecord::Migration
  def up
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
  def down
    drop_table :comment_subscribers
    drop_table :comment_details
    add_column :comments, :url,	:string
  end
end
