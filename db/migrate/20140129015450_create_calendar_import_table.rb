class CreateCalendarImportTable < ActiveRecord::Migration
  def change
    create_table :calendar_imports do |t|
      t.integer :affiliate_id
      t.string :url
      t.string :location
      t.boolean :send_to_all
    end
    add_column :events, :autoimport, :string
  end
end
