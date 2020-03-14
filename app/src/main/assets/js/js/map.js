if( window.BO == null ) {
  window.BO = {};
}

/**
 * Map class
 * @param target Target element/id.
 * @param layersettings Layer settings.
 * @param prefix prefix for keys of localStorage.
 */
BO.Map = function(target, layersettings, prefix) {
  if( target == null ) {
    return;
  }
  this._timeout_id = null;
  this._prefix = prefix;
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
  // element target/wrap
  this._e_wrap = document.createElement("div");
  // MEMO: Android 4.x standard browser does not support Object.assign()
  this._e_wrap.style.position = "absolute";
  this._e_wrap.style.width = "100%";
  this._e_wrap.style.height = "100%";
  this._e_target.appendChild(this._e_wrap);
  // element target/wrap/main
  this._e_main = document.createElement("div");
  this._e_main.style.position = "absolute";
  this._e_main.style.width = "100%";
  this._e_main.style.height = "100%";
  this._e_wrap.appendChild(this._e_main);
  // layers
  this._layers = [];
  // creates layers
  var ollayers = [];
  var len = layersettings != null ? layersettings.length : 0;
  for( var n = 0; n < len; n++ ) {
    var ls = layersettings[n];
    var at = null;
    if( ls.attribution != null ) {
      at = ls.attribution.text;
      if( ls.attribution.site != null ) {
        at = "<a target=\"_blank\" href=\""+ls.attribution.site+"\">"+at+"</a>";
      }
    }
    var ollayer = new ol.layer.Tile({
      "source": new ol.source.XYZ({
        "url": ls.url,
        "attributions": at,
      }),
    });
    ollayers.push(ollayer);
    this._layers.push({"id": ls.id, "text": ls.text, "ollayer": ollayer});
  }
  // lcation layer
  this._ollocationlayer = new ol.layer.Vector({"source": new ol.source.Vector()});
  ollayers.push(this._ollocationlayer);
  //
  var layercontrol = new BO.LayerControl({"layers": this._layers})
  this._layercontrol = layercontrol;
  var controls = [
    new ol.control.Attribution(),
    layercontrol,
  ];
  // creates map
  this._olmap = new ol.Map({
    "target": this._e_main,
    "layers": ollayers,
    "interactions": ol.interaction.defaults({
      "altShiftDragRotate": false,
      "pinchRotate": false,
    }),
    "controls": ol.control.defaults().extend(controls),
  });
  // layercontrol
  this._layercontrol.on(
    "change",
    function(_this){
      return function(e) {
        _this.onChangeMap(e);
      };
    }(this)
  );
  var id = localStorage.getItem(this._prefix+"_id");
  if( id != null ) {
    this._layercontrol.activeLayerId(id);
  }
  // initializes
  setTimeout(function() {
   layercontrol.onChange();
  }, 0);
};

// CONSTANTS
BO.Map.STYLE_PIN = new ol.style.Style({
  "image": new ol.style.Circle({
    "radius": 8,
    "stroke": new ol.style.Stroke({
      "width": 1,
      "color": "rgba(0,204,0,1)"
    }),
    "fill": new ol.style.Fill({
      "color": "rgba(0,255,0,1)"
    })
  })
});

BO.Map.STYLE_CIRCLE = new ol.style.Style({
  "stroke": new ol.style.Stroke({
    "width": 1,
    "color": "rgba(0,255,0,0.5)"
  }),
  "fill": new ol.style.Fill({
    "color": "rgba(0,255,0,0.125)"
  })
});

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
        _this._ollocationlayer.getSource().clear();
        _this._timeout_id = null;
      }
    };
  }(this);
  var timeout_id = setTimeout(fn, lifems);
  this._timeout_id = timeout_id;
};

/**
 * Puts the marker at specfied location.
 * @param pos_coords coordinates data including latitude, longitude, accuracy.
 * @param lifems Life time (milliseconds) for markers.
 * @param moveto If true, the map moves to the location that pos_coords presents.
 */
