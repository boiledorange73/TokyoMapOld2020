package com.gmail.boiledorange73.app.tokyomapold2020

import android.Manifest
import android.annotation.TargetApi
import android.content.ActivityNotFoundException
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.webkit.*
import android.widget.RelativeLayout
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.*


class MainActivity : AppCompatActivity() {
    // consts
    private val RC_LOCATION = 1
    // member variables
    private var mGeolocationOrigin: String? = null
    private var mGeolocationCallback: GeolocationPermissions.Callback? = null
    private var mWebView: WebView? = null

    /**
     * Called when the activity created.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Enable webview debug (via chrome://inspect)
        /*
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
        */
        // Initialization
        supportActionBar?.hide()
        //
        val layoutRoot = RelativeLayout(this)
        // appends views
        addContentView(
                layoutRoot, ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        )
        )
        val webview = WebView(this)
        mWebView = webview
        // layout
        webview.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY)
        webview.setLayoutParams(
                ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                )
        )
        // this.applyUserAgent(this.mWebView);
        layoutRoot.addView(webview)
        // webview settings
        val webViewSettings = webview.settings
        webViewSettings.allowFileAccess = true
        // Enable local storage (for Android 4.0.3)
        webViewSettings.javaScriptEnabled = true
        webViewSettings.domStorageEnabled = true
        // accepts gps
        webview.webChromeClient = object: WebChromeClient() {
            // alert() is called.
            override fun onJsAlert(
                    view: WebView?,
                    url: String?,
                    message: String?,
                    result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                        .setTitle(R.string.app_name)
                        .setPositiveButton(
                                android.R.string.ok,
                                DialogInterface.OnClickListener { dialog, which ->
                                    result?.confirm()
                                }
                        )
                        .setMessage(message)
                        .show()
                // Do not call super.onJsAlert()
                return true
            }
            // permission prompt requested
            override fun onGeolocationPermissionsShowPrompt(
                    origin: String?,
                    callback: GeolocationPermissions.Callback
            ) {
                super.onGeolocationPermissionsShowPrompt(origin, callback)
                val permission = Manifest.permission.ACCESS_FINE_LOCATION
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || ContextCompat.checkSelfPermission(this@MainActivity, permission) == PackageManager.PERMISSION_GRANTED ) {
                    // SDK < 23 OR already granted, accepts without a prompt.
                    callback.invoke(origin, true, true)
                } else {
                    startPermissonCheck(origin, callback)
                }
            }
        }
        webview.webViewClient = object: WebViewClient() {
            /**
             * Called when anchor clicked. For API 21 and more.
             */
            @TargetApi(Build.VERSION_CODES.LOLLIPOP)
            override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
            ): Boolean {
                if( request != null ) {
                    if( request.method.uppercase(Locale.ROOT) == "GET" ) {
                        val url = request.url
                        when( url.scheme?.uppercase(Locale.ROOT) ) {
                            "HTTP", "HTTPS" -> {
                                if( startExternalBrowse(url.toString()) ) {
                                    return true
                                }
                            }
                        }
                    }
                }
                return super.shouldOverrideUrlLoading(view, request)
            }
            /**
             * Called when anchor clicked. For API 20 or less.
             */
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if( url != null && startExternalBrowse(url) ) {
                    return true
                }
                return super.shouldOverrideUrlLoading(view, url)
            }
            // page loaded
            override fun onPageFinished(view: WebView?,url: String?) {
                webview.loadUrl("javascript:setAndroidVersionCode(" + Build.VERSION.SDK_INT + ")")
                webview.loadUrl("javascript:setAppNameVer(\"" + this@MainActivity.getString(R.string.app_name) + "\", " + getAppVerEnc() + ")")
            }
            /**
             * Start external browser with GET method
             */
            private fun startExternalBrowse(url: String): Boolean {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                try {
                    startActivity(intent)
                    return true
                }
                catch( e: ActivityNotFoundException ) {
                    e.printStackTrace()
                    return false
                }
            }
        }
        // 2020-03-30: Added.
        // Checks and requests permission.
        startPermissonCheck(null, null)
        // starts the map application
        webview.loadUrl("file:///android_asset/index.html")
    }

    fun startPermissonCheck(origin: String?, callback: GeolocationPermissions.Callback?) {
        val handler :Handler = Handler(Looper.getMainLooper())
        handler.run {
            permissionCheck(origin, callback)
        }
    }
    fun getAppVerEnc(): String? {
        var v:String? = null
        try {
            val packageInfo: PackageInfo = packageManager.getPackageInfo(packageName, 0)
            v = packageInfo.versionName
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        if( v != null ) {
            return "\"" + v + "\""
        }
        return "null"
    }
    /**
     * Called when requestPermissions finished.
     *
     */
    override fun onRequestPermissionsResult( requestCode: Int, permissions: Array<String?>, grantResults: IntArray ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            RC_LOCATION -> {
                // checks whether the permission granted.
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // grants
                    mGeolocationCallback?.invoke(mGeolocationOrigin, true, true)
                }
                else {
                    // does not grant at this time
                    mGeolocationCallback?.invoke(mGeolocationOrigin, false, false)
                }
                // clears callback and settings
                mGeolocationCallback = null
                mGeolocationOrigin = null
            }
        }
    }

    /**
     * Checks and requests permission. 2020-03-30: Added, from onGeolocationPermissionsShowPrompt().
     */
    private fun permissionCheck(geolocationOrigin: String?, geolocationCallback: GeolocationPermissions.Callback?) {
        val permission = Manifest.permission.ACCESS_FINE_LOCATION
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || ContextCompat.checkSelfPermission(this@MainActivity, permission) == PackageManager.PERMISSION_GRANTED ) {
            // SDK < 23 OR already granted, accepts without a prompt.
            geolocationCallback?.invoke(geolocationOrigin, true, true)
            return
        }
        if (!ActivityCompat.shouldShowRequestPermissionRationale(this@MainActivity, permission) ) {
            mGeolocationOrigin = geolocationOrigin
            mGeolocationCallback = geolocationCallback
            // Asks the user for permission
            ActivityCompat.requestPermissions(this@MainActivity, arrayOf(permission), RC_LOCATION)
        }
    }
}
