class DevelopersController < ApplicationController
  def index
  end
  def affiliate
  end
  def documentation
  end
  def examples
  end
  def wordpress
  end
  def admin_levels

  end

  # Function is used to setup a new wordpress system for a particular affiliate.  Note that 1 wordpress install is allowed per affiliate!
  def wordpress_sync
  end
  def wordpress_sync_2
    @next_url = URI.unescape(params[:return_url])
    return redirect_to "/" if current_affiliate.blank? || current_affiliate.id.blank?
    require 'open-uri'
    current_affiliate.create_shared_secret
    current_affiliate.update_column(:url, @next_url)
    js_hash = Rails.application.assets.find_asset('energyfolks.js').digest_path.split('-')[1].split('.')[0]
    css_hash = Rails.application.assets.find_asset('energyfolks.css').digest_path.split('-')[1].split('.')[0]
    response = open("#{@next_url}?enfolks_sync=#{current_affiliate.id}&secret=#{current_affiliate.shared_secret}&color=#{current_affiliate.color}&js_hash=#{js_hash}&css_hash=#{css_hash}").read
    return render :inline => "OOPS!  Something went wrong.  We were unable to communicate with your wordpress installation.  Please try again." unless (response == 'COMPLETE')
    current_affiliate.update_column(:wordpress_css_hash, css_hash)
    current_affiliate.update_column(:wordpress_js_hash, js_hash)
  end

  def update_check
    return redirect_to '/' unless request.env['HTTP_USER_AGENT'].include?('WordPress')
    ef_data = YAML::load(File.open("#{Rails.root}/public/wordpress/wordpress.yml"))
    output = {}
    current_affiliate.update_column(:wordpress_plugin_version, params[:version]) if current_affiliate.present? && current_affiliate.id.present?
    current_affiliate.update_column(:wordpress_version, params[:w_version]) if current_affiliate.present? && current_affiliate.id.present?
    if params[:r_action] == 'basic_check'
      ef_data['new_version'] = ef_data['version'] if params[:version].blank? || (params[:version].to_f < ef_data['version'].to_f)
      ef_data['package'] = "#{ef_data['package']}?aid=0#{params[:aid]}"
      output = ef_data
    elsif params[:r_action] == 'plugin_information'
      output = {
          :slug => ef_data['slug'],
          :version => ef_data['version'],
          :last_updated => ef_data['date'],
          :download_link => "#{ef_data['package']}?aid=0#{params[:aid]}",
          :author => ef_data['author'],
          :external => ef_data['external'],
          :requires => ef_data['requires'],
          :tested => ef_data['tested'],
          :homepage => ef_data['homepage'],
          :downloaded => ef_data['downloaded'],
          :sections => ef_data['sections']
      }
      output[:new_version] = ef_data['version'] if params[:version].blank? || (params[:version].to_f < ef_data['version'].to_f)
    end
    render :json => output
  end

  def wordpress_zip
    require 'zip'
    ef_data = YAML::load(File.open("#{Rails.root}/public/wordpress/wordpress.yml"))
    current_affiliate.update_column(:wordpress_checked_version, ef_data['version']) if current_affiliate.present? && current_affiliate.id.present?
    t = Tempfile.new("ef_wordpress_download-#{request.remote_ip}")
    # Give the path of the temp file to the zip outputstream, it won't try to open it as an archive.
        Zip::OutputStream.open(t.path) do |zos|
          Dir["#{Rails.root}/public/wordpress/plugin_source/*.*"].each do |file|
            # Create a new entry with some arbitrary name
            zos.put_next_entry(File.basename(file))
            # Add the contents of the file, don't read the stuff linewise if its binary, instead use direct IO
            zos.print IO.read(file)
          end
        end
    # End of the block  automatically closes the file.
    # Send it using the right mime type, with a download window and some nice file name.
        send_file t.path, :type => 'application/zip', :disposition => 'attachment', :filename => "energyfolks.zip"
    # The temp file will be deleted some time...
    t.close
  end
end
