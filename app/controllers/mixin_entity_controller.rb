module MixinEntityController

  def self.included(base)
    base.extend(ClassMethods)
  end
  module ClassMethods
  end

  def model
    controller_name.classify.constantize # Should be overwritten to provide associated model if this doesnt work
  end

  def param_label
    controller_name.classify.downcase
  end

  def index

  end

  def show
    @item = model.find_by_id(params[:id])
    @item.version_control(current_user, current_affiliate)
  end

  def edit
    @item = model.find_by_id(params[:id])
  end

  def toggle_highlight

  end

  def update
    #is_editable?()
    #Tag.update_tags(@item.raw_tags, @item)
  end

  def new
    @item = model.new()
  end

  def create
    @item = model.new(params[self.param_label])
    @item.user = current_user
    @item.affiliate_id = current_affiliate.id.present? ? current_affiliate.id : 0
    @item.last_updated_by = current_user.id
    if !@item.save
      render :action => "new"
    else
      Tag.update_tags(@item.raw_tags, @item)
      redirect_to :action => "edit", :id => @item.id, :notice => "Your post was successful.  It is now awaiting approval by any moderated groups you submitted the post to."
    end
  end

  def delete
  end

  def approve
  end

  def reject_or_remove
  end

  def moderation
    @code = "EnergyFolks.get_moderated = true;EnergyFolks.showPage({source: '#{model.new.method_name}', format: 'list'});"
    render '/common/load_js'
  end

  def myposts
    @code = "EnergyFolks.get_my_posts = true;EnergyFolks.showPage({source: '#{model.new.method_name}', format: 'list'});"
    render '/common/load_js'
  end

  def force_resend
    # TODO: write this...force resend email to all users in group with special message at top.  Copy logic from user_broadcast
  end

  def email_open
    #TODO: write this, should update email model with info on who opened/when/etc
  end

end