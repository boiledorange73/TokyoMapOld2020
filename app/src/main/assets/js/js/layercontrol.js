
  if( window.BO == null ) {
    window.BO = {};
  }
  var M = window.BO;

  /**
   * Custom control for switching layer
   * @parm opts Options, including layers ([{id, text, ollayer},...]), target (target element).
   */
  M.LayerControl = (function (Control) {
    // constructor
    function LayerControl(options) {
      // options
      options = options || {};
      var e_root = document.createElement("form");
      e_root.style.margin = "0";
      e_root.style.padding = "0";
      // DOM setup
      e_root.className = "ol-control bo-layercontrol";
      this._e_select = document.createElement("select");
      this._e_select.className = "bo-layercontrol-select";
      this._e_select.addEventListener(
        "change",
        function(_this) {
          return function(e) {
            _this.onChange(e);
          }
        }(this)
      );
      e_root.appendChild(this._e_select);
      //  Layer list setup
      this._layers = options.layers;
      while( this._e_select.lastChild != null ) {
        this._e_select.removeChild(this._e_select.lastChild);
      }
      var len = this._layers != null ? this._layers.length : 0;
      for( var n = 0; n < len; n++ ) {
        var e_option = document.createElement("option");
        e_option.value = this._layers[n].id;
        e_option.appendChild(document.createTextNode(this._layers[n].text));
        this._e_select.appendChild(e_option);
      }
      // Calls the superclass
      Control.call(this, {"element": e_root, "target": options.target});
    }
    // creates the class
    // prototype for inheritance
    if( Control ) {
      LayerControl.__proto__ = Control;
    }
    LayerControl.prototype = Object.create(Control && Control.prototype);
    LayerControl.prototype.constructor = LayerControl;
    /**
     * Called by the click event handler
     */
    LayerControl.prototype.onChange = function onChange(e) {
        var len = this._layers != null ? this._layers.length: 0;
        var id = this._e_select.value;
        for( n = 0; n < len; n++ ) {
          layer = this._layers[n];
          layer.ollayer.setVisible(layer.id == id);
        }
        this.dispatchEvent("change");
    }
    /**
     * Sets/Gets the ID of the active layer.
     */
    LayerControl.prototype.activeLayerId = function activeLayerId(id) {
      if( arguments != null && arguments.length > 0 ) {
        this._e_select.value = id;
      }
      else {
        var len = this._layers != null ? this._layers.length: 0;
        for( var n = 0; n < len; n++ ) {
          var layer = this._layers[n];
          if( layer.ollayer.getVisible() ) {
            return layer.id;
          }
        }
      }
    };
    return LayerControl;
  }(ol.control.Control));

