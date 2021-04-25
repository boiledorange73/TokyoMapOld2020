// 2021-04-01 Added.
if(window.BO == null ) {
  window.BO = {};
}

/**
 * Tests whether the object is instance of HTMLElement.
 * @param obj Tested object.
 * @return Whether the object is instance of HTMLElement.
 */
function isHTMLElement(obj) {
  if( window.HTMLElement ) {
    return obj instanceof HTMLElement;
  }
  return (typeof obj === "object") &&
      (obj.nodeType === 1) &&
      (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
}

/**
 * Map App, including some maps, a console, some commands.
 * @param opts Options: layersettings, extent4326 (minlon,minlat,maxlon,maxlat), resources, submaps (0,1).
 */
BO.MapApp = function MapApp(e_main, opts) {
  // setup options
  opts = opts ? opts : {};
  this._layersettings = opts.layersettings ? opts.layersettings : [];
  this._libs = opts.libs ? opts.libs : [];
  // get main element
  if( isHTMLElement(e_main) ) {
    this._e_main = e_main;
  }
  else {
    this._e_main = document.getElementById(e_main);
  }
  this._extent4326 = opts.extent4326;
  this._resources = opts.resources;
  this._submaps = opts.submaps >= 1 ? 1 : 0;
  //
  // main
  this._e_main.className = "bo-map-singlemap";
  // chief map
  this._e_chiefmap = document.createElement("div");
  this._e_chiefmap.id = "CHIEFMAP";
  this._e_main.appendChild(this._e_chiefmap);
  this._chiefmap = new BO.ChiefMap(this._e_chiefmap, this._layersettings);
  // chiefmap.moveend
  this._chiefmap._lmap.on("moveend", function(_this){return function(e){_this.chiefmap_OnMoveEnd();};}(this));
  // 2021-04-01 Added: Submap
  // submap
  if( this._submaps >= 1 ) {
    var e_submap = document.createElement("div");
    e_submap.id = "SUBMAP";
    this._e_main.appendChild(e_submap);
    this._submap = new BO.Map(e_submap, this._layersettings, "sub");
    this._chiefmap.addChild(this._submap);
  }
  // console
  this._mapconsole = BO.MapApp.createMapConsole();
  this.initCommands();
  // initilizes lon,lat,zoom
  var lon = localStorage.getItem("lon");
  var lat = localStorage.getItem("lat");
  var zoom = localStorage.getItem("zoom");
  if( lon !== null && lat !== null && zoom !== null ) {
    this._chiefmap.setLonLatZoom(lon, lat, zoom);
  }
  else {
    if( this._extent4326 ) {
      this._chiefmap.fit(this._extent4326);
    }
  }
};


BO.MapApp.prototype.startMyLocation = function startMyLocation() {
  var chiefmap = this._chiefmap;
  if( this._latest_coords != null ) {
    chiefmap.setLonLatZoom(
      this._latest_coords.longitude,
      this._latest_coords.latitude
    );
  }
  else {
    navigator.geolocation.getCurrentPosition(
      function(_this){return function success(pos){
        if( pos != null && pos.coords != null ) {
          _this._chiefmap.propagatePutLocationMarker(pos.coords, 5000, true);
        }
      };}(this),
      function(_this){return function error(err){
        alert(_this._resources.get("locationerror") + "\n" + err.message);
        console.log(err);
      };}(this),
      {
        "maximumAge": 0,
        "timeout": 10000,
        "enableHighAccuracy": true,
      }
    );
  }
};

BO.MapApp.prototype.startGnss = function startGnss() {
  this._latest_coords = null;
  this._watch_id = navigator.geolocation.watchPosition(
    function(_this){return function success(pos) {
      if( pos != null && pos.coords != null ) {
        // 2021-04-01 Modified: putLocationMarker -> propagate
        _this._chiefmap.propagatePutLocationMarker(pos.coords, 0, false);
        _this._latest_coords = {};
        for(var k in pos.coords ) {
          _this._latest_coords[k] = pos.coords[k];
        }
      }
    };}(this),
    function(_this){return function error(err) {
      alert(_this._resources.get("locationerror") + "\n" + err.message);
      _this._mapconsole._buttonhash["gnss"].active(false);
    };}(this),
    {
      "maximumAge": 0,
      "timeout": 5000,
      "enableHighAccuracy": true,
    }
  );
};

BO.MapApp.prototype.stopGnss = function stopGnss() {
  if( this._watch_id !== null ) {
    navigator.geolocation.clearWatch(this._watch_id);
    // 2021-04-01 Modified: setupLocationTimeout -> propagate
    this._chiefmap.propagateSetupLocationTimeout(0);
    this._watch_id = null;
    this._latest_coords = null;
  }
};

BO.MapApp.prototype.showInfo = function showInfo() {
  var infocontent_html = "";
  var len = this._layersettings != null ? this._layersettings.length : 0;
  for( var n = 0; n < len; n++ ) {
    var ls = this._layersettings[n];
    var text = ls.text;
    var attr = ls.attribution ? ls.attribution.text : null;
    var site = ls.attribution ? ls.attribution.site : null;
    text = text ? text : "";
    attr = attr ? attr : "";
    infocontent_html = infocontent_html + "<p>" + text + " ";
    if( site ) {
      infocontent_html = infocontent_html + "<a target=\"_blank\" href=\""+site+"\">"+attr+"</a>";
    }
    else {
      infocontent_html = infocontent_html + attr;
    }
    infocontent_html = infocontent_html + "</p>\n";
  }

  this._info.show({
    "appname": BO.appName ? BO.appName : this._resources.get("app_name"),
    "appver" : BO.appVer,
    "libs": this._libs,
  });
  this._info.innerHTML(infocontent_html);
};

BO.MapApp.prototype.initCommands = function initCommands() {
  var watch_id = null;
  var latest_coords = null;
  var chiefmap = this._chiefmap;
  this._mapconsole.addCommandButton(null, "home",
    function(_this) { return function(e) {
      chiefmap.fit(_this._extent4326);
    };}(this)
  );
  this._mapconsole.addCommandButton(null, "mylocation",
    function(_this) { return function(e) {
      _this.startMyLocation();
    };}(this)
  );
  // 2021-04-01 Modified: storage enabled.
  this._mapconsole.addToggleButton(null, "gnss",
    function(_this) { return function(e) {
      localStorage.setItem("gnss", e ? "true":"false");
      if( e ) {
        _this.startGnss();
      }
      else {
        _this.stopGnss();
      }
    };}(this),
    localStorage.getItem("gnss") == "true"
  );
  // 2021-04-01 Added: initial index
  var dualmap_index_s = localStorage.getItem("dualmap");
  var dualmap_index = dualmap_index_s != null ? parseInt(dualmap_index_s) : -1;
  // 2021-04-01 Added: dualmapv/dualmaph (dividing map, horizontal)
  // 2021-04-01 Modified: initial index added.
  if( this._submaps >= 1 ) {
    this._mapconsole.addRevolvingButton(
      null,
      "dualmap",
      ["singlemap","dualmaph", "dualmapv"],
      function(_this){return function(e){
        localStorage.setItem("dualmap", e.index);
        // changes styles
        _this._e_main.className = "bo-map-"+(e.name);
        // refresh view area.
        if( _this._chiefmap._loaded ) {
          _this._chiefmap.propagateInvalidateSize();
        }
      };}(this),
      dualmap_index
    );
  }
  else {
    this._e_main.className = "bo-map-singlemap";
  }
  // 2021-04-01 Added: cross (center cross)
  // 2021-04-01 Modified: storage enabled.
  this._mapconsole.addToggleButton(null, "cross",
    function(_this){return function(e){
      localStorage.setItem("centercross", e ? "true":"false");
      _this._chiefmap.centerCrossVisible(e);
      if( _this._submap ) {
        _this._submap.centerCrossVisible(e);
      }
      // refresh view area.
      if( _this._chiefmap._loaded ) {
        _this._chiefmap.propagateInvalidateSize();
      }
    };}(this),
    localStorage.getItem("centercross") == "true"
  );
  // 2020-03-30 Added: info window.
  // 2020-04-03 Modified: "," after 2nd arg removed.
  this._info = new BO.Info(
    document.getElementById("MAPINFO-ROOT"),
    this._resources.get("dismiss")
  );
  // 2021-04-01 Added: layersettings.
  // 2021-04-01 Added.
  this._info.onHide(function(_this) {return function() {
    if( _this._mapconsole._buttonhash["info"] ) {
      _this._mapconsole._buttonhash["info"].active(false);
    }
  };}(this));
  // 2021-04-01 Modified: Command -> Toggle
  this._mapconsole.addToggleButton(null, "info",
    function(_this){return function(e){
      if( e ) {
        _this.showInfo();
      }
      else {
        if( _this._info.isVisible() ) {
          _this._info.hide();
        }
      }
    };}(this)
  );
};

/**
 * Creates command buttons holder.
 */
BO.MapApp.createMapConsole = function createMapConsole() {
  var e_root = document.getElementById("MAPCONSOLE-ROOT");
  var e_console = document.createElement("div");
  e_console.id = "MAPCONSOLE";
  e_root.appendChild(e_console);
  var e_main = document.createElement("div");
  e_main.id = "MAPCONSOLE-MAIN";
  e_console.appendChild(e_main);
  var e_button = document.createElement("div");
  e_button.id = "MAPCONSOLE-BUTTON";
  e_root.appendChild(e_button);
  var ret = new BO.MapConsole(e_console, e_main, e_button);
  return ret;
}

/**
 * Called when motion of chiefmap ended.
 */
BO.MapApp.prototype.chiefmap_OnMoveEnd = function chiefmap_OnMoveEnd() {
  var llc = this._chiefmap._lmap.getCenter();
  var lon = llc.lng;
  var lat = llc.lat;
  var zoom = this._chiefmap._lmap.getZoom();
  localStorage.setItem("lon", lon);
  localStorage.setItem("lat", lat);
  localStorage.setItem("zoom", zoom);
  return this;
}
