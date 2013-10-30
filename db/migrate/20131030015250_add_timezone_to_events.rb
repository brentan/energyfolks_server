class AddTimezoneToEvents < ActiveRecord::Migration
  def change
    add_column :events, :timezone, :string
    add_column :events_versions, :timezone, :string
  end
end
