class AddLinkedInToUser < ActiveRecord::Migration
  def change
    add_column :users, :linkedin_hash, :string
  end
end
