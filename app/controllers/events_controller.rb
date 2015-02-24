class EventsController < ApplicationController
  include MixinEntityController

  def ical
    require 'icalendar'
    cal = Icalendar::Calendar.new
    if current_affiliate.present? && current_affiliate.id.present? && current_affiliate.latitude.present?
      lat = current_affiliate.latitude
      lng = current_affiliate.longitude
      rad_e = current_affiliate.event_radius * 1609.34
    else
      lat = 37.8044
      lng = -122.2708
      rad_e = 50  * 1609.34
    end
    data, more_pages = Event.find_all_visible(current_user, current_affiliate, {source: 'events', location_lat: lat, location_lng: lng, radius: rad_e, source: (params[:limit_to_affiliate].present? ? 1 : 0), highlight: 0, per_page: 1000, page: 0, shift: 0, entity_back: true})
    data.each do |ev|
      cal.event do |e|
        e.dtstart     = ev.ical_start
        e.dtend       = ev.ical_end
        e.summary     = ev.name
        e.description = ev.html
      end
    end
    cal.publish
    headers['Content-Type'] = "text/calendar; charset=UTF-8"
    render inline: cal.to_ical
  end
end