// Establish our namespace
var EnergyFolks = {};

// Move our loaded jquery version in to the namespace, and restore jQuery for the app if app is using its own version
EnergyFolks.$ = jQuery.noConflict(true);

//Initialize EnergyFolks constants
EnergyFolks.server_url = 'http://dev.energyfolks.com:3000';
EnergyFolks.id = 0;
EnergyFolks.color = '444444';
//Accounts constants:
EnergyFolks.callbackURL='';
EnergyFolks.forwardto='';
EnergyFolks.customMenuItems=new Array();
EnergyFolks.TopBarFixed=true;

//Initialize the Objects array
EnergyFolks.objects = [];
