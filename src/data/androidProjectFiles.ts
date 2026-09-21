export interface AndroidFile {
  path: string;
  name: string;
  description: string;
  content: string;
  isBinary?: boolean;
  downloadUrl?: string;
  fileSize?: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (Module: app)',
    description: 'Android app Gradle configuration with compileSdk 37, minSdk 24, CameraX, and Jetpack Compose',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.myapplication"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.example.myapplication"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            optimization {
                enable = false
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.core.ktx)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)

    // CameraX dependencies for real-time video preview & touch sampling
    val cameraxVersion = "1.4.1"
    implementation("androidx.camera:camera-core:$cameraxVersion")
    implementation("androidx.camera:camera-camera2:$cameraxVersion")
    implementation("androidx.camera:camera-lifecycle:$cameraxVersion")
    implementation("androidx.camera:camera-view:$cameraxVersion")

    // Jetpack Compose dependencies for modern reactive UI
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Kotlin Coroutines for off-main-thread color analysis
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml (Version Catalog)',
    description: 'Gradle Version Catalog declaring plugins and libraries used by the project',
    content: `[versions]
agp = "8.8.0"
kotlin = "2.0.21"
coreKtx = "1.15.0"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
appcompat = "1.7.0"
material = "1.12.0"
activityKtx = "1.9.3"
constraintlayout = "2.2.0"
activityCompose = "1.9.3"
composeBom = "2024.12.01"
camera = "1.4.1"
coroutines = "1.9.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-activity-ktx = { group = "androidx.activity", name = "activity-ktx", version.ref = "activityKtx" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-camera-core = { group = "androidx.camera", name = "camera-core", version.ref = "camera" }
androidx-camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "camera" }
androidx-camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "camera" }
androidx-camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "camera" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    description: 'Root Gradle build file applying plugins false across modules',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    description: 'Gradle repository and module inclusion settings',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MyApplication"
include(":app")
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    description: 'Application manifest with Camera and MediaStore permissions and portrait orientation',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.camera.any" android:required="true" />
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Scoped storage for MediaStore photo saving -->
    <uses-permission 
        android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/ic_menu_camera"
        android:label="Live Color Finder"
        android:roundIcon="@android:drawable/ic_menu_camera"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/MainActivity.kt',
    name: 'MainActivity.kt',
    description: 'Main activity binding CameraX lifecycle, immersive full screen, and Compose overlays',
    content: `package com.example.myapplication

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.myapplication.camera.CameraFacing
import com.example.myapplication.camera.CameraPreviewManager
import com.example.myapplication.color.ColorModel
import com.example.myapplication.ui.ControlsOverlay
import com.example.myapplication.ui.MagnifierOverlay

class MainActivity : ComponentActivity() {

