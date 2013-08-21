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
end
