class FixJobsColumns < ActiveRecord::Migration
  def change
    remove_column :jobs, :awaiting_edit
    remove_column :jobs, :approved_versions

    add_column :affiliates_jobs, :awaiting_edit, :boolean, :default => true
    add_column :affiliates_jobs, :approved_versions, :string, :default => '0'
  end
end