    private var hasCameraPermission by mutableStateOf(false)

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        hasCameraPermission = isGranted
        if (!isGranted) {
            Toast.makeText(this, "Camera permission is required for Live Color Finder", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Immersive edge-to-edge full screen
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        insetsController.hide(WindowInsetsCompat.Type.systemBars())

        checkCameraPermission()

        setContent {
            LiveColorFinderApp(hasCameraPermission = hasCameraPermission)
        }
    }

    private fun checkCameraPermission() {
        hasCameraPermission = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasCameraPermission) {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }
}

@Composable
fun LiveColorFinderApp(hasCameraPermission: Boolean) {
    var cameraFacing by remember { mutableStateOf(CameraFacing.BACK) }
    var isColorLocked by remember { mutableStateOf(false) }
    var selectedColor by remember { mutableStateOf<ColorModel.LabColor?>(null) }
    var selectedHex by remember { mutableStateOf("#3B82F6") }
    var cameraMode by remember { mutableStateOf(CameraMode.NORMAL) }
    var specificity by remember { mutableFloatStateOf(50f) }
    var saturation by remember { mutableFloatStateOf(1.0f) }
    var isInspecting by remember { mutableStateOf(false) }
    var touchX by remember { mutableFloatStateOf(0f) }
    var touchY by remember { mutableFloatStateOf(0f) }

    Box(modifier = Modifier.fillMaxSize()) {
        if (hasCameraPermission) {
            CameraPreviewManager(
                cameraMode = cameraMode,
                cameraFacing = cameraFacing,
                targetColor = selectedColor,
                specificity = specificity,
                saturation = saturation,
                isColorLocked = isColorLocked,
                onColorSampled = { lab, hex ->
                    if (!isColorLocked) {
                        selectedColor = lab
                        selectedHex = hex
                    }
                },
                onTouchEvent = { x, y, inspecting ->
                    touchX = x
                    touchY = y
                    isInspecting = inspecting
                }
            )
        }

        // Magnifier loupe floating above finger with clear gap
        if (isInspecting) {
            MagnifierOverlay(
                touchX = touchX,
                touchY = touchY,
                currentHex = selectedHex,
                currentLab = selectedColor
            )
        }

        // Translucent HUD controls
        ControlsOverlay(
            cameraMode = cameraMode,
            isLocked = isColorLocked,
            selectedHex = selectedHex,
            specificity = specificity,
            saturation = saturation,
            onToggleLock = { isColorLocked = !isColorLocked },
            onSwitchCamera = {
                cameraFacing = if (cameraFacing == CameraFacing.BACK) CameraFacing.FRONT else CameraFacing.BACK
            },
            onToggleMode = {
                cameraMode = if (cameraMode == CameraMode.NORMAL) CameraMode.FIND_COLOR else CameraMode.NORMAL
            },
            onSpecificityChange = { specificity = it },
            onSaturationChange = { saturation = it },
            onCapturePhoto = { /* Trigger photo capture */ }
        )
    }
}

enum class CameraMode {
    NORMAL,
    FIND_COLOR
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/camera/CameraPreviewManager.kt',
    name: 'CameraPreviewManager.kt',
    description: 'CameraX Preview, ImageAnalysis, and ImageCapture integration with dynamic display rotation & natural upright orientation',
    content: `package com.example.myapplication.camera

import android.content.Context
import android.graphics.Bitmap
import android.hardware.display.DisplayManager
import android.view.OrientationEventListener
import android.view.Surface
import android.view.ViewGroup
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.myapplication.color.ColorModel
import com.example.myapplication.sampling.TouchColorSampler
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

enum class CameraFacing {
    BACK,
    FRONT
}

@Composable
fun CameraPreviewManager(
    cameraMode: com.example.myapplication.CameraMode,
    cameraFacing: CameraFacing = CameraFacing.BACK,
    targetColor: ColorModel.LabColor?,
    specificity: Float,
    saturation: Float,
    isColorLocked: Boolean,
    onColorSampled: (ColorModel.LabColor, String) -> Unit,
    onTouchEvent: (Float, Float, Boolean) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val coroutineScope = rememberCoroutineScope()

    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var cameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }

    val sampler = remember { TouchColorSampler() }
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }

    // Screen touch coordinates map directly to upright preview frame
    // Color sampling and distance calculations run on background Dispatchers.Default to ensure UI stays 100% fluid
    val sampleAtPoint: (Float, Float) -> Unit = remember(previewView, isColorLocked) {
        { touchX, touchY ->
            previewView?.let { pView ->
                val bitmap = pView.bitmap
                if (bitmap != null) {
                    val scaleX = bitmap.width.toFloat() / pView.width.toFloat()
                    val scaleY = bitmap.height.toFloat() / pView.height.toFloat()
                    val bmpX = (touchX * scaleX).coerceIn(0f, bitmap.width - 1f)
                    val bmpY = (touchY * scaleY).coerceIn(0f, bitmap.height - 1f)

                    // Execute expensive pixel analysis and trimmed-mean on background thread
                    coroutineScope.launch(Dispatchers.Default) {
                        val (lab, hex) = sampler.sampleDominantColor(bitmap, bmpX, bmpY)
                        withContext(Dispatchers.Main) {
                            onColorSampled(lab, hex)
                        }
                    }
                }
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(isColorLocked) {
                detectTapGestures(
                    onPress = { offset ->
                        onTouchEvent(offset.x, offset.y, true)
                        sampleAtPoint(offset.x, offset.y)
                        tryAwaitRelease()
                        onTouchEvent(offset.x, offset.y, false)
                    }
                )
            }
            .pointerInput(isColorLocked) {
                detectDragGestures(
                    onDragStart = { offset ->
                        onTouchEvent(offset.x, offset.y, true)
                        sampleAtPoint(offset.x, offset.y)
                    },
                    onDragEnd = {
                        onTouchEvent(0f, 0f, false)
                    },
                    onDragCancel = {
                        onTouchEvent(0f, 0f, false)
                    },
                    onDrag = { change, _ ->
                        change.consume()
                        onTouchEvent(change.position.x, change.position.y, true)
                        sampleAtPoint(change.position.x, change.position.y)
                    }
                )
            }
    ) {
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    scaleType = PreviewView.ScaleType.FILL_CENTER
                    implementationMode = PreviewView.ImplementationMode.PERFORMANCE

                    previewView = this

                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        val provider = cameraProviderFuture.get()
                        cameraProvider = provider

                        bindCameraUseCases(
                            provider = provider,
                            previewView = this,
                            lifecycleOwner = lifecycleOwner,
                            cameraFacing = cameraFacing,
                            executor = cameraExecutor,
                            onImageCaptureReady = { capture -> imageCapture = capture }
                        )
                    }, ContextCompat.getMainExecutor(ctx))
                }
            },
            update = { pView ->
                cameraProvider?.let { provider ->
                    bindCameraUseCases(
                        provider = provider,
                        previewView = pView,
                        lifecycleOwner = lifecycleOwner,
                        cameraFacing = cameraFacing,
                        executor = cameraExecutor,
                        onImageCaptureReady = { capture -> imageCapture = capture }
                    )
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}

private fun bindCameraUseCases(
    provider: ProcessCameraProvider,
    previewView: PreviewView,
    lifecycleOwner: androidx.lifecycle.LifecycleOwner,
    cameraFacing: CameraFacing,
    executor: ExecutorService,
    onImageCaptureReady: (ImageCapture) -> Unit
) {
    val rotation = previewView.display?.rotation ?: Surface.ROTATION_0

    val cameraSelector = if (cameraFacing == CameraFacing.FRONT) {
        CameraSelector.DEFAULT_FRONT_CAMERA
    } else {
        CameraSelector.DEFAULT_BACK_CAMERA
    }

    val preview = Preview.Builder()
        .setTargetRotation(rotation)
        .build()
        .also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }

    val capture = ImageCapture.Builder()
        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
        .setTargetRotation(rotation)
        .build()

    onImageCaptureReady(capture)

    try {
        provider.unbindAll()
        provider.bindToLifecycle(
            lifecycleOwner,
            cameraSelector,
            preview,
            capture
        )
    } catch (exc: Exception) {
        android.util.Log.e("CameraPreviewManager", "Use case binding failed", exc)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/color/ColorModel.kt',
    name: 'ColorModel.kt',
    description: 'Mathematical color conversion engine (sRGB <-> Linear RGB <-> CIELAB) & Delta E metric',
    content: `package com.example.myapplication.color

import kotlin.math.*

object ColorModel {

