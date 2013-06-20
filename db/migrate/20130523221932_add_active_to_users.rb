class AddActiveToUsers < ActiveRecord::Migration
  def change
    add_column :users, :active, :boolean, :default => true
    add_column :users, :admin_emails, :boolean, :default => false
  end
end
