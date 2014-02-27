class NightlyStat < ActiveRecord::Base
  belongs_to :affiliate

  attr_accessible :total_users, :total_active_users, :total_users_moderation, :total_jobs, :total_jobs_moderation, :total_events, :total_events_moderation,
                  :total_discussions, :total_discussions_moderation, :total_blogs, :total_blogs_moderation, :visits, :affiliate_id

end
