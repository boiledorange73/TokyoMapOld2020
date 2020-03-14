if( window.BO == null ) {
  window.BO = {};
}


BO.generateLayerControl = function(layers, options) {
  // creates constructor
  var LayerControl = L.Control.extend({
    "options": {
      "position": "topright",
    },
    "initialize": function(layers, options) {
      L.Util.setOptions(this, options);
      this._layers = layers || [];
    },
    /**
     * Called when this control adds to the map.
     * @parm map L.Map instance.
     * @return Container DOM element.
     */
    "onAdd": function(map) {
      this._map = map;
      // creates dom elements
      var className = "bo-layercontrol-select";
      this._e_root = L.DomUtil.create("form", className);
      this._e_root.method = "GET";
      this._e_root.action = "javascript:void(0)";
      this._e_select = L.DomUtil.create("select");
      this._e_root.appendChild(this._e_select);
      L.DomEvent.on(this._e_select, "change", this._onSelectChange, this);
      //
      this._update();
      for( var n = 0; n < this._layers.length; n++ ) {
        this._layers[n].layer.on("add remove", this._onLayerChange, this);
      }
      //
      var id = this.activeLayerId();
      if( id == null && this._layers != null && this._layers.length > 0) {
        // sets default
        this.activeLayerId(this._layers[0].id);
      }
      return this._e_root;
    },
    /**
     * Called when this control removes from the map.
     * @return this.
     */
    "onRemove": function () {
      for (var n = 0; n < this._layers.length; n++) {
        this._layers[n].layer.off("add remove", this._onLayerChange, this);
      }
    },
    /**
     * Adds a layer.
     * @param id Identifier, used for "option" in "select"
     * @param layer L.Layer instance.
     * @param text Text for "option" element.
     * @return this.
     */
    "addLayer": function (id, layer, text) {
      if( this._map ) {
        layer.on("add remove", this._onLayerChange, this);
      }
      this._layers.push({
        "id": id,
        "layer": layer,
        "text": text,
      });
      if( this._map ) {
        this._update();
      }
      return this;
    },
    /**
     * Removes a layer.
     * @param layer L.Layer instance.
     * @return this.
     */
    "removeLayer": function (layer) {
      var flag = false;
      layer.off("add remove", this._onLayerChange, this);
      for (var n = this._layers.length-1; n >= 0; n--) {
        var l = this._layers[n];
        if( l.layer != layer ) {
          this._layers.splice(n, 1);
          flag = true;
        }
      }
      if( flag && this._map ) {
        this._update();
      }
      return this;
    },
    /**
     * Gets/Sets ID of active layer.
     * @param id (Setter) ID for the layer you want to active.
     * @return ID/this.
     */
    "activeLayerId": function(id) {
      if( arguments != null && arguments.length > 0 ) {
        var added = [], removed = [];
        for(var n = 0; n < this._layers.length; n++ ) {
          if( id == this._layers[n].id ) {
            added.push(this._layers[n].layer);
          }
          else {
            removed.push(this._layers[n].layer);
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
    },
    /**
     * Called when a single layer is removed or added.
     * @param e Event data.
     */
    "_onLayerChange": function(e) {
      if( this._Stop_onLayerChange ) {
        return;
      }
      var type = e.type; // add/remove
      var target = e.target; // layer
      if( type == "add") {
        // finds id
        var id = null;
        for (var n = 0; n < this._layers.length; n++) {
          if( e.target === this._layers[n].layer ) {
            id = this._layers[n].id;
          }
        }
        // changes value
        this._e_select.value = id;
      }
    },
    /**
     * Called when layer selection is changed.
     */
    "_onSelectChange": function() {
      if( !this._Stop_onLayerChange ) {
        var id = this._e_select.value;
        if( id != null && id != this.activeLayerId() ) {
          this.activeLayerId(id);
        }
      }
      this._refocusOnMap();
    },
    /**
     * Updates all of internal elements.
     */
    "_update": function() {
      if( this._e_root && this._e_select ) {
        L.DomUtil.empty(this._e_select);
        for(var n = 0; n < this._layers.length; n++ ) {
          var l = this._layers[n];
          var e = L.DomUtil.create("option");
          e.value = l.id;
          e.appendChild(document.createTextNode(l.text));
          this._e_select.appendChild(e);
        }
      }
      return this;
    },
  });
  // Creates an instance.
  return new LayerControl(layers, options);
}

