class ChangeLatLngInUserModel < ActiveRecord::Migration
  def up
    add_column :users, :latitude, :float
    add_column :users, :longitude, :float
    remove_column :users, :lat
    remove_column :users, :lng
  end

  def down
    add_column :users, :lat, :float
    add_column :users, :lng, :float
    remove_column :users, :latitude
    remove_column :users, :longitude
  end
end
