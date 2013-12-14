class DigestMailer < ActiveRecord::Base
  belongs_to :user
  has_many :emails, as: :entity, :dependent => :destroy
  has_many :digest_items, :dependent => :destroy
  has_many :email, as: :entity, :dependent => :destroy

  attr_accessible :user, :user_id, :weekly

  def mark_read
    self.update_column(:opened, true)
    self.update_column(:open_date, Time.now())
    self.digest_items.each do |i|
      i.update_column(:opened, true)
      i.update_column(:open_date, Time.now())
    end
  end

  def token
    return self.email.token if self.email.present?
    return Email.create(user_id: self.user_id, entity: self).token
  end

  def items
    # A digest has five major components:
    # Announcements, events, jobs, discussions, blog posts

    output = { :announcements => [] }
    # Get all blog posts, and split out the digest announcements:
    output[:blogs] = get_items(Blog)
    output[:blogs][:all].each do |b|
      output[:announcements] << b if b.digest? && b.affiliate.present? && b.affiliate.member?(self.user)
    end

    # Determine job radius settings
    if self.user.subscription.job_radius == 0
      output[:jobs] = {message: 'All Jobs regardless of location'}
      options = {}
    else
      output[:jobs] = {message: "Jobs within #{self.user.subscription.job_radius} miles of #{self.user.location}"}
      options = {location_lat: self.user.latitude, location_lng: self.user.longitude, radius: self.user.subscription.job_radius }
    end
    output[:jobs] = output[:jobs].merge(get_items(Job, options))

    # Determine event radius settings
    if self.user.subscription.job_radius == 0
      output[:events] = {message: 'All Events regardless of location'}
      options = {}
    else
      output[:events] = {message: "Events within #{self.user.subscription.event_radius} miles of #{self.user.location}"}
      options = {location_lat: self.user.latitude, location_lng: self.user.longitude, radius: self.user.subscription.event_radius }
    end
    output[:events] = output[:events].merge(get_items(Event, options))

    output[:discussions] = get_items(Discussion)

    # Generate the digest_items records used for tracking
    output[:blogs][:all].each { |e| self.digest_items.create!(entity: e, weekly: self.weekly?) }
    output[:events][:all].each { |e| self.digest_items.create!(entity: e, weekly: self.weekly?) }
    output[:jobs][:all].each { |e| self.digest_items.create!(entity: e, weekly: self.weekly?) }
    output[:discussions][:all].each { |e| self.digest_items.create!(entity: e, weekly: self.weekly?) }

    return output
  end

  private

  def get_items(entity, options = {})
    if entity == Event
      defaults = {
          display: 'dates',
          end: self.weekly? ? 14.days.from_now : 48.hours.from_now,
          start: Time.now(),
          source: 0,
          highlight: 0,
          entity_back: true
      }
    else
      defaults = {
          display: 'dates',
          start: self.weekly? ? 8.days.ago : 36.hours.ago,
          end: Time.now(),
          source: 0,
          highlight: 0,
          entity_back: true
      }
    end
    options = defaults.merge(options)
    output = {}
    output[:highlighted] = self.user.affiliate_id.present? && self.user.affiliate_id > 0 ? entity.find_all_visible(self.user, self.user.affiliate, options.merge({highlight: self.user.affiliate_id}))[0] : []
    output[:source] = (self.user.affiliate_id.present? && self.user.affiliate_id > 0 ? entity.find_all_visible(self.user, self.user.affiliate, options.merge({source: self.user.affiliate_id}))[0] : []) - output[:highlighted]
    output[:all_other] = entity.find_all_visible(self.user, self.user.affiliate,options)[0] - output[:highlighted] - output[:source]
    output[:all] = output[:all_other] + output[:highlighted] + output[:source]
    return output
  end
end