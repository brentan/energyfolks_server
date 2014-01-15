class CreateMailchimp < ActiveRecord::Migration
  def change
    create_table :mailchimp_logins do |t|
      t.timestamps
      t.integer :affiliate_id
      t.string :api_key
      t.string :members_list_id
      t.string :daily_digest_list_id
      t.string :author_contributor_list_id
      t.string :editor_administrator_list_id
    end
    add_index :mailchimp_logins, :affiliate_id
  end
end
