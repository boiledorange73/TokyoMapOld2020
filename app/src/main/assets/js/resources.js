if( window.BO == null ) {
  window.BO = {};
}

BO.lang = function() {
  // supports "lc" URL param.
  var search = window.location && window.location.search ? window.location.search : "";
  if( search.substr(0,1) == "?" ) {
    search = search.substr(1);
  }
  var aparams = search.length > 0 ? search.split("&") : null;
  var len = aparams ? aparams.length : 0;
  for( var n = 0; n < len; n++ ) {
    var param = aparams[n];
    if( param != null && param.substr(0,3) == "lc=" ) {
      return param.substr(3);
    }
  }
  // Gets the language from navigator.
  if( navigator != null && navigator.language != null ) {
    var arr = navigator.language.split("-");
    if( arr != null && arr.length > 0 ) {
      return arr[0];
    }
    return "C";
  }
}();

/**
 * Resources class.
 * @param hash {key: [(Common), {"ja": (JA),...}]},...]
 */
BO.resources = function(hash) {
  this._hash = hash;
};

/**
 * Gets value.
 * @param key
 * @return text or "!!"+key+"!!"
 */
BO.resources.prototype.get = function get(key) {
  var arr = this._hash[key];
  if( arr != null ) {
    var c = arr[0];
    var hash = arr[1];
    for(var k in hash) {
      if( k == BO.lang ) {
        return hash[k];
      }
    }
    return c;
  }
  return "!!"+key+"!!";
};


