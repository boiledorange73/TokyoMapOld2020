if( window.BO == null ) {
  window.BO = {};
}

/**
 * (INTERNAL) Append SVG. Called by only constructor.
 * Added: 2021-04-01
 */
function appendSvg(e_parent, iconname) {
  var e_div= document.createElement("div");
  e_div.className = "mapconsole-button-icon-wrap";
  e_parent.appendChild(e_div);
  var svg = BO.createInlineSvg(BO.icons[iconname]);
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("class", "icon");
  e_div.appendChild(svg);
  return e_div;
}


/**
 * Map console. Currently, contains home button, mylocation button, and gnss toggle.
 */
BO.MapConsole = function MapConsole(e_root, e_main, e_button) {
  // root
  this._e_root = e_root;
  // main
  this._e_main = e_main;
  // up/down button
  e_button.addEventListener("click", function(_this) {return function(e) {_this.onClick(e);};}(this));
  this._e_up = appendSvg(e_button, "up");
  this._e_down = appendSvg(e_button, "down");
  //
  this._buttonhash = {};
  //
  this.opened(false);
};

/**
 * Sets/Gets whether main block is opened.
 */
BO.MapConsole.prototype.opened = function opened(v) {
  if( arguments != null && arguments.length > 0 ) {
    if( v ) {
      this._opened = true;
      this._e_up.style.display = "none";
      this._e_down.style.display = "block";
      this._e_root.style.display = "block";
    }
    else {
      this._opened = false;
      this._e_up.style.display = "block";
      this._e_down.style.display = "none";
      this._e_root.style.display = "none";
    }
  }
  else {
    return !!this._opened;
  }
};

/**
 * Creates a new command button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onclick A listener for onclick.
 */
BO.MapConsole.prototype.addCommandButton = function addCommandButton(e_root,icon_name,onclick) {
  if( e_root == null ) {
    e_root = document.createElement("div");
    this._e_main.appendChild(e_root);
  }
  this._buttonhash[icon_name] = new BO.MapConsoleCommandButton(e_root, icon_name, onclick);
};

// 2021-04-01 Modified: isactive added.
/**
 * Creates a new toggle button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onchange A listener for onchange.
 * @param isactive Whether this is active initially.
 */
BO.MapConsole.prototype.addToggleButton = function addToggleButton(e_root,icon_name,onchange,isactive) {
  if( e_root == null ) {
    e_root = document.createElement("div");
    this._e_main.appendChild(e_root);
  }
  this._buttonhash[icon_name] = new BO.MapConsoleToggleButton(e_root, icon_name, onchange, isactive);
};

// 2021-04-01 Added.
/**
 * Creates a new toggle button
 * @param e_root DOM element. If null, creates a div element.
 * @param button_name Button name, used by index of internal button hash.
 * @param icon_names Array of icon name registered in BO.icons.
 * @param onchange A listener for onchange.
 * @param isactive Whether this is active initially.
 */
BO.MapConsole.prototype.addRevolvingButton = function addRevolvingButton(e_root,button_name,icon_names,onchange,index) {
  if( e_root == null ) {
    e_root = document.createElement("div");
    this._e_main.appendChild(e_root);
  }
  this._buttonhash[button_name] = new BO.MapConsoleRevolvingButton(e_root, icon_names, onchange, index);
};

/**
 * Called when the button is clicked.
 */
BO.MapConsole.prototype.onClick = function onClick(v) {
  this.opened(!this.opened());
};

BO.MapConsole._MakeSvgButton = function _MakeSvgButton(obj, e_root, icon_name, onclick) {
  if( e_root == null ) {
    e_root = document.createElement("div");
  }
  // 2021-04-01 Added: _e_root._class_name_prefix stored.
  obj._class_name_prefix = e_root.className != null ? e_root.className: "";
  e_root.className = obj._class_name_prefix +"icon-wrap";
  obj._e_root = e_root;
  if( icon_name != null ) {
    obj._e_svg = BO.createInlineSvg(BO.icons[icon_name],{"class": "icon"});
  }
/*
  obj._e_svg.setAttribute("viewBox", "0 0 64 64");
  obj._e_svg.setAttribute("class", "icon");
*/
  if( obj._e_svg != null ) {
    obj._e_root.appendChild(obj._e_svg);
  }
  obj._e_root.addEventListener("click", onclick);
};

/**
 * Command button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onclick A listener for onclick.
 */
BO.MapConsoleCommandButton = function MapConsoleCommandButton(e_root, icon_name, onclick) {
  BO.MapConsole._MakeSvgButton(this, e_root, icon_name, onclick);
};

