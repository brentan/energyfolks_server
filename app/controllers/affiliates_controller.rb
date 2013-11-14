class AffiliatesController < ApplicationController

  before_filter :check_for_admin_rights, :except => [:index, :users, :logo]

  def index
    if current_user.present? && current_user.admin?
      @affiliates = Affiliate.order(:name).all
    else
      @affiliates = Affiliate.all_visible_affiliates(current_user)
    end
  end

  def users
    @affiliate = Affiliate.find_by_id(params[:id])
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
    redirect_to :action => 'edit', :id => @affiliate.id
  end

  def delete
    @affiliate = Affiliate.find(params[:id])
    @affiliate.destroy
    flash[:notice]="The group has been completely removed."
    redirect_to '/'
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
      flash[:notice] = 'Rights successfully updated'
    end
  end

  def approve
    @affiliate = Affiliate.find(params[:aid])
    @user = User.find_by_id(params[:id])
    @membership = Membership.find_by_affiliate_id_and_user_id(@affiliate.id, @user.id)
    if @membership.present?
      @membership.approved = true
      @membership.broadcast = true
      @membership.save!
      UserMailer.delay.affiliate_approved(@user,@aid, @host)
      @user.update_index
    end
  end

  def reject_or_remove
    @affiliate = Affiliate.find(params[:aid])
    @user = User.find_by_id(params[:id])
    @membership = Membership.find_by_affiliate_id_and_user_id(@affiliate.id, @user.id)
    if @membership.present? && params[:reason].present?
      if @membership.approved?
        UserMailer.delay.affiliate_removed(@user, params[:reason], @aid, @host)
      else
        UserMailer.delay.affiliate_rejected(@user, params[:reason], @aid, @host)
      end
      @membership.approved = false
      @membership.destroy
      @membership = nil
      @user.update_index
    end
  end


  private
  def check_for_admin_rights
    return redirect_to '/' unless current_user.present?
    affiliate = Affiliate.find(params[:aid]) if params[:aid].present? && params[:aid].to_i > 0
    affiliate = Affiliate.find(params[:id]) if params[:id].present? && affiliate.blank?
    if params[:id].present? && affiliate.present?
      return redirect_to '/' unless current_user.admin? || Membership.is_admin?(current_user, affiliate, Membership::ADMINISTRATOR)
    else
      return redirect_to '/' unless current_user.admin?
    end
  end

end