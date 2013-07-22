class AddBroadcastToMemberships < ActiveRecord::Migration
  def change
    add_column :memberships, :broadcast, :boolean, :default => false
  end
end
