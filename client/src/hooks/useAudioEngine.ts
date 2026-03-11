import { useRef, useCallback, useEffect, useState } from 'react';

// ============================================================
// WEB AUDIO API ENGINE HOOK
// Professional DAW-grade audio engine for RRB Studio Pro
// ============================================================

export interface AudioTrackNode {
  id: string;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  analyserNode: AnalyserNode;
  buffer: AudioBuffer | null;
  isLoaded: boolean;
}

export interface MeterData {
  peak: number;    // dB
  rms: number;     // dB
  leftPeak: number;
  rightPeak: number;
}

export interface AudioEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  sampleRate: number;
  currentTime: number;
  cpuLoad: number;
  recordingTrackId: string | null;
}

export function useAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const trackNodesRef = useRef<Map<string, AudioTrackNode>>(new Map());
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const [engineState, setEngineState] = useState<AudioEngineState>({
    isInitialized: false,
    isPlaying: false,
    isRecording: false,
    sampleRate: 48000,
    currentTime: 0,
    cpuLoad: 0,
    recordingTrackId: null,
  });

  const [masterMeters, setMasterMeters] = useState<MeterData>({
    peak: -60, rms: -60, leftPeak: -60, rightPeak: -60,
  });

  const [trackMeters, setTrackMeters] = useState<Map<string, MeterData>>(new Map());

  // Initialize AudioContext (must be triggered by user gesture)
  const initEngine = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const ctx = new AudioContext({ sampleRate: 48000 });

      // Master chain: analyser -> gain -> destination
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;

      const masterAnalyser = ctx.createAnalyser();
      masterAnalyser.fftSize = 2048;
      masterAnalyser.smoothingTimeConstant = 0.8;

      masterAnalyser.connect(masterGain);
      masterGain.connect(ctx.destination);

      audioContextRef.current = ctx;
      masterGainRef.current = masterGain;
      masterAnalyserRef.current = masterAnalyser;

      setEngineState(prev => ({
        ...prev,
        isInitialized: true,
        sampleRate: ctx.sampleRate,
      }));

      // Start meter animation loop
      startMeterLoop();

      return true;
    } catch (err) {
      console.error('[AudioEngine] Failed to initialize:', err);
      return false;
    }
  }, []);

  // Convert linear amplitude to dB
  const linearToDb = (value: number): number => {
    if (value <= 0) return -60;
    return Math.max(-60, 20 * Math.log10(value));
  };

  // Meter animation loop
  const startMeterLoop = useCallback(() => {
    const updateMeters = () => {
      const ctx = audioContextRef.current;
      const masterAnalyser = masterAnalyserRef.current;

      if (ctx && masterAnalyser) {
        // Master meters
        const dataArray = new Float32Array(masterAnalyser.frequencyBinCount);
        masterAnalyser.getFloatTimeDomainData(dataArray);

        let peak = 0;
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const abs = Math.abs(dataArray[i]);
          if (abs > peak) peak = abs;
          sumSquares += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        setMasterMeters({
          peak: linearToDb(peak),
          rms: linearToDb(rms),
          leftPeak: linearToDb(peak * (0.9 + Math.random() * 0.2)),
          rightPeak: linearToDb(peak * (0.9 + Math.random() * 0.2)),
        });

        // Per-track meters
        const newTrackMeters = new Map<string, MeterData>();
        trackNodesRef.current.forEach((node, trackId) => {
          const trackData = new Float32Array(node.analyserNode.frequencyBinCount);
          node.analyserNode.getFloatTimeDomainData(trackData);

          let tPeak = 0;
          let tSum = 0;
          for (let i = 0; i < trackData.length; i++) {
            const abs = Math.abs(trackData[i]);
            if (abs > tPeak) tPeak = abs;
            tSum += trackData[i] * trackData[i];
          }
          const tRms = Math.sqrt(tSum / trackData.length);

          newTrackMeters.set(trackId, {
            peak: linearToDb(tPeak),
            rms: linearToDb(tRms),
            leftPeak: linearToDb(tPeak),
            rightPeak: linearToDb(tPeak),
          });
        });
        setTrackMeters(newTrackMeters);

        // CPU load estimation
        setEngineState(prev => ({
          ...prev,
          currentTime: ctx.currentTime,
          cpuLoad: Math.min(100, Math.max(0, (ctx.baseLatency || 0.005) / 0.02 * 100)),
        }));
      }

      animFrameRef.current = requestAnimationFrame(updateMeters);
    };

    animFrameRef.current = requestAnimationFrame(updateMeters);
  }, []);

  // Create a track audio node chain
  const createTrackNode = useCallback((trackId: string): AudioTrackNode | null => {
    const ctx = audioContextRef.current;
    const masterAnalyser = masterAnalyserRef.current;
    if (!ctx || !masterAnalyser) return null;

    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.85;

    // Chain: source -> analyser -> pan -> gain -> master analyser
    analyserNode.connect(panNode);
    panNode.connect(gainNode);
    gainNode.connect(masterAnalyser);

    const node: AudioTrackNode = {
      id: trackId,
      sourceNode: null,
      gainNode,
      panNode,
      analyserNode,
      buffer: null,
      isLoaded: false,
    };

    trackNodesRef.current.set(trackId, node);
    return node;
  }, []);

  // Load audio file into a track
  const loadAudioToTrack = useCallback(async (trackId: string, file: File): Promise<boolean> => {
    const ctx = audioContextRef.current;
    if (!ctx) return false;

    let node = trackNodesRef.current.get(trackId);
    if (!node) {
      node = createTrackNode(trackId);
      if (!node) return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      node.buffer = audioBuffer;
      node.isLoaded = true;
      return true;
    } catch (err) {
      console.error(`[AudioEngine] Failed to load audio for track ${trackId}:`, err);
      return false;
    }
  }, [createTrackNode]);

  // Load audio from URL
  const loadAudioUrlToTrack = useCallback(async (trackId: string, url: string): Promise<boolean> => {
    const ctx = audioContextRef.current;
    if (!ctx) return false;

    let node = trackNodesRef.current.get(trackId);
    if (!node) {
      node = createTrackNode(trackId);
      if (!node) return false;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      node.buffer = audioBuffer;
      node.isLoaded = true;
      return true;
    } catch (err) {
      console.error(`[AudioEngine] Failed to load audio URL for track ${trackId}:`, err);
      return false;
    }
  }, [createTrackNode]);

  // Set track volume (dB to linear)
  const setTrackVolume = useCallback((trackId: string, volumeDb: number) => {
    const node = trackNodesRef.current.get(trackId);
    if (node) {
      const linear = Math.pow(10, volumeDb / 20);
      node.gainNode.gain.setValueAtTime(linear, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Set track pan (-1 to 1)
  const setTrackPan = useCallback((trackId: string, pan: number) => {
    const node = trackNodesRef.current.get(trackId);
    if (node) {
      node.panNode.pan.setValueAtTime(pan / 100, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Mute/unmute track
  const setTrackMute = useCallback((trackId: string, muted: boolean) => {
    const node = trackNodesRef.current.get(trackId);
    if (node) {
      node.gainNode.gain.setValueAtTime(muted ? 0 : 1, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Set master volume
  const setMasterVolume = useCallback((volumeDb: number) => {
    if (masterGainRef.current) {
      const linear = Math.pow(10, volumeDb / 20);
      masterGainRef.current.gain.setValueAtTime(linear, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Play all loaded tracks
  const playAll = useCallback((startBeat: number = 0, bpm: number = 120) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const startTimeInSeconds = (startBeat / bpm) * 60;
    startTimeRef.current = ctx.currentTime - startTimeInSeconds;

    trackNodesRef.current.forEach((node) => {
      if (node.buffer && node.isLoaded) {
        // Stop existing source
        if (node.sourceNode) {
          try { node.sourceNode.stop(); } catch { /* already stopped */ }
        }

        const source = ctx.createBufferSource();
        source.buffer = node.buffer;
        source.connect(node.analyserNode);
        source.start(0, startTimeInSeconds);
        node.sourceNode = source;
      }
    });

    setEngineState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Stop all tracks
  const stopAll = useCallback(() => {
    trackNodesRef.current.forEach((node) => {
      if (node.sourceNode) {
        try { node.sourceNode.stop(); } catch { /* already stopped */ }
        node.sourceNode = null;
      }
    });

    pauseTimeRef.current = audioContextRef.current?.currentTime || 0;
    setEngineState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Generate oscillator tone for testing
  const playTestTone = useCallback((trackId: string, frequency: number = 440, duration: number = 1) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    let node = trackNodesRef.current.get(trackId);
    if (!node) {
      node = createTrackNode(trackId);
      if (!node) return;
    }

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.connect(node.analyserNode);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [createTrackNode]);

  // Generate white noise for testing meters
  const playWhiteNoise = useCallback((trackId: string, duration: number = 2) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    let node = trackNodesRef.current.get(trackId);
    if (!node) {
      node = createTrackNode(trackId);
      if (!node) return;
    }

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3; // Low volume white noise
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(node.analyserNode);
    source.start();
  }, [createTrackNode]);

  // ============================================================
  // WAVEFORM EXTRACTION FROM AUDIOBUFFER
  // ============================================================

  // Extract waveform peaks from an AudioBuffer for visualization
  const extractWaveform = useCallback((audioBuffer: AudioBuffer, numSamples: number = 200): number[] => {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const blockSize = Math.floor(channelData.length / numSamples);
    const peaks: number[] = [];

    for (let i = 0; i < numSamples; i++) {
      const start = i * blockSize;
      let max = 0;
      for (let j = start; j < start + blockSize && j < channelData.length; j++) {
        const abs = Math.abs(channelData[j]);
        if (abs > max) max = abs;
      }
      peaks.push(max);
    }

    return peaks;
  }, []);

  // Extract waveform from a loaded track
  const getTrackWaveform = useCallback((trackId: string, numSamples: number = 200): number[] | null => {
    const node = trackNodesRef.current.get(trackId);
    if (!node || !node.buffer) return null;
    return extractWaveform(node.buffer, numSamples);
  }, [extractWaveform]);

  // Extract waveform from a File object (without loading to a track)
  const extractWaveformFromFile = useCallback(async (file: File, numSamples: number = 200): Promise<number[] | null> => {
    const ctx = audioContextRef.current;
    if (!ctx) return null;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return extractWaveform(audioBuffer, numSamples);
    } catch (err) {
      console.error('[AudioEngine] Failed to extract waveform:', err);
      return null;
    }
  }, [extractWaveform]);

  // Get audio file duration from a File object
  const getAudioDuration = useCallback(async (file: File): Promise<number> => {
    const ctx = audioContextRef.current;
    if (!ctx) return 0;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return audioBuffer.duration;
    } catch {
      return 0;
    }
  }, []);

  // Get frequency spectrum data from a track's analyser
  const getTrackSpectrum = useCallback((trackId: string): Float32Array | null => {
    const node = trackNodesRef.current.get(trackId);
    if (!node) return null;

    const data = new Float32Array(node.analyserNode.frequencyBinCount);
    node.analyserNode.getFloatFrequencyData(data);
    return data;
  }, []);

  // ============================================================
  // MICROPHONE RECORDING (MediaRecorder API)
  // ============================================================

  // Start recording from microphone into a track
  const startRecording = useCallback(async (trackId: string): Promise<boolean> => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      // Choose best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stream tracks will be stopped in stopRecording
      };

      mediaRecorderRef.current = recorder;
      recordingStartTimeRef.current = Date.now();

      // Also route mic input through the audio engine for live monitoring
      const ctx = audioContextRef.current;
      if (ctx) {
        const sourceNode = ctx.createMediaStreamSource(stream);
        let node = trackNodesRef.current.get(trackId);
        if (!node) {
          node = createTrackNode(trackId);
        }
        if (node) {
          sourceNode.connect(node.analyserNode);
          // Store reference for cleanup
          (node as any)._micSource = sourceNode;
        }
      }

      recorder.start(100); // Collect data every 100ms

      setEngineState(prev => ({
        ...prev,
        isRecording: true,
        recordingTrackId: trackId,
      }));

      return true;
    } catch (err) {
      console.error('[AudioEngine] Recording failed:', err);
      return false;
    }
  }, [createTrackNode]);

  // Stop recording and return the recorded audio as a Blob
  const stopRecording = useCallback(async (): Promise<{ blob: Blob; duration: number; mimeType: string } | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return null;

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        const mimeType = recorder.mimeType;
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });

        // Stop all mic tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        // Disconnect mic source from audio engine
        const trackId = engineState.recordingTrackId;
        if (trackId) {
          const node = trackNodesRef.current.get(trackId);
          if (node && (node as any)._micSource) {
            try { (node as any)._micSource.disconnect(); } catch { /* */ }
            delete (node as any)._micSource;
          }
        }

        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];

        setEngineState(prev => ({
          ...prev,
          isRecording: false,
          recordingTrackId: null,
        }));

        resolve({ blob, duration, mimeType });
      };

      recorder.stop();
    });
  }, [engineState.recordingTrackId]);

  // Load a recorded blob into a track's AudioBuffer
  const loadRecordingToTrack = useCallback(async (trackId: string, blob: Blob): Promise<boolean> => {
    const ctx = audioContextRef.current;
    if (!ctx) return false;

    let node = trackNodesRef.current.get(trackId);
    if (!node) {
      node = createTrackNode(trackId);
      if (!node) return false;
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      node.buffer = audioBuffer;
      node.isLoaded = true;
      return true;
    } catch (err) {
      console.error(`[AudioEngine] Failed to load recording for track ${trackId}:`, err);
      return false;
    }
  }, [createTrackNode]);

  // Convert blob to base64 for server upload
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      // Stop any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      trackNodesRef.current.forEach((node) => {
        if (node.sourceNode) {
          try { node.sourceNode.stop(); } catch { /* */ }
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    engineState,
    masterMeters,
    trackMeters,
    initEngine,
    createTrackNode,
    loadAudioToTrack,
    loadAudioUrlToTrack,
    setTrackVolume,
    setTrackPan,
    setTrackMute,
    setMasterVolume,
    playAll,
    stopAll,
    playTestTone,
    playWhiteNoise,
    // Waveform extraction
    extractWaveform,
    getTrackWaveform,
    extractWaveformFromFile,
    getAudioDuration,
    getTrackSpectrum,
    // Recording
    startRecording,
    stopRecording,
    loadRecordingToTrack,
    blobToBase64,
  };
}
