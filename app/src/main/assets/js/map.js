if( window.BO == null ) {
  window.BO = {};
}

/**
 * Map constructor.
 * @param ls Array of layer settings. [{id,text,attribution,url,maxZoom},...]
 * @param prefix Prefix of the key for localStorage.
 * @param opts Options
 */
BO.Map = function Map(target, ls, prefix, opts) {
  if( target == null ) {
    return;
  }
  this.className = "Map";
  if( opts == null ) {
    opts = {};
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
  this._e_map = document.createElement("div");
  this._e_map.className = "bo-map";
  this._e_target.appendChild(this._e_map);
  this._e_layerswitcher = document.createElement("div");
  this._e_layerswitcher.className = "bo-layerswitcher-root";
  this._e_target.appendChild(this._e_layerswitcher);

  // prefix
  this._prefix = prefix;
  // layers, baseBaps
  this._layers = BO.Map.createLayerList(ls);
  // map
  this._lmap = L.map(this._e_map);
  // layercontrol
  this._bolayercontrol = new BO.LayerSwitcher(
    this._e_layerswitcher,
    BO.Map.createLayerControlLayers(ls, this._layers),
    {"map": this._lmap}
  );
  // baselayer
  this._lmap.on("baselayerchange", function(_this){return function(e) {_this.onChangeMap(e);};}(this));
  // 2021-04-01 Modified: handler
  // movestart, moveend, move
  this._lmap.on("movestart", function(_this){return function(e) {_this.requestMoveStart(_this);};}(this));
  this._lmap.on("moveend", function(_this){return function(e) {_this.onMoveEnd();};}(this));
  this._lmap.on("move", function(_this){return function(e) {_this.onMove();};}(this));
  // 2021-04-01 Added: onload
  // onload
  this._lmap.on("load", function(_this){return function(e) {_this.onLoad(_this);};}(this));
  // 2021-04-01 Added: center cross
  this._centercross = (new BO.Layer.CenterCross()).addTo(this._lmap);
  
  // 2021-04-01 Modified: try to get initial_id if initial_id not stored.
  // initial id
  var initial_id = localStorage.getItem(this._prefix+"_id");
  if( initial_id == null ) {
    initial_id = this._bolayercontrol.activeLayerId();
  }
  if( initial_id != null ) {
    this.activeLayerId(initial_id);
  }
  // other props
  this._loaded = false;
  this._parent = null;
  this._children = [];
  this._starting = null;
};

/**
 * Creates L.Layer instrnce.
 * @param ls Layer settings. {id,text,attribution,url,maxZoom}
 */
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
  // maxZoom, minZoom, maxNativeZoom
  if( ls.maxZoom !== null && typeof ls.maxZoom !== "undefined" ) {
    lopts.maxZoom = ls.maxZoom;
  }
  if( ls.minZoom !== null && typeof ls.minZoom !== "undefined" ) {
    lopts.minZoom = ls.minZoom;
  }
  /* 2021-08-05 Added: supports maxNativeZoom */
  if( ls.maxNativeZoom !== null && typeof ls.maxNativeZoom !== "undefined" ) {
    lopts.maxNativeZoom = ls.maxNativeZoom;
  }
  if( ls.id !== null && typeof ls.id !== "undefined" ) {
    lopts.id = ls.id;
  }
  //
  return L.tileLayer(ls.url, lopts);
};

/**
 * (STATIC) Creates Array of L.Layer instances.
 * @param lss Array of layer settings. {id,text,attribution,url,maxZoom}
 * @return Array of L.Layer instances.
 */
BO.Map.createLayerList = function createLayerList(lss) {
  var len = lss != null ? lss.length: 0;
  var layers = [];
  for(var n = 0; n < len; n++ ) {
    layers.push(BO.Map.createLayer(lss[n]));
  }
  return layers;
}

/**
 * (STATIC) Creates Array of L.Layer instances.
 * @param lss Array of layer settings. {id,text,attribution,url,maxZoom}
 * @return Array of L.Layer instances.
 */
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

/**
 * (STATIC) Creates hash of base maps from array of L.Layer instances.
 * @param lss Array of layer settings. {text}
 * @param layers
 * @return Hash of L.Layer instances.
 */
BO.Map.createBaseMaps = function createBaseMaps(lss, layers) {
  var len = lss != null ? lss.length: 0;
  var hash = {};
  for(var n = 0; n < len; n++ ) {
    hash[lss[n].text] = layers[n];
  }
  return hash;
}

