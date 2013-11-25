class CreateThirdPartyLoginTable < ActiveRecord::Migration
  def change
    create_table :third_party_logins do |t|
      t.integer :user_id
      t.string :service
      t.string :token
      t.string :secret
    end
  end
end
