if( window.BO == null ) {
  window.BO = {};
}

BO.Map = function Map(target, ls, prefix) {
  if( target == null ) {
    return;
  }
  // element target
  var e_target = null;
  if( (typeof target==="object") ) {
    e_target = target;
  }
  else {
    e_target = document.getElementById(target);
  }
  if( e_target == null ) {
    return;
  }
  this._e_target = e_target;
  // prefix
  this._prefix = prefix;
  // layers, baseBaps
  this._layers = BO.Map.createLayerList(ls);
  // map
  this._lmap = L.map(this._e_target);
  // layercontrol
  this._bolayercontrol = BO.generateLayerControl(BO.Map.createLayerControlLayers(ls, this._layers)).addTo(this._lmap);
  //
  this._lmap.on("baselayerchange", function(_this){return function(e) {_this.onChangeMap(e);};}(this));
  // initial id
  var initial_id = localStorage.getItem(this._prefix+"_id");
  if( initial_id != null ) {
    this.activeLayerId(initial_id);
  }
};

BO.Map.createLayer = function createLayer(ls) {
  var lopts = {};
  // attribution
  var at = null;
  if( ls.attribution != null ) {
    lopts.attribution = ls.attribution.text;
    if( ls.attribution.site != null ) {
      lopts.attribution = "<a target=\"_blank\" href=\""+ls.attribution.site+"\">"+lopts.attribution+"</a>";
    }
  }
  // maxZoom, minZoom
  if( ls.maxZoom !== null && typeof ls.maxZoom !== "undefined" ) {
    lopts.maxZoom = ls.maxZoom;
  }
  if( ls.minZoom !== null && typeof ls.minZoom !== "undefined" ) {
    lopts.minZoom = ls.minZoom;
  }
  if( ls.id !== null && typeof ls.id !== "undefined" ) {
    lopts.id = ls.id;
  }
  //
  return L.tileLayer(ls.url, lopts);
};

BO.Map.createLayerList = function createLayerList(lss) {
  var len = lss != null ? lss.length: 0;
  var layers = [];
  for(var n = 0; n < len; n++ ) {
    layers.push(BO.Map.createLayer(lss[n]));
  }
  return layers;
}

BO.Map.createLayerControlLayers = function createLayerControlLayers(lss, layers) {
  var len = lss != null ? lss.length: 0;
  var ret = [];
  for(var n = 0; n < len; n++ ) {
    ret[n] = {
      "id": lss[n].id,
      "layer": layers[n],
      "text": lss[n].text,
    };
  }
  return ret;
};

BO.Map.createBaseMaps = function createBaseMaps(lss, layers) {
  var len = lss != null ? lss.length: 0;
  var hash = {};
  for(var n = 0; n < len; n++ ) {
    hash[lss[n].text] = layers[n];
  }
  return hash;
}

BO.Map.prototype.setLonLatZoom = function setLonLatZoom(lon, lat, zoom) {
  this._lmap.setView([lat, lon], zoom);
};

BO.Map.prototype.fit = function fit(extent) {
  this._lmap.fitBounds([
    [extent[1],extent[0]],
    [extent[3],extent[2]],
  ]);
};

BO.Map.prototype.activeLayerId = function(id) {
  if( arguments != null && arguments.length > 0 ) {
    this._bolayercontrol.activeLayerId(id);
    return this;
  }
  else {
    return this._bolayercontrol.activeLayerId();
  }
};

//
// Location
//

/**
 * Puts the marker at specfied location.
 * @param pos_coords coordinates data including latitude, longitude, accuracy.
 * @param lifems Life time (milliseconds) for markers.
 * @param moveto If true, the map moves to the location that pos_coords presents.
 */
BO.Map.prototype.putLocationMarker = function putLocationMarker(pos_coords, lifems, moveto) {
  var latlng = [pos_coords.latitude, pos_coords.longitude]
  this.clearLocationMarker();
  this._circles =  [
    L.circle(
      latlng,
      {
        "stroke": false,
        "fillColor": "#0F0",
        "fillOpacity": 0.125,
        "radius":  pos_coords.accuracy,
      }
    ).addTo(this._lmap),
    L.circle(
      latlng,
      {
        "stroke": true,
        "weight": 1,
        "color": "#0C0",
        "radius":  pos_coords.accuracy,
      }
    ).addTo(this._lmap),
  ];
  this._markers = [
    L.circleMarker(
      latlng,
      {
        "weight": 1,
        "color": "#090",
        "fillColor": "#FFF",
        "fillOpacity": 1,
        "radius": 12,
      }
    ).addTo(this._lmap),
    L.circleMarker(
      latlng,
      {
        "weight": 2,
        "color": "#090",
        "fillColor": "#0C0",
        "fillOpacity": 1,
        "radius": 8,
      }
    ).addTo(this._lmap),
  ];
  if( moveto ) {
    this.setLonLatZoom(pos_coords.longitude, pos_coords.latitude);
  }
  if( lifems > 0 ) {
    this.setupLocationTimeout(lifems);
  }
};

BO.Map.prototype.clearLocationMarker = function clearLocationMarkler() {
  var len = this._circles != null ? this._circles.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._circles[n].remove();
    this._circles[n] = null;
  }
  this._circles = null;
  var len = this._markers != null ? this._markers.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._markers[n].remove();
    this._markers[n] = null;
  }
  this._markers = null;
};

/**
 * Calls setTimeout() to clear all markers after specified time.
 * @param lifems Life time (milliseconds).
 */
BO.Map.prototype.setupLocationTimeout = function(lifems) {
  if( this._timeout_id !== null ) {
    clearTimeout(this._timeout_id);
    this._timeout_id = null;
  }
  var fn = function(_this) {
    return function() {
      if( _this._timeout_id !== null && _this._timeout_id === timeout_id ) {
        _this.clearLocationMarker();
        _this._timeout_id = null;
      }
    };
  }(this);
  var timeout_id = setTimeout(fn, lifems);
  this._timeout_id = timeout_id;
};


/**
 * Called when map (layer) changed.
 */
BO.Map.prototype.onChangeMap = function(e) {
  var id = this.activeLayerId();
  localStorage.setItem(this._prefix+"_id", id);
};



//
//
//
BO.ChiefMap = function ChiefMap(target, ls) {
  BO.Map.call(this, target, ls, "chief");
  this._lmap.on("moveend", function(_this){return function(e) {_this.onMoveEnd(e);};}(this));
};

BO.ChiefMap.prototype = new BO.Map();

BO.ChiefMap.prototype.onMoveEnd = function(e) {
  var map = e.target;
  var llc = map.getCenter();
  var zoom = map.getZoom();
  localStorage.setItem("lon", llc.lng);
  localStorage.setItem("lat", llc.lat);
  localStorage.setItem("zoom", zoom);
};