// 2021-04-01 Added
/**
 * Gets/Sets whether BO.Layer.CenterCross layer is visible.
 */
BO.Map.prototype.centerCrossVisible = function centerCrossVisible(value) {
  if( arguments == null || !(arguments.length > 0) ) {
    return this._centercross.visible();
  }
  else {
    this._centercross.visible(value);
    return this;
  }
};

/**
 * Gets/Sets ID of the active layer.
 */
BO.Map.prototype.activeLayerId = function(id) {
  if( arguments != null && arguments.length > 0 ) {
    this._bolayercontrol.activeLayerId(id);
    return this;
  }
  else {
    return this._bolayercontrol.activeLayerId();
  }
};

/**
 * Sets longitude, latitude and zoom level of the map.
 * @param lon Longitude.
 * @param lat Latitude.
 * @param zoom Zoom.
 * @return this.
 */
BO.Map.prototype.setLonLatZoom = function setLonLatZoom(lon, lat, zoom) {
  this._lmap.setView([lat, lon], zoom,{"animate": false});
  return this;
};

/**
 * Fits the map to specified extent.
 * @param extent [minx, miny, maxx, maxy].
 * @return this.
 */
BO.Map.prototype.fit = function fit(extent) {
  this._lmap.fitBounds([
    [extent[1],extent[0]],
    [extent[3],extent[2]],
  ]);
  return this;
};

// 2021-04-01 Added
/**
 * Copies location and zoom from specified source map.
 * @param src Source map.
 * @return this.
 */
BO.Map.prototype.copyLocationFrom = function copyLocationFrom(src) {
  var llc = src._lmap.getCenter();
  var zoom = src._lmap.getZoom();
  var lon = llc.lng;
  var lat = llc.lat;
  this.setLonLatZoom(lon, lat, zoom, true);
  return this;
};

// --------------------------------
// Move event handler
// --------------------------------
// 2021-04-01 Added
/**
 * Requests MoveStart event handling to the parent. If the root map, calls propagateMoveStart().
 * @param map The requesting map.
 * @return this.
 */
BO.Map.prototype.requestMoveStart = function requestMoveStart(map) {
  if( this._starting == null && this._loaded == true ) {
    if( this._parent ) {
      this._parent.requestMoveStart(map);
    }
    else {
      this.propagateMoveStart(map);
    }
  }
  return this;
};

/**
 * Propagates MoveStart event. Sets this._starting by triggerer.
 * @param triggerer Triggering map.
 * @return this.
 */
BO.Map.prototype.propagateMoveStart = function propagateMoveStart(triggerer) {
  this._starting = triggerer;
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateMoveStart(triggerer);
  }
  return this;
};

/**
 * MoveEnd event handler. If this is this._starting, calls requestMoveEnd().
 * @param triggerer Triggering map.
 * @return this.
 */
BO.Map.prototype.onMoveEnd = function onMoveEnd() {
  if( this._starting == this && this._loaded == true ) {
    this.requestMoveEnd();
  }
  return this;
};

/**
 * Requests MoveEnd event handling to the parent. If the root map, calls propagateMoveEnd().
 * @param map The requesting map.
 * @return this.
 */
BO.Map.prototype.requestMoveEnd = function requestMoveEnd() {
  if( this._parent ) {
    this._parent.requestMoveEnd();
  }
  else {
    this.propagateMoveEnd();
  }
  return this;
};

/**
 * Propagates MoveEnd event. Clears this._starting.
 * @return this.
 */
BO.Map.prototype.propagateMoveEnd = function propagateMoveEnd() {
  this._starting = null;
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateMoveEnd();
  }
  return this;
};

/**
 * Move event handler. If this is this._starting, calls requestMove().
 * @return this.
 */
BO.Map.prototype.onMove = function onMove() {
  if( this._starting == this && this._loaded == true ) {
    this.requestMove();
  }
  return this;
};

/**
 * Requests Move event handling to the parent. If the root map, calls propagateMove().
 * @return this.
 */
BO.Map.prototype.requestMove = function requestMove() {
  if( this._loaded == true ) {
    if( this._parent ) {
      this._parent.requestMove();
    }
    else {
      this.propagateMove(this._starting);
    }
  }
  return this;
};

/**
 * Propagates Move event. Copies location and zoom of triggerer to this.
 * @param triggerer Source map.
 * @return this.
 */
BO.Map.prototype.propagateMove = function propagateMove(triggerer) {
  if( this != triggerer ) {
    this.copyLocationFrom(triggerer);
  }
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateMove(triggerer);
  }
  return this;
}

