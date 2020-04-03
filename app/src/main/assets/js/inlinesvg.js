if( window.BO == null ) {
  window.BO = {};
}

// 2020-04-03 changed: attrs added.
/**
 * Creates inline svg.
 * @param data Array of hashes which include "tagName" and attributes.
 * @param attrs Attributes for svg element. "viewBox" prop set "0 0 64 64" by default.
 */
BO.createInlineSvg = function createInlineSvg(data, attrs) {
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
  // attrs
  attrs = attrs || {};
  attrs.viewBox = attrs.viewBox || "0 0 64 64";
  for( var k in attrs ) {
    e_root.setAttribute(k, attrs[k]);
  }
  return e_root;
};

