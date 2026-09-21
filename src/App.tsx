import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CameraMode,
  CapturedPhoto,
  FilterSettings,
  SelectedColorData,
  TouchLoupeState,
} from './types';
import { calculateRobustDominantColor, rgbToLab } from './utils/colorConversion';
import { WebglProcessor } from './utils/webglProcessor';
import { TEST_SCENES } from './utils/testScenes';
import { playShutterSound } from './utils/shutterAudio';
import { MagnifierLoupe } from './components/MagnifierLoupe';
import { TopBarOverlay } from './components/TopBarOverlay';
import { BottomControlsOverlay } from './components/BottomControlsOverlay';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { ManualColorModal } from './components/ManualColorModal';
import { Camera, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  // Camera & Stream states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isSimulatedScene, setIsSimulatedScene] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Color Finder states
  const [selectedColor, setSelectedColor] = useState<SelectedColorData | null>(null);
  const [isColorLocked, setIsColorLocked] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('NORMAL');
  const [settings, setSettings] = useState<FilterSettings>({
    specificity: 50,
    saturation: 1.0,
    morphologicalSmoothing: true,
  });

  // Touch Loupe inspection state
  const [touchState, setTouchState] = useState<TouchLoupeState>({
    active: false,
    screenX: 0,
    screenY: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
    currentColor: null,
    sampleBuffer: null,
  });

  // Photo capture & storage
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Modals
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isManualColorModalOpen, setIsManualColorModalOpen] = useState(false);

  // Apply manual HEX / RGB color
  const handleApplyManualColor = useCallback((colorData: SelectedColorData) => {
    setSelectedColor(colorData);
    setIsColorLocked(true);
    if (renderParamsRef.current) {
      renderParamsRef.current.selectedColor = colorData;
    }
  }, []);

  // DOM Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const testSceneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webglProcessorRef = useRef<WebglProcessor | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Performance synchronization refs to decouple 60fps render loop from React state updates
  const isColorLockedRef = useRef(isColorLocked);
  useEffect(() => {
    isColorLockedRef.current = isColorLocked;
  }, [isColorLocked]);

  const touchStateRef = useRef(touchState);
  useEffect(() => {
    touchStateRef.current = touchState;
  }, [touchState]);

  const renderParamsRef = useRef({
    cameraMode,
    selectedColor,
    settings,
    isSimulatedScene,
    currentSceneIndex,
    facingMode,
  });

  // Keep render loop parameters updated without tearing down the animation frame
  useEffect(() => {
    renderParamsRef.current = {
      cameraMode,
      selectedColor,
      settings,
      isSimulatedScene,
      currentSceneIndex,
      facingMode,
    };
  }, [cameraMode, selectedColor, settings, isSimulatedScene, currentSceneIndex, facingMode]);

  // Pointer throttle refs
  const pendingPointerCoordRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const pointerRafIdRef = useRef<number | null>(null);

  // Initialize WebGL Processor
  useEffect(() => {
    if (glCanvasRef.current && !webglProcessorRef.current) {
      webglProcessorRef.current = new WebglProcessor(glCanvasRef.current);
    }
    return () => {
      if (webglProcessorRef.current) {
        webglProcessorRef.current.destroy();
        webglProcessorRef.current = null;
      }
    };
  }, []);

  // Check available camera devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported by this browser environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setIsSimulatedScene(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera';
      console.warn('Camera initialization error:', msg);
      setCameraError(msg);
      setCameraActive(false);
      // Fallback automatically to high fidelity simulated scene
      setIsSimulatedScene(true);
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  // Switch rear/front camera
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle simulated test scenes
  const handleToggleSimulatedScene = () => {
    if (isSimulatedScene) {
      // Cycle through test scenes, or switch back to real camera if it was working
      if (cameraActive) {
        setIsSimulatedScene(false);
      } else {
        setCurrentSceneIndex((prev) => (prev + 1) % TEST_SCENES.length);
      }
    } else {
      setIsSimulatedScene(true);
    }
  };

  // Extract a 21x21 pixel sample underneath touch coordinates
  const sampleColorAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;

      const normX = Math.max(0, Math.min(1, screenX / rect.width));
      const normY = Math.max(0, Math.min(1, screenY / rect.height));

      // Source dimensions
      let sourceWidth = 1280;
      let sourceHeight = 720;
      let sourceCanvasOrVideo: CanvasImageSource | null = null;

      if (isSimulatedScene && testSceneCanvasRef.current) {
        sourceWidth = testSceneCanvasRef.current.width;
        sourceHeight = testSceneCanvasRef.current.height;
        sourceCanvasOrVideo = testSceneCanvasRef.current;
      } else if (videoRef.current && videoRef.current.videoWidth > 0) {
        sourceWidth = videoRef.current.videoWidth;
        sourceHeight = videoRef.current.videoHeight;
        sourceCanvasOrVideo = videoRef.current;
      }

      if (!sourceCanvasOrVideo) return null;

      // Handle object-cover crop math
      const containerAspect = rect.width / rect.height;
      const sourceAspect = sourceWidth / sourceHeight;

      let renderedW = sourceWidth;
      let renderedH = sourceHeight;
      let cropX = 0;
      let cropY = 0;

      if (containerAspect > sourceAspect) {
        // Container is wider than source -> crop top/bottom
        renderedH = sourceWidth / containerAspect;
        cropY = (sourceHeight - renderedH) / 2;
      } else {
        // Container is taller than source -> crop left/right
        renderedW = sourceHeight * containerAspect;
        cropX = (sourceWidth - renderedW) / 2;
      }

      const isMirrored = facingMode === 'user' && !isSimulatedScene;
      const sampleNormX = isMirrored ? 1 - normX : normX;

      const sourceTargetX = cropX + sampleNormX * renderedW;
      const sourceTargetY = cropY + normY * renderedH;

      // 21x21 sampling region
      const sampleSize = 21;
      const halfSample = Math.floor(sampleSize / 2);

      let sampleCanvas = sampleCanvasRef.current;
      if (!sampleCanvas) {
        sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        sampleCanvasRef.current = sampleCanvas;
      }

      const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (!sCtx) return null;

      sCtx.imageSmoothingEnabled = false;
      sCtx.clearRect(0, 0, sampleSize, sampleSize);

      if (isMirrored) {
        sCtx.save();
        sCtx.translate(sampleSize, 0);
        sCtx.scale(-1, 1);
        sCtx.drawImage(
          sourceCanvasOrVideo,
          sourceTargetX - halfSample,
          sourceTargetY - halfSample,
          sampleSize,
          sampleSize,
          0,
          0,
          sampleSize,
          sampleSize
        );
        sCtx.restore();
      } else {
        sCtx.drawImage(
          sourceCanvasOrVideo,
          sourceTargetX - halfSample,
          sourceTargetY - halfSample,
          sampleSize,
          sampleSize,
          0,
          0,
          sampleSize,
          sampleSize
        );
      }

      const imgData = sCtx.getImageData(0, 0, sampleSize, sampleSize);
      const colorData = calculateRobustDominantColor(imgData, sampleSize);

      return {
        colorData,
        sampleBuffer: imgData,
        screenX,
        screenY,
        normX,
        normY,
      };
    },
    [isSimulatedScene, facingMode]
  );

  // Touch Handlers for Magnifier Loupe & Color Picking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only inspect if touching the camera background directly
    if ((e.target as HTMLElement).closest('button, input, footer, header')) {
      return;
    }

    const sample = sampleColorAtPoint(e.clientX, e.clientY);
    if (!sample) return;

    // Show loupe
    setTouchState({
      active: true,
      screenX: sample.screenX,
      screenY: sample.screenY,
      normalizedX: sample.normX,
      normalizedY: sample.normY,
      currentColor: sample.colorData,
      sampleBuffer: sample.sampleBuffer,
    });

    if (!isColorLockedRef.current) {
      renderParamsRef.current.selectedColor = sample.colorData;
      setSelectedColor(sample.colorData);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStateRef.current.active) return;

    // Record latest pointer coordinates and throttle pixel sampling to animation frame rate
    pendingPointerCoordRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (!pointerRafIdRef.current) {
      pointerRafIdRef.current = requestAnimationFrame(() => {
        pointerRafIdRef.current = null;
        const coords = pendingPointerCoordRef.current;
        if (!coords || !touchStateRef.current.active) return;

        const sample = sampleColorAtPoint(coords.clientX, coords.clientY);
        if (!sample) return;

        setTouchState({
          active: true,
          screenX: sample.screenX,
          screenY: sample.screenY,
          normalizedX: sample.normX,
          normalizedY: sample.normY,
          currentColor: sample.colorData,
          sampleBuffer: sample.sampleBuffer,
        });

        if (!isColorLockedRef.current) {
          renderParamsRef.current.selectedColor = sample.colorData;
          setSelectedColor(sample.colorData);
        }
      });
    }
  };

  const handlePointerUp = () => {
    if (pointerRafIdRef.current) {
      cancelAnimationFrame(pointerRafIdRef.current);
      pointerRafIdRef.current = null;
    }

    if (touchStateRef.current.active) {
      // Keep last selected color
      if (touchStateRef.current.currentColor && !isColorLockedRef.current) {
        renderParamsRef.current.selectedColor = touchStateRef.current.currentColor;
        setSelectedColor(touchStateRef.current.currentColor);
      }
      setTouchState((prev) => ({ ...prev, active: false }));
    }
  };

  // Continuous 60fps WebGL render loop (decoupled from UI slider events to ensure butter-smooth preview)
  useEffect(() => {
    const renderLoop = (time: number) => {
      const processor = webglProcessorRef.current;
      const container = containerRef.current;
      const params = renderParamsRef.current;

      if (processor && container) {
        const targetW = container.clientWidth || 640;
        const targetH = container.clientHeight || 480;

        if (params.isSimulatedScene) {
          // Render current dynamic test scene
          let sceneCanvas = testSceneCanvasRef.current;
          if (!sceneCanvas) {
            sceneCanvas = document.createElement('canvas');
            sceneCanvas.width = 960;
            sceneCanvas.height = 1280;
            testSceneCanvasRef.current = sceneCanvas;
          }

          const sCtx = sceneCanvas.getContext('2d');
          if (sCtx) {
            const currentScene = TEST_SCENES[params.currentSceneIndex % TEST_SCENES.length];
            currentScene.render(sCtx, sceneCanvas.width, sceneCanvas.height, time);

            processor.render(
              sceneCanvas,
              targetW,
              targetH,
              params.cameraMode,
              params.selectedColor ? params.selectedColor.lab : null,
              params.settings,
              false
            );
          }
        } else if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          videoRef.current.videoWidth > 0
        ) {
          const isMirrored = params.facingMode === 'user';
          processor.render(
            videoRef.current,
            targetW,
            targetH,
            params.cameraMode,
            params.selectedColor ? params.selectedColor.lab : null,
            params.settings,
            isMirrored
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pointerRafIdRef.current) {
        cancelAnimationFrame(pointerRafIdRef.current);
      }
    };
  }, []);

  // Initial preset color if none selected
  useEffect(() => {
    if (!selectedColor) {
      const defaultRgb = { r: 59, g: 130, b: 246 }; // Vivid Azure
      setSelectedColor({
        rgb: defaultRgb,
        lab: rgbToLab(defaultRgb),
        hex: '#3B82F6',
        name: 'Cobalt Blue',
        confidence: 1.0,
      });
    }
  }, [selectedColor]);

  // Take photo & save to MediaStore / Device
  const handleCapturePhoto = () => {
    if (isCapturing || !glCanvasRef.current) return;
    setIsCapturing(true);

    // Audio & Flash feedback
    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 140);

    try {
      const dataUrl = glCanvasRef.current.toDataURL('image/jpeg', 0.95);
      const newPhoto: CapturedPhoto = {
        id: `photo_${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        mode: cameraMode,
        targetColorHex: selectedColor ? selectedColor.hex : null,
      };

      setPhotos((prev) => [newPhoto, ...prev]);

      // Automatically trigger download/save to user's device photo directory
      const a = document.createElement('a');
      a.href = dataUrl;
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `LiveColorFinder_${dateStr}.jpg`;
      a.click();
    } catch (e) {
      console.error('Failed to capture photo:', e);
    } finally {
      setTimeout(() => setIsCapturing(false), 300);
    }
  };

  const handleToggleLock = () => {
    setIsColorLocked((prev) => !prev);
  };

  const handleToggleMode = () => {
    setCameraMode((prev) => (prev === 'NORMAL' ? 'FIND_COLOR' : 'NORMAL'));
  };

  const handleUpdateSettings = (newSettings: Partial<FilterSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoForView?.id === id) {
      setSelectedPhotoForView(null);
    }
  };

  return (
    <div
      id="camera-color-picker-root"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative h-screen w-screen overflow-hidden bg-black select-none touch-none"
    >
      {/* Hidden Live Video Element */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="hidden"
      />

      {/* Full-Screen WebGL Processed Canvas */}
      <canvas
        id="camera-gl-canvas"
        ref={glCanvasRef}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Shutter Flash Animation */}
      {shutterFlash && (
        <div className="pointer-events-none absolute inset-0 z-40 bg-white transition-opacity duration-100 ease-out" />
      )}

      {/* Magnifier Loupe Floating above Finger */}
      {containerRef.current && (
        <MagnifierLoupe
          touchState={touchState}
          containerWidth={containerRef.current.clientWidth || 360}
          containerHeight={containerRef.current.clientHeight || 640}
        />
      )}

      {/* Top Bar Overlay */}
      <TopBarOverlay
        selectedColor={selectedColor}
        isColorLocked={isColorLocked}
        onToggleLock={handleToggleLock}
        onSwitchCamera={handleSwitchCamera}
        isSimulatedScene={isSimulatedScene}
        onToggleSimulatedScene={handleToggleSimulatedScene}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenManualColorModal={() => setIsManualColorModalOpen(true)}
        hasMultipleCameras={hasMultipleCameras}
      />

      {/* Camera Mode Indicator Banner in FIND_COLOR mode */}
      {cameraMode === 'FIND_COLOR' && (
        <div className="pointer-events-none absolute top-16 left-0 right-0 z-20 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-black/60 px-3.5 py-1 text-xs text-emerald-300 backdrop-blur-md shadow-lg animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Finding matching colors • Background converted to grayscale</span>
          </div>
        </div>
      )}

      {/* Camera Permission / Fallback Notice (if camera is inactive) */}
      {!cameraActive && isSimulatedScene && (
        <div className="pointer-events-auto absolute top-28 left-4 right-4 z-20 mx-auto max-w-sm rounded-xl border border-neutral-700/80 bg-black/75 p-3 text-xs text-neutral-300 backdrop-blur-md shadow-xl">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-white">Using Interactive Test Feed</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Physical camera is unavailable or permission denied. You can test color sampling, loupe magnification, specificity matching, and photo capture on this simulated scene!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="flex items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-[11px] text-white hover:bg-neutral-700"
                >
                  <RefreshCw className="h-3 w-3" /> Retry Camera
                </button>
                <button
                  onClick={handleToggleSimulatedScene}
                  className="rounded bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/30"
                >
                  Next Scene ({currentSceneIndex + 1}/{TEST_SCENES.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <BottomControlsOverlay
        mode={cameraMode}
        onToggleMode={handleToggleMode}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onCapturePhoto={handleCapturePhoto}
        hasTargetColor={selectedColor !== null}
        isCapturing={isCapturing}
        lastPhotoThumb={photos[0]?.dataUrl}
        onViewLastPhoto={() => photos[0] && setSelectedPhotoForView(photos[0])}
      />

      {/* Android Studio Native Project Modal */}
      <AndroidProjectModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        photo={selectedPhotoForView}
        onClose={() => setSelectedPhotoForView(null)}
        onDelete={handleDeletePhoto}
      />

      {/* Manual Color Code Input Modal */}
      <ManualColorModal
        isOpen={isManualColorModalOpen}
        onClose={() => setIsManualColorModalOpen(false)}
        onApplyColor={handleApplyManualColor}
        currentColorHex={selectedColor?.hex || '#7A5238'}
      />
    </div>
  );
}