// 2021-04-01 Modified: isactive added.
/**
 * Toggle button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onchange A listener for onchange.
 * @param isactive Whether this is active initially.
 */
BO.MapConsoleToggleButton = function MapConsoleToggleButton(e_root, icon_name, onchange, isactive) {
  BO.MapConsole._MakeSvgButton(this, e_root, icon_name, function(_this){return function(e){_this.onClick();};}(this));
  this._onchange = onchange;
  this.active(!!isactive);
};

/**
 * Sets/Gets the toggle button is active.
 */
BO.MapConsoleToggleButton.prototype.active = function active(v) {
  if( arguments != null && arguments.length > 0 ) {
    if( this._active === v ) {
      return this;
    }
    if( v ) {
      this._active = true;
      // 2021-04-01 Added: _e_root.className toggled.
      this._e_root.setAttribute("class", this._class_name_prefix+"icon-wrap-active");
      this._e_svg.setAttribute("class", "icon-active");
      if( this._onchange ) {
        this._onchange(this._active);
      }
    }
    else {
      this._active = false;
      // 2021-04-01 Added: _e_root.className toggled.
      this._e_root.setAttribute("class", this._class_name_prefix+"icon-wrap");
      this._e_svg.setAttribute("class", "icon-inactive");
      if( this._onchange ) {
        this._onchange(this._active);
      }
    }
    return this;
  }
  else {
    return !!this._active;
  }
};

/**
 * Called when element is clicked.
 */
BO.MapConsoleToggleButton.prototype.onClick = function onClick(e) {
  this.active(!this.active());
}

// 2021-04-01 Added
/**
 * Revolving button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_names Array of icon name registered in BO.icons.
 * @param onchange A listener for onchange, whose parameter is {name, index}.
 * @param index Initial index.
 */
BO.MapConsoleRevolvingButton = function MapConsoleRevolvingButton(e_root, icon_names, onchange, index) {
  this._icons = [];
  var len = icon_names ? icon_names.length : 0;
  for( var n = 0; n < len; n++ ) {
    var name = icon_names[n];
    this._icons[n] = {
      "name": name,
      "icon": BO.createInlineSvg(BO.icons[name],{"class": "icon"})
    };
  }
  BO.MapConsole._MakeSvgButton(this, e_root, null, function(_this){return function(e){_this.onClick();};}(this));
  this._onchange = onchange;
  this.iconIndex(this.calculateSuitbleIndex(index));
};

/**
 * Progresses the index.
 * @return this.
 */
BO.MapConsoleRevolvingButton.prototype.nextIndex = function nextIndex() {
  var icons_length = this._icons ? this._icons.length : 0;
  this.iconIndex((this._icon_index+1) % icons_length);
  return this;
};

/**
 * Calculates the suitable index value. If no icon registered, always returns -1. If value is within the icons array, returns not negative value. Otherwise, returns 0.
 * @param value Index.
 * @return Calculated index.
 */
BO.MapConsoleRevolvingButton.prototype.calculateSuitbleIndex = function calculateSuitbleIndex(value) {
  if( !this._icons ) {
    return -1;
  }
  if( value >= 0 && value < this._icons.length ) {
    return value;
  }
  return 0;
};

/**
 * Sets/Gets the index.
 * @return this/current index.
 */
BO.MapConsoleRevolvingButton.prototype.iconIndex = function iconIndex(value) {
  if( arguments == null || !(arguments.length > 0) ) {
    return this._icon_index;
  }
  var icon = null;
  var oldIndex = this._icon_index;
  var icons_length = this._icons ? this._icons.length : 0;
  if( value >= 0 && value < icons_length ) {
    icon = this._icons[value].icon;
    this._icon_index = value;
  }
  else {
    this._icon_index = -1;
  }
  // removes all children
  while( this._e_root.lastChild ) {
    this._e_root.removeChild(this._e_root.lastChild);
  }
  if( icon != null ) {
    this._e_root.appendChild(icon);
  }
  if( this._icon_index != oldIndex && this._onchange ) {
    this._onchange({"index": this._icon_index, "name": this.getNameByIndex(this._icon_index)});
  }
};

/**
 * Gets icon name specified at the specified index.
 * @return icon name if found, null otherwise.
 */
BO.MapConsoleRevolvingButton.prototype.getNameByIndex = function getNameByIndex(ix) {
  var icons_length = this._icons ? this._icons.length : 0;
  if( ix >= 0&& ix < icons_length ) {
    return this._icons[ix].name;
  }
  return null;
};

/**
 * Called when element is clicked.
 */
BO.MapConsoleRevolvingButton.prototype.onClick = function onClick(e) {
  this.nextIndex();
}



