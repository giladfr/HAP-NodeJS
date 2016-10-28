var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



var SimpleXBMC=require('simple-xbmc');
 
var xbmc = new SimpleXBMC('osmc.local',9090);
 
// here's a fake hardware device that we'll expose to HomeKit
var kodi_remote = {
  is_playing: false,
  
  setPlayback: function(on) {
    if (on)
    {
      console.log("playing kodi");
      xbmc.player.playPause({playerid: 1}, function(responce){
        console.log(responce);
      });
      kodi_remote.is_playing = true;
    } 
    else
    {
      console.log("pausing kodi");
      xbmc.player.playPause({playerid: 1}, function(responce){
        console.log(responce);
      });
      kodi_remote.is_playing = false;
    }
  },
  identify: function() {
    console.log("Identify the kodi remote");
  }
}

var kodiUUID = uuid.generate('hap-nodejs:accessories:kodi');
var kodi = exports.accessory = new Accessory('Kodi', kodiUUID);

kodi.username = "1A:2B:3C:4D:5E:FF";
kodi.pincode = "123-45-678";

kodi
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Kodi Remote")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
kodi.on('identify', function(paired, callback) {
  kodi_remote.identify();
  callback(); // success
});

kodi
  .addService(Service.Lightbulb, "Media Player") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    kodi_remote.setPlayback(value);
    callback(); 
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
kodi
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
        
    var err = null; // in case there were any problems
    
    if (kodi_remote.is_playing) {
      console.log("Are we playing? yes");
      callback(err, true);
    }
    else {
      console.log("Are we playing? No.");
      callback(err, false);
    }
  });