BO.Map.prototype.putLocation = function(pos_coords, lifems, moveto) {
  var coord4326 = [pos_coords.longitude, pos_coords.latitude];
  var coord = ol.proj.transform(coord4326, "EPSG:4326", this._olmap.getView().getProjection());
  var accuracy4326 = ol.geom.Polygon.circular(coord4326, pos_coords.accuracy);
  var accuracy = accuracy4326.transform("EPSG:4326", this._olmap.getView().getProjection().getCode());
  var source = this._ollocationlayer.getSource();
  source.clear(true);
  var featCircle = new ol.Feature(accuracy);
  featCircle.setStyle(BO.Map.STYLE_CIRCLE);
  var featPin = new ol.Feature(new ol.geom.Point(coord));
  featPin.setStyle(BO.Map.STYLE_PIN);
  source.addFeatures([featCircle, featPin]);
  if( moveto ) {
    this._olmap.getView().setCenter(coord);
  }
  if( lifems > 0 ) {
    this.setupLocationTimeout(lifems);
  }
};

/**
 * Called when map (layer) changed.
 */
BO.Map.prototype.onChangeMap = function(e) {
  var id = this._layercontrol.activeLayerId();
  localStorage.setItem(this._prefix+"_id", id);
};

/**
 * Sets the location of the view.
 * @param lon Longitude.
 * @param lat Latitude.
 */
BO.Map.prototype.setLonLat = function(lon, lat, zoom) {
  var view = this._olmap.getView();
  view.setCenter(ol.proj.fromLonLat([lon, lat]));
};

/**
 * Sets the location and zoom level of the view.
 * @param lon Longitude.
 * @param lat Latitude.
 * @param zoom Zoom level.
 */
BO.Map.prototype.setLonLatZoom = function(lon, lat, zoom) {
  var view = this._olmap.getView();
  view.setCenter(ol.proj.fromLonLat([lon, lat]));
  view.setZoom(zoom);
};

/**
 * Fits the map extent with specified extent.
 * @param llextent [minlon,minlat,maxlon,maxlat].
 */
BO.Map.prototype.fitLonLatExtent = function(llextent) {
  var view = this._olmap.getView();
  var extent = ol.proj.transformExtent(llextent, 'EPSG:4326', view.getProjection());
  view.fit(extent);
  var zoom = view.getZoom();
  view.setZoom(parseInt(zoom));
};

/**
 * Sets/Gets the ID of the active layer.
 */
BO.Map.prototype.activeLayer = function(id) {
  if( arguments != null && arguments.length > 0 ) {
    var len = this._layers.length;
    this._activelayer = null;
    for( var n = 0; n < len; n++ ) {
      var layer = this._layers[n];
      if( this._layers[n].id == id ) {
        this._activelayer = layer.ollayer;
        layer.ollayer.setVisible(true);
      }
      else {
        layer.ollayer.setVisible(false);
      }
    }
    return this;
  }
  else {
    return this._activelayer;
  }
};

/**
 * Chief map class. This has most priority if 2 or more maps available.
 * @param target Target element/id.
 * @param layersettings Layer settings.
 * @param prefix prefix for keys of localStorage.
 */
BO.ChiefMap = function(target, layersettings, prefix) {
  BO.Map.call(this, target, layersettings, prefix);
  this._maps = [];
  this._olmap.on("moveend", function(_this){return function(e) {_this.onMoveEnd(e);};}(this));
}
BO.ChiefMap.prototype = new BO.Map();

/**
 * Called when map motion finished. Writes current location and zoom into the local storage.
 */
BO.ChiefMap.prototype.onMoveEnd = function(e) {
  var map = e.map;
  var view = map.getView();
  var uc = view.getCenter();
  var llc = ol.proj.toLonLat(view.getCenter());
  var zoom = view.getZoom();
  localStorage.setItem("lon", llc[0]);
  localStorage.setItem("lat", llc[1]);
  localStorage.setItem("zoom", zoom);
};

/**
 * Adds a child map.
 */
BO.ChiefMap.prototype.addMap = function(map) {
  this._maps.push(map);
};

