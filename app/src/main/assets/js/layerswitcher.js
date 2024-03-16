if( window.BO == null ) {
  window.BO = {};
}
/* 2021-04-01 Added: from layercontrol.js */
/**
 * Creates the layer control.
 * @param layers [{"id" (unique id), "layer" (L.Layer instance), "text" (display text")},...]
 * @param options Options. "display" - CSS display of bo-layer-control-root
 */
BO.LayerSwitcher = function LayerSwitcher(target, layers, options) {
  if( target == null ) {
    return;
  }
  this.className = "LayerSwitcher";
  if( options == null ) {
    options = {};
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
  this._layers = layers ? layers : [];
  this.map(options.map);
  //
  this._e_root = L.DomUtil.create("div", "bo-layercontrol-root");
  this._e_target.appendChild(this._e_root);
  // toggle
  this._e_labelwrap = L.DomUtil.create("div", "bo-layercontrol-labelwrap", this._e_root);
  this._e_label = L.DomUtil.create("div", "bo-layercontrol-label", this._e_labelwrap);
  this._e_labelswitch = L.DomUtil.create("div", "bo-layercontrol-labelswitch", this._e_labelwrap);
  // MEMO: svg.className cannot be set.
  this._svg_tup = BO.createInlineSvg(BO.icons["tup"]);
  this._svg_tdown = BO.createInlineSvg(BO.icons["tdown"]);
  this._e_labelswitch.appendChild(this._svg_tup);
  this._e_labelswitch.appendChild(this._svg_tdown);
  this._e_list = L.DomUtil.create("ul", "bo-layercontrol-list", this._e_root);
  // options.display
  if( options.display ) {
    this._e_root.style.display = options.display;
  }
  this.listVisible(false);
  //
  L.DomEvent.on(
    this._e_labelwrap,
    "click",
    function(_this) {
      return function() {
        _this.toggleListVisible();
      };
    }(this)
  );
  // items
  this._items = [];
  var len = this._layers != null ? this._layers.length : 0;
  for( var n = 0; n < len; n++ ) {
    var lyr = this._layers[n];
    var e_item = L.DomUtil.create("li", "bo-layercontrol-item");
    e_item.appendChild(document.createTextNode(lyr.text));
    L.DomEvent.on(
      e_item,
      "click",
      function(_this, _id) {
        return function() {
          _this.activeLayerId(_id);
        };
      }(this, lyr.id)
    );
    this._e_list.appendChild(e_item);
    this._items[n] =  e_item;
  }
  //
  for( var n = 0; n < this._layers.length; n++ ) {
    this._layers[n].layer.on("add remove", this._onLayerChange, this);
  }
  //
  var id = this.activeLayerId();
  if( id == null && this._layers != null && this._layers.length > 0) {
    // sets default
    this.activeLayerId(this._layers[0].id);
  }
};

BO.LayerSwitcher.prototype.destruct = function destruct() {
  for (var n = 0; n < this._layers.length; n++) {
    this._layers[n].layer.off("add remove", this._onLayerChange, this);
  }
};

    /**
     * Gets/Sets ID of active layer.
     * @param id (Setter) ID for the layer you want to active.
     * @return ID/this.
     */
BO.LayerSwitcher.prototype.activeLayerId = function activeLayerId(id) {
  if( arguments != null && arguments.length > 0 ) {
    var added = [], removed = [];
    var text = null; // 2020-04-03 Added
    for(var n = 0; n < this._layers.length; n++ ) {
      if( id == this._layers[n].id ) {
        added.push(this._layers[n].layer);
        text = this._layers[n].text; // 2020-04-03 Added
        L.DomUtil.addClass(this._items[n], "bo-layercontrol-hit"); // 2024-03-09 changed: original -> leaflet lib
      }
      else {
        removed.push(this._layers[n].layer);
        L.DomUtil.removeClass(this._items[n], "bo-layercontrol-hit"); // 2024-03-09 changed: original -> leaflet lib
      }
    }
    // stops onLayerChange handler
    this._Stop_onLayerChange = true;
    for( var n = 0; n < removed.length; n++ ) {
      if( this._map.hasLayer(removed[n]) ) {
        this._map.removeLayer(removed[n]);
      }
    }
    for( var n = 0; n < added.length; n++ ) {
      if( !this._map.hasLayer(added[n]) ) {
        this._map.addLayer(added[n]);
      }
    }
    // 2020-04-03 Added
    this._e_label.innerText = text != null ? text : "";
    // restarts onLayerChange handler
    this._Stop_onLayerChange = false;
    //
    this._map.fire("baselayerchange", {"id": id});
    return this;
  }
  else {
    for(var n = 0; n < this._layers.length; n++ ) {
      if( this._map.hasLayer(this._layers[n].layer) ) {
        return this._layers[n].id;
      }
    }
    return null;
  }
};

BO.LayerSwitcher.prototype.map = function map(value) {
  if( arguments == null || !(arguments.length > 0) ) {
    return this._map;
  }
  this._map = value;
  return this;
};

BO.LayerSwitcher.prototype.toggleListVisible = function toggleListVisible() {
  this.listVisible(!this.listVisible());
};

BO.LayerSwitcher.prototype.listVisible = function listVisible(visible) {
  if( arguments == null || !(arguments.length > 0) ) {
    return !L.DomUtil.hasClass(this._e_root,"bo-layercontrol-closed"); // 2024-03-09 changed: original -> leaflet lib
  }
  else {
    if( visible ) {
      L.DomUtil.removeClass(this._e_root,"bo-layercontrol-closed"); // 2024-03-09 changed: original -> leaflet lib
      this._svg_tup.style.display = "inline-block";
      this._svg_tdown.style.display = "none";
    }
    else {
      L.DomUtil.addClass(this._e_root,"bo-layercontrol-closed"); // 2024-03-09 changed: original -> leaflet lib
      this._svg_tup.style.display = "none";
      this._svg_tdown.style.display = "inline-block";
    }
  }
};
    /**
     * Called when a single layer is removed or added.
     * @param e Event data.
     */
BO.LayerSwitcher.prototype._onLayerChange = function _onLayerChange(e) {
      if( this._Stop_onLayerChange ) {
        return;
      }
      var type = e.type; // add/remove
      var target = e.target; // layer
      if( type == "add") {
        // finds id
        var id = null;
        var text = null;
        for (var n = 0; n < this._layers.length; n++) {
          if( e.target === this._layers[n].layer ) {
            id = this._layers[n].id;
            text = this._layers[n].text;
          }
        }
        this._e_label.innerText = text;
      }
    };

