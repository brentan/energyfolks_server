class AddSecondaryEmailToUser < ActiveRecord::Migration
  def change
    add_column :users, :secondary_email, :string

    add_column :memberships, :graduation_year, :integer
    add_column :memberships, :graduation_month, :integer
    add_column :memberships, :program_id, :integer
    add_column :memberships, :school_affiliation, :integer

    create_table :programs do |t|
      t.string :name
      t.integer :affiliate_id
    end
  end
end
