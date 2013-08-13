class AddTimezoneToAffiliate < ActiveRecord::Migration
  def change
    add_column :affiliates, :timezone, :string, :default => 'Pacific Time (US & Canada)'
  end
end