/**
 * Load event handler. Calls requestLoad().
 * @return this.
 */
BO.Map.prototype.onLoad = function onLoad() {
  // onLoad called only after setView called.
  this._loaded = true;
  this.requestLoad(this);
  return this;
};

/**
 * Requests Load event handling to the parent. If the root map, calls propagateLoad().
 * @return this.
 */
BO.Map.prototype.requestLoad = function requestLoad() {
  if( this._parent != null ) {
    return this._parent.requestLoad();
  }
  else {
    if( this._loaded ) {
      this.propagateLoad(this);
    }
  }
  return this;
};

/**
 * Propagates Load event. Copies location and zoom of root to this.
 * @param root Source map.
 * @return this.
 */
BO.Map.prototype.propagateLoad = function propagateLoad(root) {
  this.copyLocationFrom(root);
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateLoad(root);
  }
  return this;
};

/**
 * Propagates to invalidate the size.
 * @return this.
 */
BO.Map.prototype.propagateInvalidateSize = function propagateInvalidateSize() {
  this._lmap.invalidateSize();
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateInvalidateSize();
  }
  return this;
};

/**
 * Sets/Gets parentmap.
 */
BO.Map.prototype.parent = function parent(map) {
  if( arguments == null || !(arguments.length >0) ) {
    return this._parent;
  }
  else {
    this._parent = map;
    return this;
  }
}

/**
 * Gets the root map.
 */
BO.Map.prototype.getRoot = function getRoot() {
  var ptr = this;
  while( ptr._parent != null ) {
    ptr = ptr._parent;
  }
  return ptr;
};

/**
 * Adds a child map.
 * @param child Added child.
 } @return this.
 */
BO.Map.prototype.addChild = function addChild(child) {
  this._children.push(child);
  child.parent(this);
  return this;
}

// --------------------------------
// Location
// --------------------------------
// 2021-04-01 Added.
/**
 * Propagates to put the marker at specified location.
 * @param pos_coords coordinates data including latitude, longitude, accuracy.
 * @param lifems Life time (milliseconds) for markers.
 * @param moveto If true, the map moves to the location that pos_coords presents.
 * @return this.
 */
BO.Map.prototype.propagatePutLocationMarker = function propagatePutLocationMarker(pos_coords, lifems, moveto) {
  this.putLocationMarker(pos_coords, lifems, moveto);
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagatePutLocationMarker(pos_coords, lifems, moveto);
  }
  return this;
};

/**
 * Puts the marker at specfied location.
 * @param pos_coords coordinates data including latitude, longitude, accuracy.
 * @param lifems Life time (milliseconds) for markers.
 * @param moveto If true, the map moves to the location that pos_coords presents.
 * @return this.
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
  return this;
};

/**
 * Clears the available marker.
 * @return this.
 */
BO.Map.prototype.clearLocationMarker = function clearLocationMarker() {
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
  return this;
};

// 2021-04-01 Added.
/**
 * Propagates to call setTimeout() to clear all markers after specified time.
 * @param lifems Life time (milliseconds).
 * @return this.
 */
BO.Map.prototype.propagateSetupLocationTimeout = function propagateSetupLocationTimeout(lifems) {
  this.setupLocationTimeout(lifems);
  var len = this._children ? this._children.length : 0;
  for( var n = 0; n < len; n++ ) {
    this._children[n].propagateSetupLocationTimeout(lifems);
  }
 return this;
};

/**
 * Calls setTimeout() to clear all markers after specified time.
 * @param lifems Life time (milliseconds).
 * @return this.
 */
BO.Map.prototype.setupLocationTimeout = function setupLocationTimeout(lifems) {
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
  return this;
};


/**
 * Called when map (layer) changed.
 */
BO.Map.prototype.onChangeMap = function(e) {
  var id = this.activeLayerId();
  localStorage.setItem(this._prefix+"_id", id);
};

// --------------------------------
// Chief Map
// --------------------------------
/**
 * Chief map, Used for the main map which has some submaps.
 * Once there were defferences chief map and others.
 * Now there is no defference excepting that prefix ("chief") and className ("ChiefMap) are fixed.
 * @param target Target DOM or ID.
 * @param ls Layer settings.
 */
BO.ChiefMap = function ChiefMap(target, ls) {
  BO.Map.call(this, target, ls, "chief");
  this.className = "ChiefMap";
};

BO.ChiefMap.prototype = new BO.Map();

