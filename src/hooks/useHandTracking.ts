import { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackingState } from '../types/gestures';
import { recognizeGesture } from '../utils/gestureRecognizer';

export function useHandTracking() {
  const [state, setState] = useState<HandTrackingState>({
    isReady: false,
    isLoading: false,
    hasPermission: false,
    isCameraActive: false,
    error: null,
    landmarks: null,
    fingertip: null,
    activeGesture: 'idle',
    confidence: 0,
    fps: 0,
    isPinching: false,
    pinchDistance: 1,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastFpsTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Initialize MediaPipe Vision HandLandmarker
  const initLandmarker = useCallback(async (): Promise<boolean> => {
    if (landmarkerRef.current) return true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Try local wasm first, then fallback to CDN
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch {
        console.warn('Local wasm failed, trying CDN fallback...');
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      // 2. Try local model, then fallback to CDN
      let landmarker: HandLandmarker;
      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch {
        console.warn('Local model failed, loading from Google Cloud...');
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      landmarkerRef.current = landmarker;
      setState(prev => ({ ...prev, isReady: true, isLoading: false }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize hand detection model';
      console.error('Landmarker initialization error:', err);
      setState(prev => ({ ...prev, isLoading: false, error: msg }));
      return false;
    }
  }, []);

  // Frame processing loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const startTimeMs = performance.now();

      try {
        const results = landmarker.detectForVideo(video, startTimeMs);

        // Calculate FPS
        frameCountRef.current++;
        const now = performance.now();
        let currentFps = state.fps;
        if (now - lastFpsTimeRef.current >= 500) {
          currentFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }

        if (results.landmarks && results.landmarks.length > 0) {
          const rawLandmarks = results.landmarks[0];
          // Mirror x coordinate for natural user perspective
          const landmarks = rawLandmarks.map(lm => ({
            x: 1 - lm.x, // Invert horizontal coordinate
            y: lm.y,
            z: lm.z,
          }));

          const gestureResult = recognizeGesture(landmarks);

          setState(prev => ({
            ...prev,
            landmarks,
            fingertip: gestureResult.fingertip,
            activeGesture: gestureResult.gesture,
            confidence: gestureResult.confidence,
            isPinching: gestureResult.isPinching,
            pinchDistance: gestureResult.pinchDistance,
            fps: currentFps,
          }));
        } else {
          // Hand not detected in frame
          setState(prev => ({
            ...prev,
            landmarks: null,
            fingertip: null,
            activeGesture: 'idle',
            confidence: 0,
            fps: currentFps,
          }));
        }
      } catch (e) {
        console.warn('Frame detection skipped:', e);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, [state.fps]);

  // Start webcam
  const startCamera = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Ensure model is ready
    const ready = await initLandmarker();
    if (!ready) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({
        ...prev,
        hasPermission: true,
        isCameraActive: true,
        isLoading: false,
      }));

      // Begin animation loop
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    } catch (err: unknown) {
      let errorMessage = 'Could not access camera.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission was denied. Please allow camera access in your browser address bar.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera device found on this system.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is currently in use by another application.';
        }
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        isCameraActive: false,
        error: errorMessage,
      }));
    }
  }, [initLandmarker, processFrame]);

  // Stop webcam and release resources
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({
      ...prev,
      isCameraActive: false,
      landmarks: null,
      fingertip: null,
      activeGesture: 'idle',
      fps: 0,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, [stopCamera]);

  return {
    state,
    videoRef,
    startCamera,
    stopCamera,
  };
}
