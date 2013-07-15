class AddDefaultsToMemberships < ActiveRecord::Migration
  def change
    change_column :memberships, :approved, :boolean, :default => false
    add_column :memberships, :reason, :string
  end
end
