class TagsEntity < ActiveRecord::Base
  belongs_to :tag
  belongs_to :entity, :polymorphic => true
  # To change this template use File | Settings | File Templates.
end