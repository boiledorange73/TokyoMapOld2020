if( window.BO == null ) {
  window.BO = {};
}


BO.generateLayerControl = function(layers, options) {
  function addClassName(e, cn) {
    var arr = e.className.split(/\s+/);
    for( var n = 0; n < arr.length; n++ ) {
      if( arr[n] == cn ) {
        return; // already exists.
      }
    }
    e.className = e.className + " " + cn;
  }
  function removeClassName(e, cn) {
    var arr_now = e.className.split(/\s+/);
    var className = "";
    var delimiter = "";
    for( var n = 0; n < arr_now.length; n++ ) {
      if( arr_now[n] != cn ) {
        className = className + delimiter + arr_now[n];
        delimiter = " ";
      }
    }
    e.className = className;
  }

  // creates constructor
  var LayerControl = L.Control.extend({
    "options": {
      "position": "topright",
    },
    "initialize": function(layers, options) {
      L.Util.setOptions(this, options);
      this._layers = layers || [];
    },
    "_listVisible": function(visible) {
      //
      if( !(visible === true || visible === false) ) {
//        visible = !(this._e_list.style.display == "block");
        visible = !(this._e_list.style.visibility != "hidden");
      }
      if( visible ) {
//        this._e_list.style.display = "block";
        this._e_list.style.visibility = "visible";
        this._svg_tup.style.display = "inline-block";
        this._svg_tdown.style.display = "none";
      }
      else {
//        this._e_list.style.display = "none";
        this._e_list.style.visibility = "hidden";
        this._svg_tup.style.display = "none";
        this._svg_tdown.style.display = "inline-block";
      }
    },
    /**
     * Called when this control adds to the map.
     * @parm map L.Map instance.
     * @return Container DOM element.
     */
    "onAdd": function(map) {
      this._map = map;
      // creates dom elements
      // 2020-04-03 changed
      this._e_root = L.DomUtil.create("div", "bo-layercontrol-root");
      // toggle
      this._e_labelwrap = L.DomUtil.create("div", "bo-layercontrol-labelwrap", this._e_root);
      this._e_label = L.DomUtil.create("div", "bo-layercontrol-label", this._e_labelwrap);
      this._e_labelswitch = L.DomUtil.create("div", "bo-layercontrol-labelswitch", this._e_labelwrap);
      this._svg_tup = BO.createInlineSvg(BO.icons["tup"]);
      this._svg_tdown = BO.createInlineSvg(BO.icons["tdown"]);
      this._e_labelswitch.appendChild(this._svg_tup);
      this._e_labelswitch.appendChild(this._svg_tdown);
      this._e_list = L.DomUtil.create("ul", "bo-layercontrol-list", this._e_root);
      this._listVisible(false);
      //
      L.DomEvent.on(
        this._e_labelwrap,
        "click",
        function(_this) {
          return function() {
            _this._listVisible();
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
      //
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
        var text = null; // 2020-04-03 Added
        for(var n = 0; n < this._layers.length; n++ ) {
          if( id == this._layers[n].id ) {
            added.push(this._layers[n].layer);
            text = this._layers[n].text; // 2020-04-03 Added
            addClassName(this._items[n], "bo-layercontrol-hit");
          }
          else {
            removed.push(this._layers[n].layer);
            removeClassName(this._items[n], "bo-layercontrol-hit");
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
        var text = null;
        for (var n = 0; n < this._layers.length; n++) {
          if( e.target === this._layers[n].layer ) {
            id = this._layers[n].id;
            text = this._layers[n].text;
          }
        }
        this._e_label.innerText = text;
      }
    },
  });
  // Creates an instance.
  return new LayerControl(layers, options);
}

