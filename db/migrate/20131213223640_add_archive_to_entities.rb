class AddArchiveToEntities < ActiveRecord::Migration
  def change
    add_column :events, :archived, :boolean, :default => false
    add_column :jobs, :archived, :boolean, :default => false
    add_column :discussions, :archived, :boolean, :default => false
    add_column :blogs, :archived, :boolean, :default => false
  end
end
