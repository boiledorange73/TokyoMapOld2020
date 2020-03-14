
var EXTENT4326 =  [138.937186111, 34.8595027778, 140.880366667, 36.4654194444];


window.onload = function() {
  var map;
  var resources = new BO.resources({
    "rapid": ["Rapid Survey Map", {"ja": "迅速測図"}],
    "tokyo5000": ["Tokyo 1:5000", {"ja": "東京 1:5000"}],
    "gsiort": ["Ortho", {"ja": "オルソ画像"}],
    "gsistd": ["Standard", {"ja": "標準地図"}],
    "gsitile": ["GSI Tile", {"ja": "地理院タイル"}],
    "naro": ["NARO", {"ja": "農研機構"}],
    "locationerror": ["Error occurred while getting location.",{"ja": "位置情報取得時にエラーが発生しました。"}],
  });
  var layersettings = [
    {
      "id": "rapid",
      "text": resources.get("rapid"),
      "attribution": {
        "text": resources.get("naro"),
        "site": "https://aginfo.cgk.affrc.go.jp/mapprv/",
      },
      "url": "https://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Kanto_Rapid-900913-L/{z}/{x}/{y}.jpg",
      "minZoom": 17,
    },
    {
      "id": "tokyo5000",
      "text": resources.get("tokyo5000"),
      "attribution": {
        "text": resources.get("naro"),
        "site": "https://aginfo.cgk.affrc.go.jp/mapprv/",
      },
      "url": "https://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Tokyo5000-900913-L/{z}/{x}/{y}.jpg",
      "minZoom": 18,
    },
    {
      "id": "gsistd",
      "text": resources.get("gsistd"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
      "minZoom": 18,
    },
    {
      "id": "gsiort",
      "text": resources.get("gsiort"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg",
      "minZoom": 18,
    },
  ];
  // main
  var e_main = document.getElementById("MAIN");
  var map = new BO.ChiefMap(e_main, layersettings, "chief");
  // console
  var mapconsole = new BO.MapConsole(
    document.getElementById("MAPCONSOLE"),
    document.getElementById("MAPCONSOLE-MAIN"),
    document.getElementById("MAPCONSOLE-BUTTON")
  );
  // initilizes lon,lat,zoom
  var lon = localStorage.getItem("lon");
  var lat = localStorage.getItem("lat");
  var zoom = localStorage.getItem("zoom");
  if( lon !== null && lat !== null && zoom !== null ) {
    map.setLonLatZoom(lon, lat, zoom);
  }
  else {
    map.fitLonLatExtent(EXTENT4326);
  }
  // Setup location functions.
  initLocation(map, mapconsole, resources);
};

/**
 * Sets up location functions.
 * This function dropped from onload()
 *   because listeners should not have unnecessary variables
 *   (functions generated in the function shares all variables).
 */
function initLocation(map, mapconsole, resources) {
  var watch_id = null;
  var latest_coords = null;
  mapconsole.addCommandButton(null, "home",
    function(e){
      map.fitLonLatExtent(EXTENT4326);
    }
  );
  mapconsole.addCommandButton(null, "mylocation",
    function(e){
      if( latest_coords != null ) {
        map.setLonLat(latest_coords.longitude, latest_coords.latitude);
      }
      else {
        navigator.geolocation.getCurrentPosition(
          function success(pos) {
            if( pos != null && pos.coords != null ) {
              // latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed
              map.putLocation(pos.coords, 5000, true);
            }
          },
          function error(err) {
            alert(resources.get("locationerror") + "\n" + err.message);
            console.log(err);
          },
          {
            "maximumAge": 0,
            "timeout": 10000,
            "enableHighAccuracy": true,
          }
        );
      }
    }
  );
  mapconsole.addToggleButton(null, "gnss",
    function(e){
      if( e ) {
        latest_coords = null;
        watch_id = navigator.geolocation.watchPosition(
          function success(pos) {
            if( pos != null && pos.coords != null ) {
              map.putLocation(pos.coords, 0, false);
              latest_coords = {};
              for(var k in pos.coords ) {
                latest_coords[k] = pos.coords[k];
              }
            }
          },
          function error(err) {
            alert(resources.get("locationerror") + "\n" + err.message);
            mapconsole._buttonhash["gnss"].active(false);
          },
          {
            "maximumAge": 0,
            "timeout": 5000,
            "enableHighAccuracy": true,
          }
        );
      }
      else {
        if( watch_id !== null ) {
          navigator.geolocation.clearWatch(watch_id);
          map.setupLocationTimeout(0);
          watch_id = null;
          latest_coords = null;
        }
      }
    }
  );
}

