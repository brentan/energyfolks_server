class AddLastUpdatedByToJobs < ActiveRecord::Migration
  def change
    add_column :jobs, :last_updated_by, :integer
  end
end
