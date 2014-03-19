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
    return redirect_to '/', :notice => 'This item was not found' if @item.blank?
    @item.mark_read(user_logged_in? ? current_user.id : 0, current_affiliate.id, request.remote_ip)
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
    if @item.archived?
      notice = "Archived items are locked from editing"
    elsif current_user.present?
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
      @item.update_index
    end
    redirect_to :action => 'show', :id => @item.id, :iframe => '1', :current_url => params[:current_url], :notice => notice
  end

  def edit
    @item = model.find_by_id(params[:id])
  end

  def update
    @item = model.find_by_id(params[:id])
    if @item.archived?
      flash[:alert]="This item is archived and changes are not allowed."
      render :action => :edit
    elsif current_user.present? && @item.is_editable?(current_user)
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
        else
          @item.update_index
        end
        flash[:notice]="Changes have been saved"
        render :action => :edit
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
    @item.affiliate_id = current_affiliate.id.present? ? current_affiliate.id : (current_user.affiliate_id.present? ? current_user.affiliate_id : 0)
    @item.last_updated_by = current_user.id
    if !@item.save
      render :action => "new"
    else
      Tag.update_tags(@item.raw_tags, @item)
      if @item.instance_of?(Job) && current_affiliate.id.blank?
        # When changing to all post, make sure admins of the group it was posted from do not see the donation page.
        @item.update_column(:donate, true)
        redirect_to :action => "donate", :iframe_next => true, :id => @item.id, :just_posted => true, :notice => "Your post was successful.  Please Consider a Donation."
      else
        redirect_to :action => "show", :iframe_next => true, :id => @item.id, :notice => "Your post was successful.  Moderation status is found below."
      end
    end
  end

  def donate
    @item = model.find_by_id(params[:id])
    @email_settings_token= EmailSettingsToken.find_by_token(params[:user_token])
    if @email_settings_token
      @user = @email_settings_token.user
      @email_settings_token.update_token
    end
    @just_posted = params[:just_posted].present?
    @user = current_user if user_logged_in?
    if params[:card].present?
      if params[:card] == 'new'
        customer = StripeToken.new_customer(@user, params[:token], params[:card_type], params[:last4])
        card = StripeToken.create!(user_id: @user.id, token: customer, last4: params[:last4], card_type: params[:card_type])
      else
        card = StripeToken.where(user_id: @user.id, id: params[:card].to_i).first
      end
      success, message = card.charge(params[:amount], @item)
      card.destroy unless success
      @item.reload
      flash[success ? :notice : :alert] = message
      @just_donated = success
      redirect_to :action => "show", :iframe_next => true, :id => @item.id if success && @just_posted
    else
      @just_donated = false
    end
  end

  def approve
    @item = model.find_by_id(params[:id])
    affiliate = Affiliate.find_by_id(params[:aid])
    response = @item.approve(current_user, affiliate, params[:highlight] == "true")
    redirect_to :action => 'show', :id => @item.id, :iframe => '1', :current_url => params[:current_url], :notice => response
  end

  def reject_or_remove
    @affiliate = Affiliate.find_by_id(params[:aid])
    @item = model.find_by_id(params[:id])
    join_item = @item.affiliate_join.where(affiliate_id: @affiliate.id.present? ? @affiliate.id : 0).first
    if join_item.present? && params[:reason].present?
      notice = @item.reject_or_remove(current_user, @affiliate, params[:reason])
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

end