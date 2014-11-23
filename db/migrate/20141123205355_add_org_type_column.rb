class AddOrgTypeColumn < ActiveRecord::Migration
  def change
    add_column :users, :organization_type, :string
  end
end
