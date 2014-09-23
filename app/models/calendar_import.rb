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
          event = Event.where(autoimport: e.uid.to_s).first
          if event.present?
            begin
              event.update_column(:start, e.dtstart.utc)
              event.update_column(:end, e.dtend.utc)
            rescue
              event.update_column(:start, e.dtstart.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtstart.icalendar_tzid).local_to_utc(e.dtstart) : e.dtstart.to_s)
              event.update_column(:end, e.dtend.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtend.icalendar_tzid).local_to_utc(e.dtend) : e.dtend.to_s)
            end
            event.update_column(:name, e.summary.to_s)
            event.update_column(:location2, e.location.to_s)
            new_html_string = TruncateHtml::HtmlString.new(ActionController::Base.helpers.sanitize(e.description, tags: %w(p i b u br a img)))
            event.update_column(:html, new_html_string)
            synopsis = TruncateHtml::HtmlTruncator.new(new_html_string, {length: 115}).truncate.html_safe
            event.update_column(:synopsis, synopsis)
            event.versions.each do |v|
              begin
                v.update_column(:start, e.dtstart.utc)
                v.update_column(:end, e.dtend.utc)
              rescue
                v.update_column(:start, e.dtstart.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtstart.icalendar_tzid).local_to_utc(e.dtstart) : e.dtstart.to_s)
                v.update_column(:end, e.dtend.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtend.icalendar_tzid).local_to_utc(e.dtend) : e.dtend.to_s)
              end
              event.update_column(:name, e.summary.to_s)
              event.update_column(:location2, e.location.to_s)
              event.update_column(:html, new_html_string)
              event.update_column(:synopsis, synopsis)
            end
            event.reload
            event.update_index
          else
            event = Event.new()
            event.name = e.summary.to_s
            begin
              event.start = e.dtsart.utc
              event.end = e.dtend.utc
            rescue
              event.start = e.dtstart.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtstart.icalendar_tzid).local_to_utc(e.dtstart) : e.dtstart.to_s
              event.end = e.dtend.is_a?(DateTime) ? ActiveSupport::TimeZone.new(e.dtend.icalendar_tzid).local_to_utc(e.dtend) : e.dtend.to_s
            end
            next if event.end < Time.now
            event.user_id = -1
            event.timezone = e.dtstart.icalendar_tzid if e.dtstart.is_a?(DateTime)
            event.timezone = self.affiliate.timezone if event.timezone.blank?
            event.location = self.location
            event.location2 = e.location.to_s
            event.affiliate_id = self.affiliate_id
            event.autoimport = e.uid.to_s
            next if e.description.nil?
            html_string = TruncateHtml::HtmlString.new(ActionController::Base.helpers.sanitize(e.description, tags: %w(p i b u br a img)))
            event.html = html_string
            event.synopsis = TruncateHtml::HtmlTruncator.new(html_string, {length: 115}).truncate.html_safe
            event.save!
          end

          if self.send_to_all?
            a = AffiliatesEvent.where(:event_id => event.id, :affiliate_id => 0).first
            if a.blank?
              AffiliatesEvent.create(:event_id => event.id, :affiliate_id => 0, :admin_version => event.current_version, :broadcast => true)
              ef_admins += 1
            end
          end
          a = AffiliatesEvent.where(:event_id => event.id, :affiliate_id => self.affiliate_id).first
          if a.blank?
            AffiliatesEvent.create(:event_id => event.id, :affiliate_id => self.affiliate_id, :admin_version => event.current_version, :broadcast => true)
            group_admins += 1
          end
        rescue
          # item was problematic, ignore it
        end
      end
    rescue
      recipients = self.affiliate.admins(Membership::EDITOR, true)
      recipients.each do |user|
        NotificationMailer.auto_import_failure(user, self.affiliate_id, self.url).deliver()
      end
    end
    return self.affiliate_id, self.url, group_admins, ef_admins
  end
end