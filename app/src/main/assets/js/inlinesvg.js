if( window.BO == null ) {
  window.BO = {};
}

/**
 * Creates inline svg.
 */
BO.createInlineSvg = function createInlineSvg(data) {
  var e_root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var len = data != null ? data.length : 0;
  for( var n = 0; n < len; n++ ) {
    var one = data[n];
    var e = document.createElementNS("http://www.w3.org/2000/svg", one.tagName);
    for( var k in one ) {
      if( k != "tagName" ) {
        e.setAttribute(k, one[k]);
      }
    }
    e_root.appendChild(e);
  }
  return e_root;
};

