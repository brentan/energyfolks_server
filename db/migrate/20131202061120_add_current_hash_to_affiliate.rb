class AddCurrentHashToAffiliate < ActiveRecord::Migration
  def change
    add_column :affiliates, :wordpress_css_hash, :string
    add_column :affiliates, :wordpress_js_hash, :string
  end
end
