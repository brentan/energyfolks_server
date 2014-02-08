class CreateUpdatedAtColumns < ActiveRecord::Migration
  def up
    add_column :jobs, :first_approved_at, :datetime, :default => 0
    add_column :discussions, :first_approved_at, :datetime, :default => 0
    add_column :blogs, :first_approved_at, :datetime, :default => 0
    add_column :events, :first_approved_at, :datetime, :default => 0
    [Job, Discussion, Blog, Event].each do |i|
      i.all.each do |n|
        n.update_column(:first_approved_at, n.created_at)
      end
    end
  end

  def down
    remove_column :jobs, :first_approved_at
    remove_column :discussions, :first_approved_at
    remove_column :blogs, :first_approved_at
    remove_column :events, :first_approved_at
  end
end
