if( window.BO == null ) {
  window.BO = {};
}

/**
 * Map console. Currently, contains home button, mylocation button, and gnss toggle.
 */
BO.MapConsole = function MapConsole(e_root, e_main, e_button) {
  // root
  this._e_root = e_root;
  // main
  this._e_main = e_main;
  // button
  e_button.addEventListener("click", function(_this) {return function(e) {_this.onClick(e);};}(this));
  // up
  this._e_up = document.createElement("div");
  this._e_up.className = "mapconsole-button-icon-wrap";
  e_button.appendChild(this._e_up);
  var svg_up = BO.createInlineSvg(BO.icons.up);
  svg_up.setAttribute("viewBox", "0 0 64 64");
  svg_up.setAttribute("class", "icon");
  this._e_up.appendChild(svg_up);
  // down
  this._e_down = document.createElement("div");
  this._e_down.className = "mapconsole-button-icon-wrap";
  e_button.appendChild(this._e_down);
  var svg_down = BO.createInlineSvg(BO.icons.down);
  svg_down.setAttribute("viewBox", "0 0 64 64");
  svg_down.setAttribute("class", "icon");
  this._e_down.appendChild(svg_down);
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

/**
 * Creates a new toggle button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onchange A listener for onchange.
 */
BO.MapConsole.prototype.addToggleButton = function addToggleButton(e_root,icon_name,onchange) {
  if( e_root == null ) {
    e_root = document.createElement("div");
    this._e_main.appendChild(e_root);
  }
  this._buttonhash[icon_name] = new BO.MapConsoleToggleButton(e_root, icon_name, onchange);
};

/**
 * Called when the button is clicked.
 */
BO.MapConsole.prototype.onClick = function onClick(v) {
  this.opened(!this.opened());
};

/**
 * Command button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onclick A listener for onclick.
 */
BO.MapConsoleCommandButton = function MapConsoleCommandButton(e_root, icon_name, onclick) {
  if( e_root == null ) {
    e_root = document.createElement("div");
  }
  e_root.className = (e_root.className != null ? e_root.className: "") +"icon-wrap";
  this._e_root = e_root;
  this._e_svg = BO.createInlineSvg(BO.icons[icon_name]);
  this._e_svg.setAttribute("viewBox", "0 0 64 64");
  this._e_svg.setAttribute("class", "icon");
  this._e_root.appendChild(this._e_svg);
  this._e_root.addEventListener("click", onclick);
};

/**
 * Toggle button
 * @param e_root DOM element. If null, creates a div element.
 * @param icon_name Icon name registered in BO.icons.
 * @param onchange A listener for onchange.
 */
BO.MapConsoleToggleButton = function MapConsoleToggleButton(e_root, icon_name, onchange) {
  if( e_root == null ) {
    e_root = document.createElement("div");
  }
  e_root.className = (e_root.className != null ? e_root.className: "") +" icon-wrap";
  this._e_root = e_root;
  this._e_svg = BO.createInlineSvg(BO.icons[icon_name]);
  this._e_svg.setAttribute("viewBox", "0 0 64 64");
  this._e_svg.setAttribute("class", "icon");
  this._e_root.appendChild(this._e_svg);
  this._e_root.addEventListener("click", function(_this){return function(e){_this.onClick();};}(this));
  this._onchange = onchange;
  this.active(false);
};

/**
 * Sets/Gets the toggle button is active.
 */
BO.MapConsoleToggleButton.prototype.active = function active(v) {
  if( arguments != null && arguments.length > 0 ) {
    if( v ) {
      this._active = true;
      this._e_svg.setAttribute("class", "icon-active");
      if( this._onchange ) {
        this._onchange(this._active);
      }
    }
    else {
      this._active = false;
      this._e_svg.setAttribute("class", "icon-inactive");
      if( this._onchange ) {
        this._onchange(this._active);
      }
    }
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
