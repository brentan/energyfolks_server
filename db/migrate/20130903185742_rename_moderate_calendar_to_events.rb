class RenameModerateCalendarToEvents < ActiveRecord::Migration
  def change
    rename_column :affiliates, :moderate_calendar, :moderate_events
    change_column :affiliates_bulletins, :awaiting_edit, :boolean, :default => false
    change_column :affiliates_jobs, :awaiting_edit, :boolean, :default => false
    change_column :affiliates_events, :awaiting_edit, :boolean, :default => false
  end
end
