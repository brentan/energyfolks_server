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

  def update_check
    return redirect_to '/' unless request.env['HTTP_USER_AGENT'].include?('WordPress')
    require 'php_serialize'
    info = PHP.unserialize(params[:request])
    # TODO: read params[:?] for 'update_check', then info 'slug' to make sure its energyfolks.  Also check user-agent.  Copy from wordpress for output!
    ef_data = YAML::load(File.open("#{Rails.root}/public/wordpress/wordpress.yml"))

    output = ''
    if params[:r_action] == 'basic_check'
      ef_data['new_version'] = ef_data['version'] if info['version'].blank? || (info['version'].to_f < ef_data['version'].to_f)
      output = PHP.serialize(ef_data)
    elsif params[:r_action] == 'plugin_information'
      output = PHP.serialize({
          :slug => ef_data['slug'],
          :version => ef_data['version'],
          :last_updated => ef_data['date'],
          :download_link => ef_data['package'],
          :author => ef_data['author'],
          :external => ef_data['external'],
          :requires => ef_data['requires'],
          :tested => ef_data['tested'],
          :homepage => ef_data['homepage'],
          :downloaded => ef_data['downloaded'],
          :sections => ef_data['sections']
                             })
    end

    render :inline => output
  end

  def wordpress_zip
    require 'zip'

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
