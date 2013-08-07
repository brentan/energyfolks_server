class Tag < ActiveRecord::Base
  has_many :tags_entities, :dependent => :destroy
  default_scope order(:name)
  # To change this template use File | Settings | File Templates.
  before_save :downcase
  def downcase
    self.name = self.name.downcase
  end

  def self.update_tags(field, entity)
    current = entity.tags.map { |t| t.name.downcase }
    entity.tags_entities.each do |t|
      t.destroy
    end
    field.split(",").each do |t|
      tag = Tag.find_by_name(t.downcase)
      if tag.blank?
        tag = Tag.new()
        tag.name = t.downcase
        tag.count = 1
        tag.save!
      elsif !current.include?(t.downcase)
        tag.count += 1
        tag.save!
      end
      te = TagsEntity.new()
      te.tag = tag
      te.entity = entity
      te.save
    end
  end

end