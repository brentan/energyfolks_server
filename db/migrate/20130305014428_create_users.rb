class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.timestamps
      t.string  :email
      t.string  :encrypted_password
      t.string  :encrypted_cookie
      t.string  :first_name
      t.string  :last_name
      t.boolean :verified, :default => false
      t.boolean :password_reset, :default => false
      t.datetime :last_login
      t.integer :region_id
      t.integer :visibility
      t.string  :timezone, :default => 'America/Los_Angeles'
      t.string  :language, :default => 'english'
      t.attachment :avatar
    end
  end
end
