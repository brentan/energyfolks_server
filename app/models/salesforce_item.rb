class SalesforceItem < ActiveRecord::Base
  belongs_to :affiliate

  attr_accessible :affiliate_id, :salesforce_type, :salesforce_name, :salesforce_label, :salesforce_options, :custom, :energyfolks_name
  serialize :salesforce_options

  before_save :set_enabled
  # custom values
  NONE = 0
  PROFILE = 1
  SIGNUP = 2

  # type values
  STRING = 0
  DOUBLE = 1
  INT = 2
  EMAIL = 3
  TEXTAREA = 4
  BOOLEAN = 5
  URL = 6
  PHONE = 7
  PICKLIST = 8
  MULTIPICKLIST = 9

  def self.type_strings
    %w(string double int email textarea boolean url phone picklist multipicklist)
  end
  def self.type_index(str)
    hash = Hash[self.type_strings.map.with_index.to_a]
    hash[str.downcase]
  end
  def self.select_options
    [['Not Linked',''], ['First Name', 'first_name'], ['Last Name', 'last_name'], ['Full Name', 'name'], ['Email Address', 'email'], ['School Affiliation (faculty/student/etc)','member_school_affiliation'],['School Program', 'member_school_program'],['Graduation Month/Year','member_grad_month_year'],['Graduation Year','member_grad_year'],['City/State (Location)','location'], ['Latitude','latitude'],['Longitude','longitude'],['Current Position', 'position'], ['Current Employer', 'organization'], ['User Bio','bio'], ['User Interests','interest'],['User Expertise','expertise']]
  end

  private
  def set_enabled
    self.enabled = (self.custom.present? && (self.custom > NONE)) || self.energyfolks_name.present?
    return true
  end
end
