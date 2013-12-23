class AddCommentEmailHashTable < ActiveRecord::Migration
  def change
    create_table :comment_email_hashes do |t|
      t.string :unique_hash
      t.string :comment_hash
    end
    add_index :comment_email_hashes, :unique_hash
  end
end