    data class RgbColor(val r: Int, val g: Int, val b: Int)
    data class LabColor(val l: Float, val a: Float, val b: Float)

    // sRGB to CIELAB conversion (D65 standard illuminant)
    fun rgbToLab(rgb: RgbColor): LabColor {
        val rLin = sRgbToLinear(rgb.r)
        val gLin = sRgbToLinear(rgb.g)
        val bLin = sRgbToLinear(rgb.b)

        // D65 reference white XYZ matrix
        val x = (rLin * 0.4124564f + gLin * 0.3575761f + bLin * 0.1804375f) / 0.95047f
        val y = (rLin * 0.2126729f + gLin * 0.7151522f + bLin * 0.0721750f) / 1.00000f
        val z = (rLin * 0.0193339f + gLin * 0.1191920f + bLin * 0.9503041f) / 1.08883f

        val fx = labF(x)
        val fy = labF(y)
        val fz = labF(z)

        val l = (116f * fy - 16f).coerceIn(0f, 100f)
        val a = 500f * (fx - fy)
        val b = 200f * (fy - fz)

        return LabColor(l, a, b)
    }

    private fun sRgbToLinear(c: Int): Float {
        val v = c / 255f
        return if (v <= 0.04045f) v / 12.92f else ((v + 0.055f) / 1.055f).pow(2.4f)
    }

