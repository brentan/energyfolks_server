class DigestItem < ActiveRecord::Base
  belongs_to :digest_mailer
  belongs_to :entity, :polymorphic => true

  attr_accessible :entity, :weekly
end