class RemoveWebHeaderFromAffiliates < ActiveRecord::Migration
  def up
    remove_column :affiliates, :web_header
    add_column :affiliates, :custom_header, :boolean, :default => false
  end

  def down
    add_column :affiliates, :web_header, :text
    remove_column :affiliates, :custom_header
  end
end
