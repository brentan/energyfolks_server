class AddDigestOptionToBlog < ActiveRecord::Migration
  def change
    add_column :blogs, :digest, :boolean, :default => false
  end
end
