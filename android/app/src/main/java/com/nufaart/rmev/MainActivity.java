package com.nufaart.rmev;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(KeepAlivePlugin.class);
        super.onCreate(savedInstanceState);
    }

    /**
     * Saat engine aktif, WebView tetap dijalankan walau activity di-pause
     * agar AudioContext dan timer JavaScript tidak berhenti di background.
     */
    @Override
    public void onPause() {
        super.onPause();
        if (KeepAliveService.isRunning && getBridge() != null) {
            WebView webView = getBridge().getWebView();
            webView.onResume();
            webView.resumeTimers();
        }
    }
}
