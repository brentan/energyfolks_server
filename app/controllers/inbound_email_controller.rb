class InboundEmailsController < ApplicationController

  def inbound
    require 'sanitize'
    # Check for valid sender ip - disabled for now but can be enabled if spamming becomes an issue
    if false
      valid_ips = %w(50.22.57.66 50.22.57.67 50.22.57.68 50.22.57.69 50.22.57.70 75.126.253.5 174.36.68.190 174.36.68.189 173.193.154.132 74.86.7.102 67.228.32.8 67.228.32.9 67.228.32.7 67.228.60.18 75.126.100.76 173.193.154.70 67.228.32.10 173.193.154.153 173.193.154.74 50.56.19.204 198.37.145.35)
      if !(valid_ips.include? request.remote_ip)
        # try a reverse DNS and see if the IP belongs to sendgrid:
        Socket.do_not_reverse_lookup = false
        s = Socket.getaddrinfo(request.remote_ip,nil)
        if s.present? && s[0].present? && s[0][2].present? && (s[0][2].downcase =~ /\A[a-z0-9\.\-]\.sendgrid\.(com|me|net|biz)\Z/)
          err = log_it("new sendgrid IP found (#{request.remote_ip})",params)
          ErrorMailer.delay.mailerror(err)
        else
          err = log_it("Invalid poster IP (#{request.remote_ip})",params)
          ErrorMailer.delay.mailerror(err)
          render :json => { "message" => "OK" }, :status => 200
          return
        end
      end
    end

    # Check for from address
    if params['from'].blank?
      log_it("No From Address",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    # Check for charsets
    if params['charsets'].blank?
      log_it("No Reported Charset",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end
    charsets = JSON.parse(params['charsets'])
    # Convert the body
    email_html = nil
    begin
      email_text_base = params['text'].force_encoding(charsets['text']).encode("UTF-8", {:invalid => :replace, :undef => :replace, :replace => '?'})
      email_html = params['html'].force_encoding(charsets['text']).encode("UTF-8", {:invalid => :replace, :undef => :replace, :replace => '?'}) if params['html'].present?
    rescue
      log_it("Error Encoding the email text!",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    # Sanitize the HTML body (or use text if HTML not available)
    if email_html.present?
      email_text = Sanitize.clean(email_html, Sanitize::Config::RELAXED)
    else
      email_text = email_text_base.gsub(/(?:\n\r?|\r\n?)/, '<br>') #convert newlines to HTML at least
    end

    # Check for body
    if email_text.blank?
      log_it("No Body",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    # Pull out from address
    from_address = params['from']
    from_address = params['from'].scan(/<.*>/).first[1...-1] unless (from_address =~ Email::EMAIL_VALIDATION)
    # Test for valid from address
    if !(from_address =~ Email::EMAIL_VALIDATION)
      log_it("invalid from email",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end
    sender = User.find_by_email(from_address)

    # Check for spam
    spam_threshold = 12
    if params['spam_score'].present?
      spam_score = params['spam_score']
      spam_score = spam_score.to_f if spam_score.is_a?(String)
    else
      spam_score = nil
    end
    if params['SPF'].blank? || (params['SPF'].present? && (params['SPF'].downcase != 'pass') && (params['SPF'].downcase != 'softfail')) || spam_score.nil? || (spam_score.present? && (spam_score > spam_threshold))
      log_it("spam message (score of #{spam_score}, SPF #{params['SPF']})",params)
      # Send error only if user is known to us
      ErrorMailer.delay.error_back_to_sender(from_address, "Delivery error: message marked as spam", params['subject'], "Your message received a high spam score and was discarded.") if sender.present?
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    # Find the user associated with this address
    if sender.blank?
      log_it("sender not in our database",params)
      ErrorMailer.delay.error_back_to_sender(from_address, "Delivery error: email not found", params['subject'], "We were unable to find the email address #{from_address} linked to an account in our system.")
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    # Create a nice list of the to addresses without the @mail.energysociety.org
    if params['to'].blank? && params['cc'].blank?
      log_it("No To Address",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end
    to_addresses = []
    to_addresses_dirty = (params['to'].present? ? params['to'].split(", ") : []) + (params['cc'].present? ? params['cc'].split(", ") : [])
    to_addresses_dirty.each do |to_address|
      to_address = to_address.scan(/<.*>/).first[1...-1] unless (to_address =~ Email::EMAIL_VALIDATION)
      next if !(to_address =~ Email::EMAIL_VALIDATION)
      to_addresses << to_address.downcase.gsub(/@[a-z0-9\.\-]+.energyfolks.com/, '') if to_address.include?('@mail')
    end
    if to_addresses.empty? && user_addresses.empty?
      log_it("No Valid To Addresses",params)
      render :json => { "message" => "OK" }, :status => 200
      return
    end

    attached = []
    # Gather any attachments
    if params['attachments'].to_i > 0
      (1..(params['attachments'].to_i)).each do |ind|
        attached << params["attachment#{ind}"]
      end
    end

    to_addresses.each do |to_address|
      if to_address.include?('comment_')
        # This is a reply to a comment or post
        # Get the reply portion for comments (strip HTML as this really messes it up)
        email_text = email_text_base.gsub(/^[ \-]\-\-/,"\n ---") # ensure lines starting with "---" or " --" are preceded by a newline, as required by the parser gem to recognize them as section separators
        comment = EmailReplyParser.parse_reply(email_text).gsub(/(?:\n\r?|\r\n?)/, '<br>')
        to_address = to_address.split('_')
        if to_address[1] == '0'
          c = Comment.new()
          c.unique_hash = to_address[2]
        else
          prev_comment = Comment.where(hash: to_address[2], id: to_address[1])
          if prev_comment.blank?
            log_it("Could not find comment",params)
            render :json => { "message" => "OK" }, :status => 200
            return
          end
          c = Subcomment.new()
          c.comment_id = to_address[1].to_i
        end
        c.user_id = sender.id
        c.comment = comment
        c.affiliate_id = sender.affiliate_id.present? ? c.affiliate_id : 0
        c.user_name = "#{sender.first_name} #{sender.last_name}"
        c.save!
      elsif to_address.include?('discussion')
        # This is a new discussion post
        item = Discussion.new()
        item.name = params['subject']
        item.html = email_html.present? ? email_html : email_text
        item.user = sender
        item.affiliate_id = sender.affiliate.present? ? sender.affiliate_id : 0
        item.last_updated_by = sender.id
        item.attachment = attached[0] if(attached.length > 0)
        if !item.save
          ErrorMailer.delay.error_back_to_sender(from_address, "Delivery error: invalid content", params['subject'], "Your message contained an invalid or blank subject and/or content.")
        else
          ErrorMailer.delay.message_back_to_sender(from_address, "Your post has been added", params['subject'], item)
        end
      else
        # Check if this is an email to a group from an admin
        attached.each do |file|
          # Create new attachment thingy with file_method = FILE and then save!
        end
      end
    end



    render :json => { "message" => "OK" }, :status => 200
  end

  private
  def log_it(message,params)
    from = params['from'].present? ? params['from'] : 'unknown'
    to = params['to'].present? ? params['to'] : 'unknown'
    subject = params['subject'].present? ? params['subject'] : 'no subject'
    err = "#{message.upcase}: to #{to}, from #{from}, #{subject}"
    incoming_mail_log err
    return err
  end

end
