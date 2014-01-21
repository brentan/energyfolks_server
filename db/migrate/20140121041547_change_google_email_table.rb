class ChangeGoogleEmailTable < ActiveRecord::Migration
  def up
    change_column :google_emails, :domain, :string
  end

  def down
    change_column :google_emails, :domain, :integer
  end
end
