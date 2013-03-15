class User < ActiveRecord::Base
  has_many :user_login_hashes, :dependent => :destroy

  attr_accessible :email, :first_name, :last_name, :region_id, :visibility, :timezone, :language, :avatar,
                  :password, :password_confirmation, :password_old
  attr_accessor :password
  validates_presence_of :first_name
  validates_presence_of :email
  validates_uniqueness_of :email, :case_sensitive => false
  validates_length_of :password, :within => 4..40, :if => :password_entered?
  validates_confirmation_of :password, :if => :password_entered?

  before_save :set_password

  ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  ## Password hashing and salting algorithm, also used to generate cookie string
  # Functions below used to set password (and also cookie)
  def set_password
    return if self.password.blank?
    random = self.get_random_bytes(6)
    hash = self.crypt_private(self.password, "$P$B#{self.encode64(random, 6)}")
    self.encrypted_password = hash
    random = self.get_random_bytes(6)
    hash = self.crypt_private(hash, "$P$B#{self.encode64(random, 6)}")
    self.encrypted_cookie = hash
  end

  def check_password(password)
    hash = self.crypt_private(password, self.encrypted_password);
    return hash == self.encrypted_password
  end

  def cookie
    hash = self.encrypted_password + self.encrypted_cookie + self.id.to_s
    return Digest::MD5.hexdigest(hash + ITOA64)
  end

  def self.find_by_email_and_password(email, password)
    user = User.find_by_email(email.downcase)
    return nil if user.blank?
    return nil unless user.check_password(password)
    return user
  end

  def self.find_by_cookie(cookie)
    where_clause =  "CONCAT(encrypted_password,CONCAT(encrypted_cookie,id))"
    where_clause = "md5(CONCAT(#{where_clause}, '#{ITOA64}')) = '#{cookie}'"
    User.where(where_clause).first
  end

  protected
  # Used in validation to throw error if password do not match
  def password_entered?
    if new_record?
      return true
    end
    !password.blank?
  end

  ## Password hashing and salting algorithm, also used to generate cookie string
  # Support functions

  def get_random_bytes(count)
    output = '';
    i = 0
    while i < count do
      output += Digest::SHA1.hexdigest(Digest::SHA1.hexdigest(Time.now.to_f.to_s))
      i += 16
    end
    output = output[0,count]
    return output
  end

  def encode64(input, count)
    output = ''
    i = 0
    begin
      value = input[i].ord
      i += 1
      output += ITOA64[value & 0x3f]
      value = (value | (input[i].ord << 8)) if i < count
      output += ITOA64[(value >> 6) & 0x3f]
      break if i >= count
      i += 1
      value = (value | (input[i].ord << 16)) if i < count
      output += ITOA64[(value >> 12) & 0x3f]
      break if i >= count
      i += 1
      output += ITOA64[(value >> 18) & 0x3f]
    end while i < count
    return output
  end

  def crypt_private(password, setting)
    output = '*0'
    output = '*1' if (setting[0, 2] == output)

    id = setting[0, 3]
    return output if id != '$P$'
    count_log2 = ITOA64.index(setting[3]);
    return $output if (count_log2 < 7) || (count_log2 > 30)
    count = 1 << count_log2
    salt = setting[4, 8];
    return output if salt.length != 8
    hash = Digest::MD5.digest(salt + password)
    begin
      hash = Digest::MD5.digest(hash + password)
      count -= 1
    end while count > 0
    output = setting[0,12]
    output+= self.encode64(hash, 16)
    return output
  end
end
