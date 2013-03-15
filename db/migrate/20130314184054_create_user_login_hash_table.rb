class CreateUserLoginHashTable < ActiveRecord::Migration
  def change
    create_table :user_login_hashes do |t|
      t.integer :user_id
      t.string :login_hash
      t.timestamps
    end

    add_index :user_login_hashes, :login_hash
  end
end
