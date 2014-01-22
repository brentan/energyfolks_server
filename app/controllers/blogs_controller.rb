class BlogsController < ApplicationController
  include MixinEntityController

  def AddWordpressPost
    if check_hash && (params[:owner_id].to_i > 0)
      blog = Blog.unscoped.where(affiliate_id: current_affiliate.id, wordpress_id: params[:post_id].to_i).first
      if blog.present?
        data = {
            name: params[:title],
            html: params[:content],
            url: params[:url],
            digest: params[:digest].to_i,
            announcement: params[:announce].to_i,
            frozen_by_wordpress: false,
            last_updated_by: params[:owner_id].to_i
        }
        # Current post, update details
        if(blog.update_attributes(data))
          Tag.update_tags(params[:tags], blog)
          blog.affiliate_join.where(awaiting_edit: true).each do |r|
            r.awaiting_edit = false
            r.broadcast = false
            r.save!
          end
          blog.reload
          blog.broadcast(false)
          render :nothing => true
        else
          render :inline => 'Item could not be saved: ensure the title and body are not blank.'
        end
      else
        # New post
        data = {
            name: params[:title],
            html: params[:content],
            url: params[:url],
            affiliate_id: current_affiliate.id,
            wordpress_id: params[:post_id].to_i,
            user_id: params[:owner_id].to_i,
            digest: params[:digest].to_i,
            announcement: params[:announce].to_i,
            last_updated_by: params[:owner_id].to_i
        }
        blog = Blog.new(data)
        blog.affiliates_blogs.build({affiliate_id: 0, awaiting_edit: false})
        if blog.save!
          Tag.update_tags(params[:tags], blog)
          render :nothing => true
        else
          render :inline => 'Item could not be saved: ensure the title and body are not blank.'
        end
      end
    elsif check_hash
      render :inline => 'Your energyfolks session timed out.  Please re-login to energyfolks and try again'
    else
      render :inline => 'Bad secret.  You should re-synchronize your wordpress installation with energyfolks.'
    end
  end

  def FreezeWordpressPost
    if check_hash
      blog = Blog.unscoped.where(affiliate_id: current_affiliate.id, wordpress_id: params[:post_id].to_i).first
      if blog.present?
        blog.update_column(:frozen_by_wordpress, true)
        blog.remove_from_index
      end
      render :nothing => true
    else
      render :inline => 'Bad secret.  You should re-synchronize your wordpress installation with energyfolks.'
    end
  end

  def DeleteWordpressPost
    if check_hash
      blog = Blog.unscoped.where(affiliate_id: current_affiliate.id, wordpress_id: params[:post_id].to_i).first
      blog.destroy if blog.present?
      render :nothing => true
    else
      render :inline => 'Bad secret.  You should re-synchronize your wordpress installation with energyfolks.'
    end
  end

  private
  def check_hash
    params[:hash] == Digest::MD5.hexdigest("#{current_affiliate.shared_secret}#{params[:post_id]}")
  end
end