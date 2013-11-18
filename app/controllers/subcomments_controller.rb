class SubcommentsController < ApplicationController

  def new
    @item = Subcomment.new()
  end

  def create
    return redirect_to '/' unless current_user.present?
    @item = Subcomment.new(params[:subcomment])
    @item.user_id = current_user.id
    @item.user_name = "#{current_user.first_name} #{current_user.last_name}"
    @item.comment_id = params[:comment_id]
    return render :action => "new" if !@item.save
    @item.subscribe(current_user) if params[:subscribe] == '1'
    @item.broadcast(current_user).delay(:run_at => 5.minutes.from_now)
  end

  def delete
    # TODO:
    # Blog integration so that submitted blogs have same comment stream somehow
  end

end