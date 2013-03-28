class ChangeUserTable < ActiveRecord::Migration
  def change
    change_column :users, :visibility, :integer, :default => 1
    change_column :users, :timezone, :string, :default => 'Pacific Time (US & Canada)'
    remove_column :users, :region_id
    remove_column :users, :language
    add_column :users, :location, :string
    add_column :users, :email_to_verify, :string
    add_column :users, :lat, :decimal, :precision => 15, :scale => 10, :default => 37.775
    add_column :users, :lng, :decimal, :precision => 15, :scale => 10, :default => -122.4183
    add_column :users, :position, :string
    add_column :users, :organization, :string
    add_column :users, :bio, :text
    add_column :users, :interests, :text
    add_column :users, :expertise, :text
    add_column :users, :resume_visibility, :integer, :default => 1
    add_attachment :users, :resume
    add_index :users, :email
  end
end
