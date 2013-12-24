class AddAffiliateOnlyToSubscriptionSettings < ActiveRecord::Migration
  def change
    add_column :subscriptions, :affiliate_only, :boolean, :default => false
  end
end
