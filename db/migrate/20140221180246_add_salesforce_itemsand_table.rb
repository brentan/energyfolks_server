class AddSalesforceItemsandTable < ActiveRecord::Migration
  def change
    add_column :affiliates, :salesforce_username, :string
    add_column :affiliates, :salesforce_password, :string
    add_column :affiliates, :salesforce_token, :string
    create_table :salesforce_items do |t|
      t.integer :affiliate_id
      t.integer :type
      t.string  :salesforce_name
      t.boolean :custom
      t.string  :energyfolks_name
      t.text    :custom_text
    end
  end
end
