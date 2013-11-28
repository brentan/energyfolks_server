class AddWordpressVNumberToAffiliates < ActiveRecord::Migration
  def change
    add_column :affiliates, :wordpress_version, :string, :default => 'unknown'
    add_column :affiliates, :wordpress_plugin_version, :string, :default => 'unknown'
    add_column :affiliates, :wordpress_checked_version, :string, :default => ''
  end
end
