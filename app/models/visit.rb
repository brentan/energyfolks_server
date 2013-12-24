class Visit < ActiveRecord::Base
  belongs_to :affiliate
  belongs_to :user

  scope :registered, where('user_id IS NOT NULL')
  scope :anonymous, where('user_id IS NULL')

  LOGIN_TRY = 0
  EVENTS = 1
  JOBS = 2
  DISCUSSIONS = 3
  USERS = 4
  BLOGS = 5
  PROFILE = 6
  GENERAL = 7

  attr_accessible :ip, :user_id, :affiliate_id, :page

end
