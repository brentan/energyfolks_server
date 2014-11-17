class AddMailchimpColumn < ActiveRecord::Migration
  def change
    add_column :mailchimp_clients, :member_list_sync, :boolean, :default => true
    add_column :mailchimp_clients, :daily_digest_sync, :boolean, :default => true
    add_column :mailchimp_clients, :weekly_digest_sync, :boolean, :default => true
    add_column :mailchimp_clients, :author_contributor_list_sync, :boolean, :default => true
    add_column :mailchimp_clients, :editor_administrator_list_sync, :boolean, :default => true
  end
end
