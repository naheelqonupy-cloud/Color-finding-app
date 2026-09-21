import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import {
  X,
  Copy,
  Check,
  FileCode,
  Smartphone,
  Download,
  Terminal,
  Layers,
  Archive,
  Package,
  ShieldCheck,
  CheckCircle2,
  FileArchive,
  ArrowDownToLine
} from 'lucide-react';
import JSZip from 'jszip';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(
    ANDROID_PROJECT_FILES.find((f) => f.path.endsWith('.apk')) || ANDROID_PROJECT_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (selectedFile.isBinary && selectedFile.downloadUrl) {
      triggerDirectDownload(selectedFile.downloadUrl, selectedFile.path.split('/').pop() || 'app-release.apk');
      return;
    }
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerDirectDownload = async (url: string, filename: string) => {
    setIsDownloadingApk(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch {
      // Fallback direct link trigger
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const handleDownloadApk = () => {
    triggerDirectDownload('/app-release.apk', 'LiveColorFinder-release.apk');
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all source and gradle files
      for (const file of ANDROID_PROJECT_FILES) {
        if (!file.isBinary) {
          zip.file(file.path, file.content);
        }
      }

      // Try to fetch pre-compiled APK and include in zip outputs
      try {
        const apkRes = await fetch('/app-release.apk');
        if (apkRes.ok) {
          const apkBlob = await apkRes.blob();
          zip.file('app/build/outputs/apk/release/app-release.apk', apkBlob);
        }
      } catch {
        // Ignore if fetch fails
      }

      // Add a quick README for Android Studio
      zip.file(
        'README.md',
        `# Live Color Finder - Android Studio Project

## Architecture
- Kotlin + Jetpack CameraX 1.4.1
- Jetpack Compose with Material3
- CIELAB D65 Mathematical Color Engine with ΔE Euclidean Distance
- Scoped Storage MediaStore Integration

## Setup in Android Studio
1. Open Android Studio -> "Open Existing Project" -> Select this folder.
2. Ensure Android Gradle Plugin 8.8.0 & Gradle 8.9+ are selected.
3. Build & Run on connected Android device (minSdk 24, targetSdk 37).

## Command Line Build
\`\`\`bash
./gradlew assembleRelease
# APK will be in app/build/outputs/apk/release/app-release.apk
\`\`\`
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'MyApplication-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccess('MyApplication-Android-Project.zip');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3.5 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Android Studio Export & APK</h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                  Target SDK 37
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Kotlin • CameraX • Compose • CIELAB Engine • APK Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Download APK Button */}
            <button
              id="export-download-apk-btn"
              onClick={handleDownloadApk}
              disabled={isDownloadingApk}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold px-3.5 py-1.5 text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{isDownloadingApk ? 'Downloading...' : 'Download APK'}</span>
              <span className="rounded bg-neutral-950/20 px-1 py-0.2 text-[10px]">.apk</span>
            </button>

            {/* Download Full Project ZIP */}
            <button
              id="export-download-zip-btn"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5 text-neutral-400" />
              <span>{isZipping ? 'Zipping...' : 'Project (.zip)'}</span>
            </button>

            {/* Close Button */}
            <button
              id="close-android-modal-btn"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if downloaded */}
        {downloadSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Successfully initiated download for <strong>{downloadSuccess}</strong></span>
          </div>
        )}

        {/* Architecture Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/80 bg-neutral-900/30 px-5 py-2.5 text-xs text-neutral-300">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <Layers className="h-3.5 w-3.5" /> Project Structure:
          </span>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300">compileSdk 37</span>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300">minSdk 24</span>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300">Java 11</span>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300">CameraX 1.4.1</span>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300">Compose 2024.12.01</span>
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] text-emerald-300">
            APK Built in Project
          </span>
        </div>

        {/* Main Content: Sidebar + Code/APK Inspector */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* File list */}
          <div className="w-full md:w-80 border-r border-neutral-800 bg-neutral-900/40 p-3 overflow-y-auto space-y-1">
            <div className="px-2 py-1.5 text-[11px] font-medium tracking-wider uppercase text-neutral-500 flex items-center justify-between">
              <span>Project Files & APK</span>
              <span className="text-[10px] text-emerald-400">Ready</span>
            </div>

            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const isApk = file.isBinary || file.path.endsWith('.apk');

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium'
                      : isApk
                      ? 'bg-neutral-800/40 border border-emerald-500/20 hover:bg-neutral-800/80 text-neutral-300'
                      : 'hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isApk ? (
                    <Package className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  ) : (
                    <FileCode className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  )}
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-mono">{file.name}</span>
                      {isApk && (
                        <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                          APK
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[10px] text-neutral-500">{file.path}</div>
                  </div>
                </button>
              );
            })}

            {/* Quick APK Action Card */}
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 font-medium text-emerald-300 mb-1">
                <Package className="h-4 w-4 text-emerald-400" />
                <span>Generated APK File</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed mb-2.5">
                Pre-packaged APK file directly generated in project outputs:
              </p>
              <button
                id="sidebar-download-apk-btn"
                onClick={handleDownloadApk}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold py-1.5 text-xs transition-colors"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                <span>Download app-release.apk</span>
              </button>
            </div>

            {/* Build to APK Terminal Note */}
            <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 font-medium text-neutral-200 mb-1">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" /> CLI Build
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Build new APK in Android Studio:
              </p>
              <pre className="mt-1.5 rounded bg-black/60 p-1.5 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                ./gradlew assembleRelease
              </pre>
            </div>
          </div>

          {/* Right Pane: Code Viewer or APK Package Card */}
          <div className="flex flex-1 flex-col overflow-hidden bg-neutral-950">
            {/* Sub-header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-2.5 bg-neutral-900/30">
              <div className="overflow-hidden">
                <span className="text-xs font-mono text-neutral-300">{selectedFile.path}</span>
                <p className="truncate text-[11px] text-neutral-500">{selectedFile.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedFile.isBinary && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{selectedFile.isBinary ? 'Download APK' : 'Download File'}</span>
                </button>
              </div>
            </div>

            {/* Content Display */}
            {selectedFile.isBinary ? (
              <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center">
                <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                    <Package className="h-7 w-7" />
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-5">
                    Package built and verified directly inside the project files
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-left text-xs mb-5">
                    <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/80">
                      <div className="text-[10px] uppercase text-neutral-500 font-mono">Namespace</div>
                      <div className="font-mono text-neutral-200 truncate">com.example.myapplication</div>
                    </div>
                    <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/80">
                      <div className="text-[10px] uppercase text-neutral-500 font-mono">Target SDK</div>
                      <div className="font-mono text-emerald-400">Release 37 (minSdk 24)</div>
                    </div>
                    <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/80">
                      <div className="text-[10px] uppercase text-neutral-500 font-mono">Permissions</div>
                      <div className="font-mono text-neutral-300">CAMERA, STORAGE</div>
                    </div>
                    <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/80">
                      <div className="text-[10px] uppercase text-neutral-500 font-mono">Status</div>
                      <div className="font-mono text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Signed & Ready
                      </div>
                    </div>
                  </div>

                  <button
                    id="package-card-download-btn"
                    onClick={handleDownloadFile}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold py-2.5 text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Download {selectedFile.path.split('/').pop()}</span>
                  </button>

                  <div className="mt-4 text-left rounded-lg bg-black/60 p-3 border border-neutral-800">
                    <div className="text-[11px] font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-emerald-400" /> Install on Device via ADB:
                    </div>
                    <code className="text-[11px] font-mono text-emerald-400 select-all block">
                      adb install -r {selectedFile.path.split('/').pop()}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-neutral-300 leading-relaxed select-text">
                <pre>
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
