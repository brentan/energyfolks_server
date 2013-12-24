class AddVisitsAndUserLoginsTables < ActiveRecord::Migration
  def change
    create_table :visits do |t|
      t.timestamps
      t.integer :user_id
      t.integer :page
      t.integer :affiliate_id
      t.string :ip
    end
    create_table :user_logins do |t|
      t.timestamps
      t.integer :user_id
      t.integer :affiliate_id
      t.integer :ip
    end
  end
end
