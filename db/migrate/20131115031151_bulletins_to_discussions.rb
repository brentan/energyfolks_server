class BulletinsToDiscussions < ActiveRecord::Migration
  def change
    rename_table :bulletins, :discussions
    rename_table :affiliates_bulletins, :affiliates_discussions
    rename_table :bulletins_versions, :discussions_versions
    rename_column :affiliates, :bulletins, :discussions
    rename_column :affiliates, :url_bulletins, :url_discussions
    rename_column :affiliates_discussions, :bulletin_id, :discussion_id
    rename_column :subscriptions, :bulletins, :discussions
    remove_column :affiliates, :radius
    remove_column :users, :radius
  end
end
