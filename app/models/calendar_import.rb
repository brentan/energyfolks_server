class CalendarImport < ActiveRecord::Base
  belongs_to :affiliate
  attr_accessible :affiliate_id, :url, :location, :send_to_all

  def import_events
    group_admins = 0
    ef_admins = 0
    # Open a file or pass a string to the parser
    cal_file = open(self.url) {|f| f.read }
    begin
      cals = Icalendar::Parser.new(cal_file, false).parse
      cal = cals.first.events
      cal.each do |e|
        begin
          event = Event.where(autoimport: e.uid).first
          next if event.present?
          event = Event.new()
          event.name = e.summary
          event.start = e.dtstart.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtstart.icalendar_tzid).local_to_utc(e.dtstart) : e.dtstart
          event.end = e.dtend.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtend.icalendar_tzid).local_to_utc(e.dtend) : e.dtend
          next if event.end < Time.now
          event.user_id = -1
          event.timezone = e.dtstart.icalendar_tzid if e.dtstart.is_a?(DateTime)
          event.location = self.location
          event.location2 = e.location
          event.affiliate_id = self.affiliate_id
          event.autoimport = e.uid
          next if e.description.nil?
          html_string = TruncateHtml::HtmlString.new(ActionController::Base.helpers.sanitize(e.description, tags: %w(p i b u br a img)))
          event.html = html_string
          event.synopsis = TruncateHtml::HtmlTruncator.new(html_string, {length: 115}).truncate.html_safe
          event.save!
          affilid = self.send_to_all? ? 0 : self.affiliate_id
          a = AffiliatesEvent.where(:event_id => event.id, :affiliate_id => affilid).first
          if a.blank?
            AffiliatesEvent.create(:event_id => event.id, :affiliate_id => affilid, :admin_version => event.current_version, :broadcast => true)
            group_admins += 1 unless affilid == 0
            ef_admins += 1 if affilid == 0
          end
        rescue
          # item was problematic, ignore it
        end
      end
    rescue
      recipients = self.affiliate.admins(Membership::EDITOR, true)
      recipients.each do |user|
        NotificationMailer.delay.auto_import_failure(user, self.affiliate_id, self.url)
      end
    end
    return self.affiliate_id, self.url, group_admins, ef_admins
  end
end