package com.example.myapplication.camera

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
import kotlinx.coroutines.asExecutor
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

enum class CameraFacing {
    BACK,
    FRONT
}

@Composable
fun CameraPreviewManager(
    modifier: Modifier = Modifier,
    cameraFacing: CameraFacing = CameraFacing.BACK,
    targetColor: ColorModel.LabColor? = null,
    isColorLocked: Boolean = false,
    onColorSampled: (ColorModel.LabColor, String) -> Unit,
    onTouchEvent: (x: Float, y: Float, isInspecting: Boolean) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var cameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var previewUseCase by remember { mutableStateOf<Preview?>(null) }
    var imageAnalysisUseCase by remember { mutableStateOf<ImageAnalysis?>(null) }
    var imageCaptureUseCase by remember { mutableStateOf<ImageCapture?>(null) }

    val sampler = remember { TouchColorSampler(regionSize = 25) }
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }

    // Helper to sample color from the current PreviewView frame at touch (x, y)
    val sampleAtPoint: (Float, Float) -> Unit = remember(previewView, isColorLocked) {
        { touchX, touchY ->
            previewView?.let { pView ->
                val bitmap: Bitmap? = pView.bitmap
                if (bitmap != null) {
                    // PreviewView bitmap is rendered in natural upright display coordinates
                    val scaleX = bitmap.width.toFloat() / pView.width.toFloat()
                    val scaleY = bitmap.height.toFloat() / pView.height.toFloat()

                    val bmpX = (touchX * scaleX).coerceIn(0f, bitmap.width - 1f)
                    val bmpY = (touchY * scaleY).coerceIn(0f, bitmap.height - 1f)

                    val (lab, hex) = sampler.sampleDominantColor(bitmap, bmpX, bmpY)
                    onColorSampled(lab, hex)
                }
            }
        }
    }

    // Initialize CameraX with dynamic display rotation handling
    LaunchedEffect(previewView, cameraFacing) {
        val pView = previewView ?: return@LaunchedEffect

        val providerFuture = ProcessCameraProvider.getInstance(context)
        providerFuture.addListener({
            val provider = providerFuture.get()
            cameraProvider = provider

            // Query dynamic display rotation
            val displayRotation = pView.display?.rotation ?: Surface.ROTATION_0

            // 1. Preview Use Case with target rotation
            val preview = Preview.Builder()
                .setTargetRotation(displayRotation)
                .build()
                .also {
                    it.setSurfaceProvider(pView.surfaceProvider)
                }
            previewUseCase = preview

            // 2. ImageAnalysis Use Case configured with same target rotation
            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetRotation(displayRotation)
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()
            imageAnalysisUseCase = imageAnalysis

            // 3. ImageCapture Use Case with same target rotation
            val imageCapture = ImageCapture.Builder()
                .setTargetRotation(displayRotation)
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()
            imageCaptureUseCase = imageCapture

            // Camera selector: back or front
            val cameraSelector = if (cameraFacing == CameraFacing.FRONT) {
                CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                CameraSelector.DEFAULT_BACK_CAMERA
            }

            try {
                provider.unbindAll()
                provider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis,
                    imageCapture
                )
            } catch (exc: Exception) {
                exc.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(context))
    }

    // Listen for device orientation / display rotation changes and update CameraX target rotations
    DisposableEffect(context, previewUseCase, imageAnalysisUseCase, imageCaptureUseCase) {
        val orientationEventListener = object : OrientationEventListener(context) {
            override fun onOrientationChanged(orientation: Int) {
                if (orientation == OrientationEventListener.ORIENTATION_UNKNOWN) return

                val rotation = when (orientation) {
                    in 45 until 135 -> Surface.ROTATION_270
                    in 135 until 225 -> Surface.ROTATION_180
                    in 225 until 315 -> Surface.ROTATION_90
                    else -> Surface.ROTATION_0
                }

                previewUseCase?.targetRotation = rotation
                imageAnalysisUseCase?.targetRotation = rotation
                imageCaptureUseCase?.targetRotation = rotation
            }
        }

        if (orientationEventListener.canDetectOrientation()) {
            orientationEventListener.enable()
        }

        onDispose {
            orientationEventListener.disable()
            cameraExecutor.shutdown()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = { offset ->
                        onTouchEvent(offset.x, offset.y, true)
                        sampleAtPoint(offset.x, offset.y)
                        tryAwaitRelease()
                        onTouchEvent(offset.x, offset.y, false)
                    }
                )
            }
            .pointerInput(Unit) {
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
                    // FILL_CENTER maintains full screen aspect without distortion
                    scaleType = PreviewView.ScaleType.FILL_CENTER
                    implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                    previewView = this
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}
