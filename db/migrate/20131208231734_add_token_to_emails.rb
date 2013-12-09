class AddTokenToEmails < ActiveRecord::Migration
  def change
    add_column :emails, :token, :string
  end
end
