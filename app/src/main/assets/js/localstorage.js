if( window.BO == null ) {
  window.BO = {};
}


if( window.localStorage != null ) {
  BO.LocalStorage = window.localStorage;
}
else {
  BO.LocalStorage = {
    "getItem": function() {return null},
    "setItem": function() {},
  };
}
