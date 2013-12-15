class AddFrozenToBlogs < ActiveRecord::Migration
  def change
    add_column :blogs, :frozen_by_wordpress, :boolean, :default => false
    add_index :blogs, :frozen_by_wordpress
  end
end
