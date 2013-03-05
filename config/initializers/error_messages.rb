ActionView::Base.field_error_proc = Proc.new do |html_tag, instance|
	errors = Array(instance.error_message).join(',')
	if html_tag.to_s.starts_with?('<label')
		html_tag
	else
		"<div class=\"field_with_errors\">#{html_tag}<span class=\"validation-error\">&nbsp;#{errors}</span></div>".html_safe
	end
end
