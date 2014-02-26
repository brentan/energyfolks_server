class ChangeSalesforceItems < ActiveRecord::Migration
  def up
    remove_column :salesforce_items, :custom_text
    remove_column :salesforce_items, :custom
    rename_column :salesforce_items, :type, :salesforce_type
    add_column :salesforce_items, :custom, :integer
    add_column :salesforce_items, :enabled, :boolean, :default => false
    add_column :salesforce_items, :salesforce_label, :string
    add_column :salesforce_items, :salesforce_options, :text
  end
  def down
    remove_column :salesforce_items, :custom
    remove_column :salesforce_items, :enabled
    remove_column :salesforce_items, :salesforce_label
    remove_column :salesforce_items, :salesforce_options
    add_column :salesforce_items, :custom_text, :text
    add_column :salesforce_items, :custom, :boolean
    rename_column :salesforce_items, :salesforce_type, :type
  end
end
