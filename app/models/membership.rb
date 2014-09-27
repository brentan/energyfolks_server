class Membership < ActiveRecord::Base

  attr_accessible :approved, :admin_level, :moderation_emails, :user_id, :affiliate_id, :reason, :graduation_year, :graduation_month, :program_id, :school_affiliation

  scope :approved, where(:approved => true)
  scope :waiting, where(:approved => false)

  belongs_to :affiliate
  belongs_to :user
  belongs_to :program

  # Admin levels
  USER = 0          # No special rights
  CONTRIBUTOR = 1   # Can post without moderation, wordpress contributor
  AUTHOR = 2        # Can post without moderation, wordpress author
  EDITOR = 3        # Can moderate posts, wordpress editor
  ADMINISTRATOR = 4 # Full rights to assign other admins

  before_save :set_approval_flag

  # Affiliations
  UNDERGRADUATE = 0
  GRADUATE = 1
  POSTGRADUATE = 2
  FACULTY = 3
  STAFF = 4
  ALUMNI = 5
  NO_AFFILIATION = 6


  def set_approval_flag
    if self.affiliate.open == 1
      self.approved = true
      self.broadcast = true
    end
  end

  def entity_id
    self.user_id
  end

  def self.school_affiliations
    ["Undergraduate Student", "Graduate Student", "Post-Graduate Researcher", "Faculty", "Staff", "Alumni", "No Affiliation"]
  end
  def self.school_affiliation(code)
    self.school_affiliations[code]
  end
  def self.school_affiliations_select
    output = []
    i = 0;
    self.school_affiliations.each do |v|
      output << [v, i]
      i=i+1
    end
    return output
  end
  def self.graduation_month
    months = []
    (1..12).each {|m| months << [Date::MONTHNAMES[m], m]}
    return months
  end
  def self.graduation_year
    year = []
    (50..150).each {|m| year << [1900+m, 1900+m]}
    return year
  end

end