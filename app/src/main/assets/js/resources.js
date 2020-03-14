if( window.BO == null ) {
  window.BO = {};
}

BO.lang = function() {
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


