class CreateAdminMessagesTable < ActiveRecord::Migration
  def change
    create_table :admin_messages do |t|
      t.timestamps
      t.string :name
      t.text   :html
      t.integer :user_id
    end
  end
end
