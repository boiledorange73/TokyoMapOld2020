// 2024-03-09 Created
if( window.BO == null ) {
  window.BO = {};
}
if( !BO.Control ) {
  BO.Control = {};
}

BO.Control.Opacity = L.Control.extend({
  "options": {
    "listener": null,
    "enabled": true,
    "default_opacity": 100,
  },
  "onAdd": function onAdd(map) {
    this._opacity = 100;
    this._map = map;
    this._container = L.DomUtil.create("div");
    L.DomUtil.addClass(this._container, "bo-opacitycontrol-root");
    this._input =  L.DomUtil.create("input");
    L.DomUtil.addClass(this._input, "bo-opacitycontrol-input");
    this._input.setAttribute("type", "range");
    this._input.setAttribute("min", "0");
    this._input.setAttribute("max", "100");
    this._input.setAttribute("step", "20");
    this._input.setAttribute("value", "100");
    this.enabled(this.options.enabled);

    L.DomEvent.disableClickPropagation(this._input);
    // cancels mouse events
    var fn_preventer = function fn_preventer(ev) {
      ev.stopPropagation();
    };
    this._container.addEventListener("mousedown", fn_preventer, true);
    this._container.addEventListener("mousemove", fn_preventer, true);
    this._container.addEventListener("mouseup", fn_preventer, true);
    // change event
    L.DomEvent.on(this._input, "change",
      function(_this){return function() {
        _this.opacity(_this._input.value);
      };}(this)
    );
    // appends
    this._container.appendChild(this._input);
    // layer.setOpacity(Number(rgValue / 100));
    return this._container;
  },
  "onRemove": function onRemove(map) {
    this.opacity(1.0);
    this._map = null;
    this._container = null;
    this._input = null;
  },
  "enabled": function(v) {
    if( arguments && arguments.length > 0 ){
      // setter
      if( !!v ) {
        this._container.style.display = "block";
        this._setOpacity(this._opacity);
      }
      else {
        this._container.style.display = "none";
        this._setOpacity(this.options.default_opacity);
      }
      return this;
    }
    return this._container.style.display != "none";
  },
  "_setOpacity": function(v) {
    var a;
    if( this.enabled() ) {
      a = 0.01 * parseInt(v);
    }
    else {
      a = 0.01 * this.options.default_opacity;
    }
    var e_pane = this._map._mapPane;
    var e_container = this._map.getContainer();
    if( e_pane ) {
      e_pane.style.opacity = a;
    }
    if( e_container ) {
      e_container.style.background = "transparent";
    }
  },
  "opacity": function(v) {
    if( arguments && arguments.length > 0 ){
      // setter
      v = parseInt(v);
      if( v <= 0 ) {
        v = 0;
      }
      else if( v > 100 ) {
        v = 100;
      }
      this._opacity = v;
      this._setOpacity(v);
      if( this.options && this.options.listener ) {
        this.options.listener({type: "opacity_changed", "opacity": v});
      }
      this._input.value = v;
      return this;
    }
    return this._opacity;
  },
});

BO.Control.opacity = function opacity(opts) {
    return new BO.Control.Opacity(opts);
}
