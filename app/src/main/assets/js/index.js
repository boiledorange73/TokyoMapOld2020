if(window.BO == null ) {
  window.BO = {};
}

var EXTENT4326 =  [138.937186111, 34.8595027778, 140.880366667, 36.4654194444];

var map;

function setAndroidVersionCode(versioncode) {
  window.BO = window.BO || {};
  BO.versioncode = versioncode;
}

// 2020-03-30 Added.
function setAppNameVer(appName, appVer) {
  window.BO = window.BO || {};
  BO.appName = appName;
  BO.appVer = appVer;
}


window.onload = function() {
  var resources = new BO.resources({
    "app_name": ["Tokyo Map Old", {"ja": "東京古い地図"}], // 2020-03-30 Added
    "rapid": ["Rapid Survey Map", {"ja": "迅速測図"}],
    "tokyo5000": ["Tokyo 1:5000", {"ja": "東京 1:5000"}],
    "gsiort": ["Ortho", {"ja": "オルソ画像"}],
    "gsistd": ["Standard", {"ja": "標準地図"}],
    "gsitile": ["GSI Tile", {"ja": "地理院タイル"}],
    "naro": ["NARO", {"ja": "農研機構"}],
    "dismiss": ["Dismiss", {"ja": "閉じる"}],
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
      "url": "http://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Kanto_Rapid-900913-L/{z}/{x}/{y}.jpg",
      "maxZoom": 17,
    },
    {
      "id": "tokyo5000",
      "text": resources.get("tokyo5000"),
      "attribution": {
        "text": resources.get("naro"),
        "site": "https://aginfo.cgk.affrc.go.jp/mapprv/",
      },
      "url": "http://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Tokyo5000-900913-L/{z}/{x}/{y}.jpg",
      "maxZoom": 18,
    },
    {
      "id": "gsistd",
      "text": resources.get("gsistd"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
      "maxZoom": 18,
    },
    {
      "id": "gsiort",
      "text": resources.get("gsiort"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg",
      "maxZoom": 18,
    },
  ];
  // main
  var e_main = document.getElementById("MAIN");
  map = new BO.ChiefMap(e_main, layersettings, "chief");
  // console
  var mapconsole = createMapConsole();
  initCommands(map, mapconsole, resources);
  // initilizes lon,lat,zoom
  var lon = localStorage.getItem("lon");
  var lat = localStorage.getItem("lat");
  var zoom = localStorage.getItem("zoom");
  if( lon !== null && lat !== null && zoom !== null ) {
    map.setLonLatZoom(lon, lat, zoom);
  }
  else {
    map.fit(EXTENT4326);
  }
}

function createMapConsole() {
  var e_root = document.getElementById("MAPCONSOLE-ROOT");
  var e_console = document.createElement("div");
  e_console.id = "MAPCONSOLE";
  e_root.appendChild(e_console);
  var e_main = document.createElement("div");
  e_main.id = "MAPCONSOLE-MAIN";
  e_console.appendChild(e_main);
  var e_button = document.createElement("div");
  e_button.id = "MAPCONSOLE-BUTTON";
  e_root.appendChild(e_button);
  var ret = new BO.MapConsole(e_console, e_main, e_button);
  return ret;
}

function initCommands(map, mapconsole, resources) {
  var watch_id = null;
  var latest_coords = null;
  mapconsole.addCommandButton(null, "home",
    function(e){
      map.fit(EXTENT4326);
    }
  );
  mapconsole.addCommandButton(null, "mylocation",
    function(e){
      if( latest_coords != null ) {
        map.setLonLatZoom(latest_coords.longitude, latest_coords.latitude);
      }
      else {
        navigator.geolocation.getCurrentPosition(
          function success(pos) {
            if( pos != null && pos.coords != null ) {
              // latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed
              map.putLocationMarker(pos.coords, 5000, true);
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
              map.putLocationMarker(pos.coords, 0, false);
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
  // 2020-03-30 Added: info window.
  var info = new BO.Info(
    document.getElementById("MAPINFO-ROOT"),
    resources.get("dismiss"),
  );
  mapconsole.addCommandButton(null, "info",
    function(e){
      info.show({
        "appname": BO.appName ? BO.appName : resources.get("app_name"),
        "appver" : BO.appVer,
      });
    }
  );
}
