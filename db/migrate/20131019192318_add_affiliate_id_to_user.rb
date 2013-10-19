class AddAffiliateIdToUser < ActiveRecord::Migration
  def change
    add_column :users, :affiliate_id, :integer, :default => 0
  end
end