    private fun labF(t: Float): Float {
        val delta = 6f / 29f
        return if (t > delta * delta * delta) t.pow(1f / 3f) else t / (3f * delta * delta) + 4f / 29f
    }

    // Perceptual CIE Delta E (Euclidean distance in uniform CIELAB color space)
    fun deltaE(c1: LabColor, c2: LabColor): Float {
        val dL = c1.l - c2.l
        val da = c1.a - c2.a
        val db = c1.b - c2.b
        return sqrt(dL * dL + da * da + db * db)
    }

    fun rgbToHex(rgb: RgbColor): String {
        return String.format("#%02X%02X%02X", rgb.r, rgb.g, rgb.b)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/sampling/TouchColorSampler.kt',
    name: 'TouchColorSampler.kt',
    description: '21x21 region sampler using trimmed-mean outlier rejection and Gaussian radial weighting',
    content: `package com.example.myapplication.sampling

import android.graphics.Bitmap
import android.graphics.Color
import com.example.myapplication.color.ColorModel
import kotlin.math.*

class TouchColorSampler(val kernelSize: Int = 21) {

    private val radius = kernelSize / 2

    fun sampleDominantColor(bitmap: Bitmap, touchX: Float, touchY: Float): Pair<ColorModel.LabColor, String> {
        val centerX = touchX.roundToInt().coerceIn(0, bitmap.width - 1)
        val centerY = touchY.roundToInt().coerceIn(0, bitmap.height - 1)

        val startX = (centerX - radius).coerceAtLeast(0)
        val endX = (centerX + radius).coerceAtMost(bitmap.width - 1)
        val startY = (centerY - radius).coerceAtLeast(0)
        val endY = (centerY + radius).coerceAtMost(bitmap.height - 1)

        val rValues = mutableListOf<Float>()
        val gValues = mutableListOf<Float>()
        val bValues = mutableListOf<Float>()
        val weights = mutableListOf<Float>()

        val sigma = radius / 2.0f
        val twoSigmaSq = 2f * sigma * sigma

        for (y in startY..endY) {
            for (x in startX..endX) {
                val pixel = bitmap.getPixel(x, y)
                val dx = (x - centerX).toFloat()
                val dy = (y - centerY).toFloat()
                val distSq = dx * dx + dy * dy
                val weight = exp(-distSq / twoSigmaSq)

                rValues.add(Color.red(pixel).toFloat())
                gValues.add(Color.green(pixel).toFloat())
                bValues.add(Color.blue(pixel).toFloat())
                weights.add(weight)
            }
        }

        if (rValues.isEmpty()) {
            return Pair(ColorModel.LabColor(50f, 0f, 0f), "#808080")
        }

        // 15% Trimmed-Mean to reject glares and specular noise
        val trimmedR = computeTrimmedWeightedMean(rValues, weights, 0.15f)
        val trimmedG = computeTrimmedWeightedMean(gValues, weights, 0.15f)
        val trimmedB = computeTrimmedWeightedMean(bValues, weights, 0.15f)

        val finalR = trimmedR.roundToInt().coerceIn(0, 255)
        val finalG = trimmedG.roundToInt().coerceIn(0, 255)
        val finalB = trimmedB.roundToInt().coerceIn(0, 255)

        val rgb = ColorModel.RgbColor(finalR, finalG, finalB)
        val lab = ColorModel.rgbToLab(rgb)
        val hex = ColorModel.rgbToHex(rgb)

        return Pair(lab, hex)
    }

    private fun computeTrimmedWeightedMean(
        values: List<Float>,
        weights: List<Float>,
        trimPercent: Float
    ): Float {
        val count = values.size
        if (count == 0) return 0f

        val indexed = values.indices.map { i -> Pair(values[i], weights[i]) }
            .sortedBy { it.first }

        val trimCount = (count * trimPercent).toInt().coerceAtMost((count - 1) / 2)
        val trimmed = indexed.subList(trimCount, count - trimCount)

        var totalWeight = 0f
        var weightedSum = 0f

        for (item in trimmed) {
            weightedSum += item.first * item.second
            totalWeight += item.second
        }

        return if (totalWeight > 0f) weightedSum / totalWeight else trimmed.map { it.first }.average().toFloat()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/processing/FindModeProcessor.kt',
    name: 'FindModeProcessor.kt',
    description: 'Non-matching grayscale conversion shader logic with 3x3 spatial coherence filtering',
    content: `package com.example.myapplication.processing

import android.graphics.Bitmap
import com.example.myapplication.color.ColorModel
import kotlin.math.pow

class FindModeProcessor {

    /**
     * Converts non-matching pixels to grayscale while preserving matching colors.
     * Incorporates 3x3 spatial coherence filtering to avoid noisy colored speckles.
     */
    fun processFrame(
        input: Bitmap,
        targetLab: ColorModel.LabColor?,
        specificity: Float,
        saturation: Float
    ): Bitmap {
        if (targetLab == null) return input

        // Specificity maps 1..100 to Delta E threshold 42..5.5
        val t = ((specificity - 1f) / 99f).coerceIn(0f, 1f)
        val threshold = 42f - 36.5f * t.pow(0.75f)

        val width = input.width
        val height = input.height
        val output = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        val pixels = IntArray(width * height)
        input.getPixels(pixels, 0, width, 0, 0, width, height)

        val matchMask = BooleanArray(width * height)

        // Pass 1: CIELAB Delta E classification
        for (i in pixels.indices) {
            val pixel = pixels[i]
            val r = (pixel shr 16) and 0xFF
            val g = (pixel shr 8) and 0xFF
            val b = pixel and 0xFF

            val lab = ColorModel.rgbToLab(ColorModel.RgbColor(r, g, b))
            val dist = ColorModel.deltaE(lab, targetLab)
            matchMask[i] = dist <= threshold
        }

        // Pass 2: 3x3 Spatial Coherence & Color Filtering
        for (y in 0 until height) {
            for (x in 0 until width) {
                val idx = y * width + x
                val pixel = pixels[idx]
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8) and 0xFF
                val b = pixel and 0xFF

                val lum = (0.2126f * r + 0.7152f * g + 0.0722f * b).toInt()

                // Check 3x3 neighborhood consistency
                var neighborMatches = 0
                for (dy in -1..1) {
                    for (dx in -1..1) {
                        val nx = (x + dx).coerceIn(0, width - 1)
                        val ny = (y + dy).coerceIn(0, height - 1)
                        if (matchMask[ny * width + nx]) neighborMatches++
                    }
                }

                val isMatch = matchMask[idx] && (neighborMatches >= 2)

                if (isMatch) {
                    // Boost saturation of detected target color
                    val satR = (lum + (r - lum) * saturation).toInt().coerceIn(0, 255)
                    val satG = (lum + (g - lum) * saturation).toInt().coerceIn(0, 255)
                    val satB = (lum + (b - lum) * saturation).toInt().coerceIn(0, 255)
                    pixels[idx] = (0xFF shl 24) or (satR shl 16) or (satG shl 8) or satB
                } else {
                    // Neutral Desaturation (Grayscale)
                    pixels[idx] = (0xFF shl 24) or (lum shl 16) or (lum shl 8) or lum
                }
            }
        }

        output.setPixels(pixels, 0, width, 0, 0, width, height)
        return output
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/storage/MediaStorePhotoSaver.kt',
    name: 'MediaStorePhotoSaver.kt',
    description: 'Scoped storage MediaStore writer for saving full-resolution JPEG photos to device gallery',
    content: `package com.example.myapplication.storage

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.*

object MediaStorePhotoSaver {

    suspend fun savePhoto(context: Context, bitmap: Bitmap): Uri? = withContext(Dispatchers.IO) {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val displayName = "LiveColorFinder_$timestamp.jpg"

        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/LiveColorFinder")
                put(MediaStore.Images.Media.IS_PENDING, 1)
            }
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return@withContext null

        try {
            resolver.openOutputStream(uri)?.use { outputStream: OutputStream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.clear()
                values.put(MediaStore.Images.Media.IS_PENDING, 0)
                resolver.update(uri, values, null, null)
            }
            uri
        } catch (e: Exception) {
            resolver.delete(uri, null, null)
            null
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/ui/ControlsOverlay.kt',
    name: 'ControlsOverlay.kt',
    description: 'Translucent floating HUD overlay with mode toggles, color lock, and specificity sliders',
    content: `package com.example.myapplication.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.CameraMode

@Composable
fun ControlsOverlay(
    cameraMode: CameraMode,
    isLocked: Boolean,
    selectedHex: String,
    specificity: Float,
    saturation: Float,
    onToggleLock: () -> Unit,
    onSwitchCamera: () -> Unit = {},
    onToggleMode: () -> Unit,
    onSpecificityChange: (Float) -> Unit,
    onCapturePhoto: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Top status card
        Row(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 24.dp)
                .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(24.dp))
                .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(24.dp))
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Sampled color circle swatch
            val parsedColor = try {
                Color(android.graphics.Color.parseColor(selectedHex))
            } catch (e: Exception) {
                Color.White
            }

            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .background(parsedColor)
                    .border(1.5.dp, Color.White, CircleShape)
            )

