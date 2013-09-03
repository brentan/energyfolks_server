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
    if params[:version].present? && current_user.present? && @item.is_editable?(current_user)
      @item.version_control(current_user, current_affiliate, params[:version].to_i)
    else
      @item.version_control(current_user, current_affiliate)
    end
  end

  def restore
    @item = model.find_by_id(params[:id])
    notice = "Not Authorized"
    # Restore a previous version...must check what user this is OK for
    if current_user.present?
      if current_user.id == @item.user_id
        # Case 1: User is owner.  Restore all to previous version
        @item.versions.where("version_number > ?",params[:version]).each do |i|
          i.destroy
        end
        @item.affiliate_join.each do |j|
          j.admin_version = params[:version]
          approved = j.approved_versions.split(',').delete_if{|i| i > params[:version]}
          j.approved_version = approved.max
          j.awaiting_edit = false
          j.broadcast = false
          j.approved_versions = approved.join(",")
          j.save
        end
        @item.update_column(:current_version, params[:version])
        @item.class.column_names.each do |cn|
          next if %w(id created_at updated_at).include?(cn)
          @item.update_column(cn,@item.get(cn, current_affiliate, current_user, params[:version].to_i))
        end
        notice = 'Version has been reverted'
      elsif current_affiliate.id.present? && current_affiliate.admin?(current_user, Membership::EDITOR)
        # Case 2: Revert just for one group
        join_item = @item.affiliate_join.where(affiliate_id: current_affiliate.id).first
        if join_item.present?
          join_item.approved_version = params[:version]
          join_item.broadcast = true
          join_item.approved_versions = join_item.approved_versions.split(',').delete_if{|i| i > params[:version]}.join(',')
          join_item.save
          notice = 'Version has been reverted'
        end
      elsif current_user.admin?
        # Case 3: Revert just for the main group
        join_item = @item.affiliate_join.where(affiliate_id: 0).first
        if join_item.present?
          join_item.approved_version = params[:version]
          join_item.broadcast = true
          join_item.approved_versions = join_item.approved_versions.split(',').delete_if{|i| i > params[:version]}.join(',')
          join_item.save
          notice = 'Version has been reverted'
        end
      end
    end
    redirect_to :action => 'show', :id => @item.id, :iframe => '1', :current_url => params[:current_url], :notice => notice
  end

  def edit
    @item = model.find_by_id(params[:id])
  end

  def update
    @item = model.find_by_id(params[:id])
    if current_user.present? && @item.is_editable?(current_user)
      params[@item.entity_name.downcase][:last_updated_by] = current_user.id
      if(@item.update_attributes(params[@item.entity_name.downcase]))
        Tag.update_tags(@item.raw_tags, @item)
        if current_user.id == @item.user_id
          @item.affiliate_join.where(awaiting_edit: true).each do |r|
            r.awaiting_edit = false
            r.broadcast = false
            r.save!
          end
          @item.reload
          @item.broadcast(false)
        end
        flash[:notice]="Changes have been saved"
        render :action => :show
      else
        flash[:alert]="There are errors in your update.  Please correct and resubmit."
        render :action => :edit
      end
    else
      flash[:alert]="You are not authorized to edit this item."
      render :action => :show
    end
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
      redirect_to :action => "show", :iframe_next => true, :id => @item.id, :notice => "Your post was successful.  Moderation status is found below."
    end
  end

  def approve
    @item = model.find_by_id(params[:id])
    affiliate = Affiliate.find_by_id(params[:aid])
    response = @item.approve(current_user, affiliate, params[:highlight] == "true")
    redirect_to :action => 'show', :id => @item.id, :iframe => '1', :current_url => params[:current_url], :notice => response
  end

  def reject_or_remove
    @affiliate = Affiliate.find(params[:aid])
    @item = model.find_by_id(params[:id])
    join_item = @item.affiliate_join.where(affiliate_id: @affiliate.id.present? ? @affiliate.id : 0).first
    if join_item.present? && params[:reason].present?
      if join_item.approved_version == @item.current_version
        NotificationMailer.delay.item_removed(@item, params[:reason], @affiliate)
        join_item.approved_version = 0
        join_item.approved_versions ='0'
        notice = "Item removed"
      else
        NotificationMailer.delay.item_rejected(@item, params[:reason], @affiliate)
        notice = "Item Rejected"
      end
      join_item.awaiting_edit = true
      join_item.save
      redirect_to :action => 'show', :id => @item.id, :iframe_next => true, :notice => notice
    else
      render 'common/reject_or_remove', locals: {join_item: join_item, aid: params[:aid]}
    end
  end

  def moderation
    @code = "EnergyFolks.minheight = 550;EnergyFolks.get_moderated = true;EnergyFolks.showPage({source: '#{model.new.method_name}', format: 'list'});"
    render '/common/load_js'
  end

  def myposts
    @code = "EnergyFolks.minheight = 550;EnergyFolks.get_my_posts = true;EnergyFolks.showPage({source: '#{model.new.method_name}', format: 'list'});"
    render '/common/load_js'
  end

  def force_resend
    # TODO: write this...force resend email to all users in group with special message at top.  Copy logic from user_broadcast
  end

  def email_open
    #TODO: write this, should update email model with info on who opened/when/etc
  end

end