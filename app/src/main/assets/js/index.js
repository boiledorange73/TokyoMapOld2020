if(window.BO == null ) {
  window.BO = {};
}

var EXTENT4326 =  [138.937186111, 34.8595027778, 140.880366667, 36.4654194444];

var mapapp;

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

/* 2021-04-01 Added */
/**
 * Gets whether obj is instance of HTMLElement
 * @param obj Tested object. 
 * @returns Whether obj is instance of HTMLElement
 */
function isHTMLElement(obj) {
  if( window.HTMLElement ) {
    return obj instanceof HTMLElement;
  }
  return (typeof obj === "object") &&
      (obj.nodeType === 1) &&
      (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
}

/**
 * Called when ready to start.
 */
window.onload = function() {
  /* 2021-04-01 Modified: ort-riku10,ort_USA10,ort_old10 added */
  /* 2021-04-01 Modified: leaflet added */
  var resources = new BO.resources({
    "app_name": ["Tokyo Map Old", {"ja": "東京古い地図"}], // 2020-03-30 Added
    "siteurl": ["https://github.com/boiledorange73/TokyoMapOld2020/",], // 2020-08-05 Added
    "rapid": ["Rapid Survey Map", {"ja": "迅速測図"}],
    "tokyo5000": ["Tokyo 1:5000", {"ja": "東京 1:5000"}],
    "ort_riku10": ["AP 1936-1942", {"ja": "空撮 1936-1942"}],
    "ort_USA10": ["AP 1945-1950", {"ja": "空撮 1945-1950"}],
    "ort_old10": ["AP 1961-1969", {"ja": "空撮 1961-1969"}],
    "gazo1": ["AP 1974-1978", {"ja": "空撮 1974-1978"}],
    "gsiort": ["Ortho", {"ja": "オルソ画像"}],
    "gsistd": ["Standard", {"ja": "標準地図"}],
    "gsitile": ["GSI Tile", {"ja": "地理院タイル"}],
    "naro": ["NARO", {"ja": "農研機構"}],
    "dismiss": ["Dismiss", {"ja": "閉じる"}],
    "locationerror": ["Error occurred while getting location.",{"ja": "位置情報取得時にエラーが発生しました。"}],
    "leaflet": ["Leaflet"],
    "leaflet_url": ["https://leafletjs.com/"],
  });

  /* 2021-04-01 Modified: ort-riku10,ort_USA10,ort_old10 added */
  /* 2021-08-05 Modified: maxNativeZoom added */
  var layersettings = [
    {
      "id": "rapid",
      "text": resources.get("rapid"),
      "attribution": {
        "text": resources.get("naro"),
        "site": "https://aginfo.cgk.affrc.go.jp/mapprv/",
      },
      "url": "http://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Kanto_Rapid-900913-L/{z}/{x}/{y}.jpg",
      "maxNativeZoom": 17,
      "maxZoom": 20
    },
    {
      "id": "tokyo5000",
      "text": resources.get("tokyo5000"),
      "attribution": {
        "text": resources.get("naro"),
        "site": "https://aginfo.cgk.affrc.go.jp/mapprv/",
      },
      "url": "http://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Tokyo5000-900913-L/{z}/{x}/{y}.jpg",
      "maxNativeZoom": 18,
      "maxZoom": 20
    },
    {
      "id": "gsistd",
      "text": resources.get("gsistd"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
      "maxNativeZoom": 18,
      "maxZoom": 20
    },
    {
      "id": "gsiort",
      "text": resources.get("gsiort"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg",
      "maxNativeZoom": 18,
      "maxZoom": 20
    },
    {
      "id": "ort_riku10",
      "text": resources.get("ort_riku10"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort_riku10/{z}/{x}/{y}.png",
      "maxNativeZoom": 18,
      "maxZoom": 20
    },
    {
      "id": "ort_USA10",
      "text": resources.get("ort_USA10"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort_USA10/{z}/{x}/{y}.png",
      "maxNativeZoom": 17,
      "maxZoom": 20
    },
    {
      "id": "ort_old10",
      "text": resources.get("ort_old10"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png",
      "maxNativeZoom": 17,
      "maxZoom": 20
    },
    {
      "id": "gazo1",
      "text": resources.get("gazo1"),
      "attribution": {
        "text": resources.get("gsitile"),
        "site": "https://maps.gsi.go.jp/development/ichiran.html",
      },
      "url": "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg",
      "maxNativeZoom": 17,
      "maxZoom": 20
    },
  ];
  // 2021-04-01 Added: library info.
  var libs = [
    {
      "text": resources.get("leaflet"),
      "href": resources.get("leaflet_url"),
    }
  ];
  /* 2021-04-01 Modified: initialization swept to BO.MapApp */
  mapapp = new BO.MapApp("MAIN", {
    "layersettings": layersettings,
    "extent4326": EXTENT4326,
    "resources": resources,
    "submaps": 1,
    "libs": libs,
    "siteurl": resources.get("siteurl")
  });
}

