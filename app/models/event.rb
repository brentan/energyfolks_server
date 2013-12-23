class Event < ActiveRecord::Base
  has_many :affiliates, :through => :affiliates_events
  has_many :affiliates_events, :dependent => :destroy
  belongs_to :user
  has_many :versions, :foreign_key => 'entity_id', :class_name => 'EventsVersion',:dependent => :destroy

  default_scope order('start ASC')

  VERSION_CONTROLLED = %w(name host start end timezone html synopsis location location2 logo_file_name logo_content_type logo_file_size logo_updated_at)
  include MixinEntity

  acts_as_locatable
  acts_as_moderatable
  acts_as_taggable

  before_save :update_start_end_time

  attr_writer :start_dv, :end_dv

  accepts_nested_attributes_for :affiliates_events, :allow_destroy => true

  validates_presence_of :name, :synopsis, :location, :html
  validates_length_of :synopsis, :maximum => 120

  has_attached_file :logo, {
      :styles => { :medium => "120x200>", :thumb_big => "90x90#", :thumb => "40x40#" },
      :path => Rails.env != 'production' ? Paperclip::Attachment.default_options[:path] : "//logos_events/:hash.:extension",
      :hash_secret => "asfAdsfmasdfaSDFj23enujdskfsdjkfn23unjasdkfnakjsdfnnff-"
  }
  validates_attachment :logo,
                       :content_type => { :content_type => /^(image).*/ },
                       :size => { :in => 0..2.megabytes }

  attr_accessible :name, :host, :location, :location2, :html, :synopsis, :start, :end, :logo, :affiliates_events_attributes, :last_updated_by, :start_d, :end_d, :start_t, :end_t, :timezone, :start_dv, :end_dv


  def self.date_column
    'start'
  end

  def date_string
    start_date = self.start.strftime( "%A, %B %-d, %Y")
    end_date = self.end.strftime( "%A, %B %-d, %Y")
    start_time = self.start.strftime("%l:%M %p")
    end_time = self.end.strftime("%l:%M %p")
    start = "#{start_date} #{start_time}"
    end_string = start_date != end_date ? "#{end_date} #{end_time}" : end_time
    return "#{start} to #{end_string}"
  end

  def mmddyyyy
    self.start.strftime("%m%d%Y")
  end
  def start_date
    self.start.strftime( "%A, %B %-d, %Y")
  end
  def end_date
    self.end.strftime( "%A, %B %-d, %Y")
  end
  def start_time
    self.start.strftime("%l:%M %p")
  end
  def end_time
    self.end.strftime("%l:%M %p")
  end
  def tz
    self.start.strftime("%Z")
  end

  def start_d
    self.start.present? ? strftime(self.start, "%Y-%m-%d") : strftime(Time.now, "%Y-%m-%d")
  end
  def start_d=(val)
    @start_d = val
  end
  def end_d
    self.end.present? ? strftime(self.end, "%Y-%m-%d") : strftime(Time.now, "%Y-%m-%d")
  end
  def end_d=(val)
    @end_d = val
  end
  def start_t
    self.start.present? ? strftime(self.start, "%l:%M %p") : '12:00 PM'
  end
  def start_t=(val)
    @start_t = val
  end
  def end_t
    self.end.present? ? strftime(self.end, "%l:%M %p") : '1:00 PM'
  end
  def end_t=(val)
    @end_t = val
  end
  def start_dv
    self.start.present? ? strftime(self.start, "%m/%d/%Y") : strftime(Time.now, "%m/%d/%Y")
  end
  def end_dv
    self.end.present? ? strftime(self.end, "%m/%d/%Y") : strftime(Time.now, "%m/%d/%Y")
  end

  private
  def update_start_end_time
    Time.use_zone(self.timezone) do
      self.start = Time.zone.parse("#{@start_d} #{@start_t}") if @start_d.present?
      self.end = Time.zone.parse("#{@end_d} #{@end_t}") if @end_d.present?
    end
  end
  def strftime(datetime, format)
    datetime.in_time_zone(self.timezone).strftime(format)
  end
end