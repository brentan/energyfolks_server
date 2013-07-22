module MixinEntityController

  def self.included(base)
    base.extend(ClassMethods)
  end
  module ClassMethods
  end

  def model
    controller_name.classify.constantize # Should be overwritten to provide associated model if this doesnt work
  end

  def show
    @item = model.find_by_id(params[:id])
  end

  def edit
  end

  def new
  end

  def delete
  end

  def approve
  end

  def reject
  end

  def moderation
  end

end