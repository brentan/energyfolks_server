class AddWeeklyDigestListIdToMailchimpClients < ActiveRecord::Migration
  def change
    add_column :mailchimp_clients, :weekly_digest_list_id, :string, after: :daily_digest_list_id
  end
end
