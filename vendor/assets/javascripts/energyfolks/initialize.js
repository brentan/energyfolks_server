// Establish our namespace
var EnergyFolks = {};

// Move our loaded jquery version in to the namespace, and restore jQuery for the app if app is using its own version
EnergyFolks.$ = jQuery.noConflict(true);

//Initialize EnergyFolks constants
EnergyFolks.server_url = 'http://dev.energyfolks.com:3000';
EnergyFolks.id = 0;
EnergyFolks.color = '444444';
EnergyFolks.user_logged_in = false;
EnergyFolks.current_user = {id: 0, super_admin: false, admin: [], affiliates: []};
//Used by iframes to keep track of the parent URL
EnergyFolks.parent_url = '';
//Accounts constants:
EnergyFolks.callbackURL = '';
EnergyFolks.forwardto = '';
EnergyFolks.customMenuItems = new Array();
EnergyFolks.TopBarFixed = true;
EnergyFolks.checkCookies = true;
//data-display constants:
EnergyFolks.source = 'events';
EnergyFolks.format = 'list';
EnergyFolks.data_start = 0; //inclusive
EnergyFolks.data_end = 20; //exclusive
EnergyFolks.per_page = 20;
EnergyFolks.data_limits = 'order';
EnergyFolks.data = [];
EnergyFolks.get_moderated = false;

//Initialize the Objects array
EnergyFolks.objects = [];

//Set admin levels
EnergyFolks.ADMIN = 4;
EnergyFolks.EDITOR = 3;
EnergyFolks.AUTHOR = 2;
EnergyFolks.CONTRIBUTOR = 1;
EnergyFolks.NO_RIGHTS = 0;
