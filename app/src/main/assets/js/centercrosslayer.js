// 2021-04-01 Added
if( window.BO == null ) {
  window.BO = {};
}
if( BO.Layer == null ) {
  BO.Layer = {};
}

/**
 * A layer with a cross-hair which is always at the center of screen.
 */
BO.Layer.CenterCross = L.Layer.extend({
  "options": {
  },
  /**
   * Called when this is added to the map.
   * @param map Map
   * @return undefined
   */
  "onAdd": function onAdd(map) {
    var svg = BO.createInlineSvg(BO.icons["crosshair"]);
    svg.setAttribute("viewBox", "0 0 64 64");
    this._icon = L.divIcon({
      "html": svg, 
      "iconSize": [64, 64],
      "iconAnchor": [32, 32],
      "className": "bo-icon-centercross",
    });
    this._change_icon_visible();
    //
    this._marker = L.marker(
      map.getCenter(),
      {
        "icon": this._icon,
        "draggable": false,
        "clickable": false,
      }
    );
    this._marker.addTo(this._map);
    // onmove event handler
    var onmove = function(_this){return function(e) {
      var llc = this._map.getCenter();
      _this._marker.setLatLng(llc);
    }}(this);
    map.on("move", onmove, this);
  },
  /**
   * Called when this is removed from the map.
   * @param map Map
   * @return undefined
   */
  "onRemove": function onRemove(map) {
    map.off("move", this._onmove, this);
    if(this._marker) {
      this._marker.addTo(null);
    }
    this._marker = null;
  },
  /**
   * Gets/Sets whether the cross-hair is visible.
   */
  "visible": function visible(value) {
    if( arguments == null || !(arguments.length > 0) ) {
      return this._visible;
    }
    else {
      this._visible = !!value;
      if( this._icon ) {
        this._change_icon_visible();
      }
    }
  },
  /**
   * (INTERNAL) Changes visibility of the cross-hair.
   */
  "_change_icon_visible": function _change_icon_visible() {
    this._icon.options.html.style.display = this._visible ? "block" : "none";
  },
});

