class AddGoogleEmailsTable < ActiveRecord::Migration
  def change
    create_table :google_emails do |t|
      t.integer :user_id
      t.integer :domain
      t.string :address
    end
  end
end
