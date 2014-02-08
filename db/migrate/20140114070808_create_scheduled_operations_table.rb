class CreateScheduledOperationsTable < ActiveRecord::Migration
  def change
    create_table :scheduled_operations do |t|
      t.timestamps
      t.string :command
      t.boolean :complete, :default => false
    end
  end
end
