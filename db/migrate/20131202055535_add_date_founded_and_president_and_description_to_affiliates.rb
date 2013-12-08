class AddDateFoundedAndPresidentAndDescriptionToAffiliates < ActiveRecord::Migration
  def change
    add_column :affiliates, :year_founded, :integer, default: nil
    add_column :affiliates, :president_name, :string
    add_column :affiliates, :description, :text
  end
end