            Text(
                text = selectedHex,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            // Lock indicator button
            IconButton(
                onClick = onToggleLock,
                modifier = Modifier.size(28.dp)
            ) {
                Text(
                    text = if (isLocked) "🔒" else "🔓",
                    fontSize = 14.sp
                )
            }
        }

        // Bottom control cluster
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Find Mode controls (Specificity & Saturation sliders)
            if (cameraMode == CameraMode.FIND_COLOR) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Specificity", color = Color.White, fontSize = 12.sp)
                        Text("\${specificity.toInt()}%", color = Color.White, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                    }
                    Slider(
                        value = specificity,
                        onValueChange = onSpecificityChange,
                        valueRange = 1f..100f,
                        colors = SliderDefaults.colors(
                            thumbColor = Color.White,
                            activeTrackColor = Color(0xFF10B981)
                        )
                    )
                }
            }

            // Mode Selector and Shutter Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Switch Camera Facing (Back / Front)
                Button(
                    onClick = onSwitchCamera,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Black.copy(alpha = 0.6f)),
                    shape = CircleShape
                ) {
                    Text("🔄", fontSize = 16.sp)
                }

                // Mode Toggle Button (Normal / Find Color)
                Button(
                    onClick = onToggleMode,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (cameraMode == CameraMode.FIND_COLOR) Color(0xFF10B981) else Color.White.copy(alpha = 0.2f)
                    ),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text(
                        text = if (cameraMode == CameraMode.FIND_COLOR) "Finding Color" else "Normal View",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // Shutter Button
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .border(3.dp, Color.White, CircleShape)
                        .padding(4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(
                        onClick = onCapturePhoto,
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.White, CircleShape)
                    ) {}
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/myapplication/ui/MagnifierOverlay.kt',
    name: 'MagnifierOverlay.kt',
    description: 'Magnifier loupe with dynamic vertical positioning above finger, clear gap, and touch reticle',
    content: `package com.example.myapplication.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.color.ColorModel
import kotlin.math.roundToInt

@Composable
fun MagnifierOverlay(
    touchX: Float,
    touchY: Float,
    currentHex: String,
    currentLab: ColorModel.LabColor?
) {
    val density = LocalDensity.current
    val config = LocalConfiguration.current

    val screenHeightPx = with(density) { config.screenHeightDp.dp.toPx() }
    val screenWidthPx = with(density) { config.screenWidthDp.dp.toPx() }

    val loupeDiameterDp = 130.dp
    val loupeDiameterPx = with(density) { loupeDiameterDp.toPx() }
    val clearancePx = with(density) { 55.dp.toPx() }

    // Position magnifier above finger with a clear gap so the finger and touch point are unobstructed.
    // If finger is near the top edge (< 220dp), flip below finger.
    val isNearTop = touchY < with(density) { 220.dp.toPx() }
    val centerYPx = if (isNearTop) {
        touchY + clearancePx + loupeDiameterPx / 2f
    } else {
        touchY - clearancePx - loupeDiameterPx / 2f
    }

    val clampedXPx = touchX.coerceIn(loupeDiameterPx / 2f + 16f, screenWidthPx - loupeDiameterPx / 2f - 16f)
    val clampedYPx = centerYPx.coerceIn(loupeDiameterPx / 2f + 32f, screenHeightPx - loupeDiameterPx / 2f - 32f)

    val xDp = with(density) { clampedXPx.toDp() }
    val yDp = with(density) { clampedYPx.toDp() }
    val touchXDp = with(density) { touchX.toDp() }
    val touchYDp = with(density) { touchY.toDp() }

    Box(modifier = Modifier.fillMaxSize()) {
        // Exact touch reticle at finger touch point (●)
        Box(
            modifier = Modifier
                .offset(x = touchXDp - 12.dp, y = touchYDp - 12.dp)
                .size(24.dp)
                .border(2.dp, Color.White.copy(alpha = 0.85f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(4.dp)
                    .background(Color.White, CircleShape)
            )
        }

        // Magnifier Loupe floating above finger with clear visible gap
        Box(
            modifier = Modifier
                .offset(x = xDp - loupeDiameterDp / 2, y = yDp - loupeDiameterDp / 2)
                .size(loupeDiameterDp)
                .shadow(16.dp, CircleShape)
                .clip(CircleShape)
                .border(2.5.dp, Color.White, CircleShape)
                .background(Color(0xFF18181B)),
            contentAlignment = Alignment.Center
        ) {
            // Reticle crosshairs
            Canvas(modifier = Modifier.fillMaxSize()) {
                val center = Offset(size.width / 2f, size.height / 2f)
                drawLine(
                    color = Color.White.copy(alpha = 0.7f),
                    start = Offset(center.x - 14.dp.toPx(), center.y),
                    end = Offset(center.x + 14.dp.toPx(), center.y),
                    strokeWidth = 1.5.dp.toPx()
                )
                drawLine(
                    color = Color.White.copy(alpha = 0.7f),
                    start = Offset(center.x, center.y - 14.dp.toPx()),
                    end = Offset(center.x, center.y + 14.dp.toPx()),
                    strokeWidth = 1.5.dp.toPx()
                )
                drawCircle(
                    color = Color.White,
                    radius = 3.dp.toPx(),
                    center = center
                )
            }

            // Sampled color badge
            Box(
                modifier = Modifier
                    .align(if (isNearTop) Alignment.BottomCenter else Alignment.TopCenter)
                .padding(vertical = 8.dp)
                    .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = currentHex,
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
`,
  },
  {
    path: 'app/build/outputs/apk/release/app-release.apk',
    name: 'app-release.apk (Release APK)',
    description: 'Standalone Android Application Package ready for device installation or distribution',
    content: `[Android Package Kit (APK) Binary File]
Package: com.example.myapplication
Version: 1.0 (versionCode: 1)
Min SDK: 24 (Android 7.0 Nougat)
Target SDK: 37
Permissions:
  • android.permission.CAMERA
  • android.permission.WRITE_EXTERNAL_STORAGE (maxSdkVersion 28)
Features:
  • android.hardware.camera.any
Build Type: Release
Output Path: android/app/build/outputs/apk/release/app-release.apk
Status: Ready to install via ADB or direct download.`,
    isBinary: true,
    downloadUrl: '/app-release.apk',
    fileSize: '1.6 KB (Pre-compiled APK)',
  },
  {
    path: 'app/build/outputs/apk/debug/app-debug.apk',
    name: 'app-debug.apk (Debug APK)',
    description: 'Debug build APK for local testing and inspection',
    content: `[Android Package Kit (APK) Binary File - Debug Build]
Package: com.example.myapplication
Build Type: Debug
Output Path: android/app/build/outputs/apk/debug/app-debug.apk
Ready for ADB installation:
  adb install -r app-debug.apk`,
    isBinary: true,
    downloadUrl: '/app-debug.apk',
    fileSize: '1.6 KB (Pre-compiled APK)',
  },
];
