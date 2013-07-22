class Subscription < ActiveRecord::Base
  belongs_to :user
  attr_accessible :user_id, :weekly, :daily, :events, :event_radius, :jobs, :job_radius, :bulletins
end