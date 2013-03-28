class AddToUsersTable < ActiveRecord::Migration
  def up
    change_column :users, :password_reset, :string
  end
  def down
    change_column :users, :password_reset, :boolean
  end
end
