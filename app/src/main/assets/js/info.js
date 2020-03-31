if( window.BO == null ) {
  window.BO = {};
}

/**
 * Info window class.
 * 2020-03-30 Added.
 */
BO.Info = function Info (e_root, t_dismiss) {
  this._e_root = e_root;
  this._e_main = document.createElement("div");
  this._e_main.id = "MAPINFO";
  this._e_root.appendChild(this._e_main);
  this._e_appname = document.createElement("h1");
  this._e_appname.id = "MAPINFO-APPNAME";
  this._e_main.appendChild(this._e_appname);
  this._e_appver = document.createElement("h2");
  this._e_appver.id = "MAPINFO-APPVER";
  this._e_main.appendChild(this._e_appver);
  this._e_content = document.createElement("div");
  this._e_content.id = "MAPINFO-CONTENT";
  this._e_main.appendChild(this._e_content);
  this._e_dismiss = document.createElement("button");
  this._e_dismiss.id = "MAPINFO-DISMISS";
  this._e_dismiss.appendChild(document.createTextNode(t_dismiss));
  this._e_dismiss.onclick = function(_this) {
    return function() {
      _this.hide();
    }
  }(this);
  this._e_main.appendChild(this._e_dismiss);
  this.hide();
};

/**
 * Shows the info window with appname (application name (text)), appver (application version(text)) and content (HTML).
 */
BO.Info.prototype.show = function show(opts) {
  opts = opts || {};
  this._e_root.style.display = "block";
  this._e_appname.innerText = opts.appname ? opts.appname : "";
  this._e_appver.innerText = opts.appver ? opts.appver : "";
  this._e_content.innerHTML = opts.content ? opts.content : "";
};

/**
 * Hides the info window.
 */
BO.Info.prototype.hide = function hide() {
  this._e_root.style.display = "none";
};

