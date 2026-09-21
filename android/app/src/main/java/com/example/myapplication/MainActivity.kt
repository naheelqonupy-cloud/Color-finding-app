package com.example.myapplication

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

enum class CameraMode {
    NORMAL,
    FIND_COLOR
}

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

        // Immersive full-screen portrait camera
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
                cameraFacing = cameraFacing,
                targetColor = selectedColor,
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

        // Loupe magnifier floating above finger
        if (isInspecting) {
            MagnifierOverlay(
                touchX = touchX,
                touchY = touchY,
                currentHex = selectedHex,
                currentLab = selectedColor
            )
        }

        // HUD controls
        ControlsOverlay(
            cameraMode = cameraMode,
            isLocked = isColorLocked,
            selectedHex = selectedHex,
            specificity = specificity,
            saturation = saturation,
            onToggleLock = { isColorLocked = !isColorLocked },
            onToggleMode = {
                cameraMode = if (cameraMode == CameraMode.NORMAL) CameraMode.FIND_COLOR else CameraMode.NORMAL
            },
            onSpecificityChange = { specificity = it },
            onSaturationChange = { saturation = it },
            onCapturePhoto = { /* Capture and save to MediaStore */ }
        )
    }
}
