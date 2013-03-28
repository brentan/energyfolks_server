module ApplicationHelper

  # Place into forms that load in iframe: This ensures other page loads with same layout
  def iframe_form
    @layout == 'iframe' ? '<input type="hidden" name="iframe_next" value="1"/>' : ''
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
end
