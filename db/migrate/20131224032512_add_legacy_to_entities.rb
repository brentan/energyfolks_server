class AddLegacyToEntities < ActiveRecord::Migration
  def change
    add_column :blogs, :legacy, :boolean, :default => false
    add_column :jobs, :legacy, :boolean, :default => false
    add_column :events, :legacy, :boolean, :default => false
    add_column :discussions, :legacy, :boolean, :default => false
  end
end
