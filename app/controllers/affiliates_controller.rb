class AffiliatesController < ApplicationController

  before_filter :check_for_admin_rights, :except => [:index, :users, :logo, :dashboard, :approve, :reject_or_remove]

  def index
    if current_user.present? && current_user.admin?
      @affiliates = Affiliate.order(:name).all
    else
      @affiliates = Affiliate.all_visible_affiliates(current_user)
    end
  end

  def dashboard
    check_for_admin_rights(Membership::CONTRIBUTOR)
  end

  def users
    @affiliate = Affiliate.find_by_id(params[:id])
  end
  def members
    @users = current_affiliate.approved_members
  end

  def wordpress_details
    return render :inline => 'false' if current_affiliate.blank? || current_affiliate.id.blank?
    return render :inline => 'badsecret' unless current_affiliate.check_hash(params[:aid_hash])
    render :json => {color: current_affiliate.color}
  end

  def logo
    affiliate = Affiliate.find_by_id(params[:id])
    if affiliate.blank? || (affiliate.present? && affiliate.id.blank?) || (affiliate.present? && affiliate.id.present? && affiliate.logo.blank?)
      image_url = "#{Rails.root}/app/assets/images/logo_small.png" # Render the EF logo
    else
      image_url = affiliate.logo.url(:thumb) # Render the image directly for this affiliate here
      image_url = affiliate.logo.path(:thumb) if image_url[0..0] == '/' # Non-s3 is local
    end
    response.headers['Cache-Control'] = "public, max-age=#{96.hours.to_i}"
    response.headers['Content-Type'] = 'image/jpeg'
    response.headers['Content-Disposition'] = 'inline'
    render :text => open(image_url, 'rb').read
  end

  def new
    return redirect_to '/' unless current_user.admin?
    @affiliate = Affiliate.new
  end

  def edit
    @affiliate = Affiliate.find(params[:id])
  end

  def create
    return redirect_to '/' unless current_user.admin?
    @affiliate = Affiliate.new(params[:affiliate])
    return render :action => "new" if !@affiliate.save
    flash[:notice]="Affiliate successfully created"
    google = GoogleClient.new
    google.create_affiliate(@affiliate)
    redirect_to "/affiliates/dashboard?iframe_next=1&aid=#{@affiliate.id}"
  end

  def delete
    @affiliate = Affiliate.find(params[:id])
    google = GoogleClient.new
    google.remove_affiliate(@affiliate)
    @affiliate.destroy
    render :inline => "The group has been completely removed."
  end

  def update
    @affiliate = Affiliate.find(params[:id])
    if(@affiliate.update_attributes(params[:affiliate]))
      flash[:notice]="Changes successfully saved"
    else
      flash[:alert]="There are errors in your submission.  Please correct and resubmit."
    end
    render :action => :edit
  end

  def rights
    @affiliate = Affiliate.find(params[:aid])
    @user = User.find_by_id(params[:id])
    @membership = Membership.find_by_affiliate_id_and_user_id(@affiliate.id, @user.id)
    if @membership.present? && params[:iframe_next].present?
      @membership.update_attributes!(params[:membership])
      @user.delay.sync
      flash[:notice] = 'Rights successfully updated'
    end
  end

  def approve
    check_for_admin_rights(Membership::EDITOR)
    user = User.find_by_id(params[:id])
    @result = user.approve(current_user, current_affiliate) if user.present?
  end

  def reject_or_remove
    check_for_admin_rights(Membership::EDITOR)
    user = User.find_by_id(params[:id])
    @result = user.reject_or_remove(current_user, current_affiliate, params[:reason])
  end

  def salesforce
    @affiliate = Affiliate.find(params[:id])
    @client = SalesforceClient.new(@affiliate)
    @notice_message = ''
    if params[:subbed].present?
      @affiliate.update_attributes(params[:affiliate])
      @affiliate.reload
      flash[:notice]="Changes successfully saved"
    end
    if params[:force].present?
      if @client.enabled? && @client.login.blank?
        fail = 0
        tot = 0
        @affiliate.approved_members.each do |u|
          fail += 1 if @client.sync_user(u) == 2
          tot += 1
        end
        @notice_message = "Manual Sync Complete: #{fail} failure#{fail == 1 ? '' : 's'} out of #{tot} total."
        flash[:notice]="Your membership has been synced."
      else
        flash[:notice]="Could not authenticate to Salesforce.  Check your settings."
      end
    end
    begin
      if @client.enabled? && @client.login.blank?
        current = @affiliate.salesforce_items.map { |i| i.id }
        @client.fields.each do |f|
          item = SalesforceItem.where(affiliate_id: @affiliate.id, salesforce_name: f[:name]).first
          if item.blank?
            SalesforceItem.create!(affiliate_id: @affiliate.id, salesforce_label: f[:label], salesforce_name: f[:name], salesforce_options: f[:options], salesforce_type: SalesforceItem.type_index(f[:type]), custom: SalesforceItem::NONE)
          else
            item.salesforce_options = f[:options]
            item.salesforce_type = SalesforceItem.type_index(f[:type])
            item.salesforce_label = f[:label]
            item.save!
            current -= [item.id]
          end
        end
        current.each { |c| SalesforceItem.find(c).destroy }
        @affiliate.reload
      end
    rescue
    end
  end


  private
  def check_for_admin_rights(level = Membership::ADMINISTRATOR)
    return redirect_to '/' unless current_user.present?
    affiliate = Affiliate.find(params[:aid]) if params[:aid].present? && params[:aid].to_i > 0
    affiliate = Affiliate.find(params[:id]) if params[:id].present? && affiliate.blank?
    if affiliate.present?
      return redirect_to '/' unless (current_user.admin? || affiliate.admin?(current_user, level))
    else
      return redirect_to '/' unless current_user.admin?
    end
  end

end