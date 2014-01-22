class ScheduledOperation < ActiveRecord::Base
  attr_accessible :command

  def self.start(command)
    return self.create!(command: command)
  end

  def mark_complete
    self.complete = true
    self.save!
  end
end
