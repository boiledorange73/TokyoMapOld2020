if( window.BO == null ) {
  window.BO = {};
}

// 2020-03-30 Added.
/**
 * Info window class.
 * @param e_root Root element.
 * @param t_dismiss Text of dismiss button.
 */
BO.Info = function Info (e_root, t_dismiss) {
  this._e_root = e_root;
  this._e_main = document.createElement("div");
  this._e_main.id = "MAPINFO";
  this._e_root.appendChild(this._e_main);
  this._e_head = document.createElement("h1");
  this._e_head.id = "MAPINFO-APPNAME";
  this._e_appname = document.createElement("a");
  this._e_appname.id = "MAPINFO-SITENAME";
  this._e_head.appendChild(this._e_appname);
  this._e_main.appendChild(this._e_head);
  this._e_appver = document.createElement("h2");
  this._e_appver.id = "MAPINFO-APPVER";
  this._e_main.appendChild(this._e_appver);
  //2021-04-01 Added: library info.
  this._e_lib = document.createElement("div");
  this._e_lib.id = "MAPINFO-LIB";
  this._e_main.appendChild(this._e_lib);
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
  this._onhide = null;
  this.hide();
};

/**
 * Shows the info window with appname (application name (text)), appver (application version(text)) and content (HTML).
 */
BO.Info.prototype.show = function show(opts) {
  opts = opts || {};
  this._e_root.style.display = "block";
  this._e_appname.innerText = opts.appname ? opts.appname : "";
  /* 2021-08-05 Added: supports siteurl. */
  if( opts.siteurl ) {
    this._e_appname.href = opts.siteurl;
    this._e_appname.target =  "_blank";
  }
  else {
    this._e_appname.href = this._e_appname.target = "";
  }

  this._e_appver.innerText = opts.appver ? opts.appver : "";
  // 2021-04-01 Added: library info.
  this.setLibs(opts.libs);
  this._e_content.innerHTML = opts.content ? opts.content : "";
  return this;
};

// 2021-04-01 Added.
/**
 * Puts text and href of a library.
 */
BO.Info.prototype.setLibs = function setLibs(list) {
  while( this._e_lib.lastChild ) {
    this._e_lib.removeChild(this._e_lib.lastChild);
  }
  var len = list ? list.length : 0;
  for( var n = 0; n < len; n++ ) {
    var hash = list[n];
    if( hash.text ) {
      var e = document.createTextNode(hash.text);
      if( hash.href ) {
        var a = document.createElement("a");
        a.href = hash.href;
        a.target = "_blank";
        a.appendChild(e);
        this._e_lib.appendChild(a);
      }
      else {
        this._e_lib.appendChild(e);
      }
    }
  }
  return this;
};

// 2021-04-01 Added.
/**
 * Sets/Gets innerHTML of content element.
 */
BO.Info.prototype.innerHTML = function innerHTML(value) {
  if( arguments == null || !(arguments.length > 0) ) {
    return this._e_content.innerHTML;
  }
  this._e_content.innerHTML = value;
  return this;
};

/**
 * Hides the info window.
 */
BO.Info.prototype.hide = function hide() {
  this._e_root.style.display = "none";
  // 2021-04-01 Added: onHide handler.
  if( this._onhide ) {
    this._onhide(this);
  }
  return this;
};

// 2021-04-01 Added.
/**
 * Gets whether this is hidden.
 * @return Whether this is hidden.
 */
BO.Info.prototype.isVisible = function isVisible() {
  return this._e_root.style.display == "block";
};

// 2021-04-01 Added: onHide handler.
/**
 * Gets/Sets onHide event handler.
 */
BO.Info.prototype.onHide = function onHide(value) {
  if( arguments == null || !(arguments.length > 0) ) {
    return this._onhide;
  }
  this._onhide = value;
  return this;
};
