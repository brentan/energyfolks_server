class CreateDonateTable < ActiveRecord::Migration
  def change
    add_column :jobs, :donate, :boolean, :default => false
    create_table :donations do |t|
      t.timestamps
      t.integer :amount
      t.integer :user_id
      t.integer :entity_id
      t.string :entity_type
      t.string :stripe_id
    end
    create_table :stripe_tokens do |t|
      t.timestamps
      t.string :token
      t.integer :user_id
      t.string :card_type
      t.string :last4
    end
  end
end
