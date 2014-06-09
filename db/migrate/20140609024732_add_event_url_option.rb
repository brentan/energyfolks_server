class AddEventUrlOption < ActiveRecord::Migration
  def change
    add_column :events, :url, :string
    add_column :events_versions, :url, :string
  end
end
