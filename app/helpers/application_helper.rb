module ApplicationHelper

  # Place into forms that load in iframe: This ensures other page loads with same layout
  def iframe_form
    output = current_affiliate.id.present? ? "<input type='hidden' name='aid' value='#{current_affiliate.id}'>" : ""
    output += (@layout == 'iframe') ? '<input type="hidden" name="iframe_next" value="1"/>' : ''
    return output
  end

  # show alert/notices in the notice bar
  def notices(notice, alert)


    html = ['<script language="javascript">', '$(function () {']
    html << "EnergyFolks.showNotice('#{notice.gsub(/'/, "\\\\'")}');" if notice.present?
    html << "EnergyFolks.showNotice('#{alert.gsub(/'/, "\\\\'")}','red');" if alert.present?
    return '' unless html.length > 2
    html << '});'
    html << '</script>'
    return html.join("\n")
  end

  def prev_next_buttons
    html = ''
    html += link_to('Previous', '#', class: 'button prev')
    html += link_to('Next', '#', class: 'button next')
    html += link_to('Submit', '#', class: 'button submit disable')
    return content_tag(:div, raw(html), class: 'buttons')
  end

  def show_errors(item)
    html = ''
    if item.errors.any?
      html += "<div class='error_explanation'><strong>#{pluralize(item.errors.count, "error")} occurred during submission:</strong><ul>"
      item.errors.full_messages.each do |msg|
        html += content_tag(:li, msg)
      end
      html += "</ul><strong>Please update your submission and try again</strong></div>"
    end
    return html
  end

  def popup(text, command, iframe, params = {}, message = nil)
    if message.nil?
      link_to text, '#', class: 'EnergyFolks_popup', data: {command: command, iframe: iframe, params: params.to_query}
    else
      link_to text, '#', class: 'EnergyFolks_popup_confirm', data: {message: message, command: command, iframe: iframe, params: params.to_query}
    end
  end

  def ajax_link(text, command, params, delete=false)
    link_to text, '#', class: (delete ? 'EnergyFolks_delete' : 'EnergyFolks_ajax'), data: {command: command, params: params.to_query}
  end

  def carousel_slide_title_section(title_text, slide_count)
    html = "<div class='carousel_title_section'><h1>#{title_text}</h1>"
    html += progress_bar(slide_count)
    html += "<hr></div>"
  end

	def progress_bar(number_of_steps)
		html = ''
		html += "<div class='progress_bar pager'>"
		number_of_steps.times do |index|
			step = index + 1  #index is zero-based, we want steps to be numbered from 1
      #if step == current_step
      #  html += "<a rel='#{index}' href='#' class='pagenum current_page'>#{step}</a>"
      #else
        html += "<a rel='#{index}' href='#' class='pagenum'>#{step}</a>"
      #end
		end
	  html += '</div>'
  end

  def styled_file_input(file_input_html, button_label)
    # make file input transparent and show styled button underneath, a hack based on http://www.quirksmode.org/dom/inputfile.html
    # makes it difficult to do correct cursor and hover styling, so we're not using it now.
    # use example:   <%= raw(styled_file_input(f.file_field(:logo),"Upload Logo")) %>
    html = "<div class='file_inputs'>#{file_input_html}<div class='fake_file'>"
    html += "<div class='file_input_btn'>#{button_label}</div>"
    html += "<div class='file_name_label'></div>"
    html += "</div></div>"
  end

end
