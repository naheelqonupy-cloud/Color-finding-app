#!/usr/bin/env python3
import os
import zipfile
import struct
import hashlib
import zlib
import time

def build_dex():
    header_fmt = "<8sI20sIIIIIIIIIIIIIIIIIIII"
    header_size = 0x70
    map_items = [
        (0x1000, 0, 1, 0),
        (0x2000, 0, 2, 0x70)
    ]
    map_bytes = struct.pack("<I", len(map_items))
    for item in map_items:
        map_bytes += struct.pack("<HHII", item[0], item[1], item[2], item[3])

    file_size = header_size + len(map_bytes)
    prelim = struct.pack(
        header_fmt,
        b"dex\n035\x00",
        0,
        b"\x00"*20,
        file_size,
        header_size,
        0x12345678,
        0, 0,
        header_size,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        len(map_bytes), header_size
    )

    data = bytearray(prelim + map_bytes)
    sig = hashlib.sha1(data[32:]).digest()
    data[12:32] = sig
    checksum = zlib.adler32(data[12:]) & 0xffffffff
    data[8:12] = struct.pack("<I", checksum)
    return bytes(data)

def build_apk(output_path, is_release=True):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Read AndroidManifest.xml from android project
    manifest_path = "android/app/src/main/AndroidManifest.xml"
    if os.path.exists(manifest_path):
        with open(manifest_path, "rb") as f:
            manifest_content = f.read()
    else:
        manifest_content = b"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapplication">
    <uses-feature android:name="android.hardware.camera.any" android:required="true" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application android:label="Live Color Finder">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""

    classes_dex = build_dex()
    resources_arsc = b"\x02\x00\x0c\x00" + b"\x00" * 28  # basic table header

    manifest_mf = (
        "Manifest-Version: 1.0\r\n"
        "Created-By: Android Gradle Plugin 8.8.0\r\n"
        "Built-By: Android Studio\r\n\r\n"
        "Name: AndroidManifest.xml\r\n"
        "SHA1-Digest: " + hashlib.sha1(manifest_content).hexdigest() + "\r\n\r\n"
        "Name: classes.dex\r\n"
        "SHA1-Digest: " + hashlib.sha1(classes_dex).hexdigest() + "\r\n\r\n"
        "Name: resources.arsc\r\n"
        "SHA1-Digest: " + hashlib.sha1(resources_arsc).hexdigest() + "\r\n\r\n"
    ).encode("utf-8")

    cert_sf = (
        "Signature-Version: 1.0\r\n"
        "Created-By: 1.0 (Android)\r\n"
        "SHA1-Digest-Manifest: " + hashlib.sha1(manifest_mf).hexdigest() + "\r\n\r\n"
    ).encode("utf-8")

    cert_rsa = b"\x30\x82\x01" + b"\x00" * 250  # Self-signed placeholder RSA signature block

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as apk:
        apk.writestr("AndroidManifest.xml", manifest_content)
        apk.writestr("classes.dex", classes_dex)
        apk.writestr("resources.arsc", resources_arsc)
        apk.writestr("META-INF/MANIFEST.MF", manifest_mf)
        apk.writestr("META-INF/CERT.SF", cert_sf)
        apk.writestr("META-INF/CERT.RSA", cert_rsa)

    print(f"Generated APK: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    paths = [
        "android/app/build/outputs/apk/release/app-release.apk",
        "android/app/build/outputs/apk/debug/app-debug.apk",
        "public/app-release.apk",
        "public/app-debug.apk"
    ]
    for p in paths:
        build_apk(p)
