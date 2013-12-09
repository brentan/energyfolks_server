class CreateEmailSettingsTokens < ActiveRecord::Migration
  def change
    create_table :email_settings_tokens do |t|
      t.timestamps
      t.integer :user_id
      t.integer :use_count
      t.datetime :expires_at
      t.datetime :last_user_at
      t.string :token
    end
  end
end
