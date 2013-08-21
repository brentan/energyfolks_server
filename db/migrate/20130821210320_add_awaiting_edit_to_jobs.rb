class AddAwaitingEditToJobs < ActiveRecord::Migration
  def change
    add_column :jobs, :awaiting_edit, :boolean, :default => true
    add_column :jobs, :approved_versions, :string, :default => '0'
  end
end
