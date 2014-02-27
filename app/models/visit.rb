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

  def self.unique_visits(options = {})
    options[:start] = 1.day.ago if options[:start].blank?
    options[:end] = Time.now if options[:end].blank?
    options[:page] = -1 if options[:page].blank?
    options[:affiliate_id] = -1 if options[:affiliate_id].blank?
    options[:type] = -1 if options[:type].blank? # 0 for anonymous, 1 for registered
    count = 0
    if options[:type] != 1
      # anonymous count
      query = Visit.anonymous.where("created_at > ? AND created_at <= ?", options[:start], options[:end])
      query = query.where(page: options[:page]) if options[:page] >= 0
      query = query.where(affiliate_id: options[:affiliate_id]) if options[:affiliate_id] >= 0
      count += query.select("DISTINCT ip").count
    end
    if options[:type] != 0
      # registered count
      query = Visit.registered.where("created_at > ? AND created_at <= ?", options[:start], options[:end])
      query = query.where(page: options[:page]) if options[:page] >= 0
      query = query.where(affiliate_id: options[:affiliate_id]) if options[:affiliate_id] >= 0
      count += query.select("DISTINCT user_id").count
    end
    return count
  end


end
