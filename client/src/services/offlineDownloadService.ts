/**
 * Offline Download Service
 * Handles downloading episodes for offline listening using IndexedDB
 */

interface DownloadedEpisode {
  id: string;
  title: string;
  artist: string;
  streamUrl: string;
  audioData: ArrayBuffer;
  downloadedAt: number;
  duration: number;
  size: number;
}

interface DownloadProgress {
  episodeId: string;
  progress: number; // 0-100
  status: "pending" | "downloading" | "completed" | "failed";
  error?: string;
}

const DB_NAME = "RockinBoogieOffline";
const STORE_NAME = "episodes";
const PROGRESS_STORE = "downloadProgress";

let db: IDBDatabase | null = null;
const downloadProgress = new Map<string, DownloadProgress>();

/**
 * Initialize IndexedDB
 */
export async function initializeOfflineDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(PROGRESS_STORE)) {
        database.createObjectStore(PROGRESS_STORE, { keyPath: "episodeId" });
      }
    };
  });
}

/**
 * Download episode for offline listening
 */
export async function downloadEpisode(
  episodeId: string,
  title: string,
  artist: string,
  streamUrl: string,
  duration: number,
  onProgress?: (progress: number) => void
): Promise<DownloadedEpisode | null> {
  if (!db) {
    await initializeOfflineDB();
  }

  try {
    // Update progress
    downloadProgress.set(episodeId, {
      episodeId,
      progress: 0,
      status: "downloading",
    });

    // Fetch audio
    const response = await fetch(streamUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
    const reader = response.body?.getReader();

    if (!reader) throw new Error("No response body");

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      // Update progress
      const progress = contentLength ? Math.round((receivedLength / contentLength) * 100) : 0;
      downloadProgress.set(episodeId, {
        episodeId,
        progress,
        status: "downloading",
      });

      if (onProgress) {
        onProgress(progress);
      }
    }

    // Combine chunks
    const audioData = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      audioData.set(chunk, position);
      position += chunk.length;
    }

    // Save to IndexedDB
    const episode: DownloadedEpisode = {
      id: episodeId,
      title,
      artist,
      streamUrl,
      audioData: audioData.buffer,
      downloadedAt: Date.now(),
      duration,
      size: audioData.length,
    };

    await saveEpisodeToIndexedDB(episode);

    // Mark as completed
    downloadProgress.set(episodeId, {
      episodeId,
      progress: 100,
      status: "completed",
    });

    return episode;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    downloadProgress.set(episodeId, {
      episodeId,
      progress: 0,
      status: "failed",
      error: errorMessage,
    });

    throw error;
  }
}

/**
 * Save episode to IndexedDB
 */
async function saveEpisodeToIndexedDB(episode: DownloadedEpisode): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(episode);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get downloaded episode
 */
export async function getDownloadedEpisode(episodeId: string): Promise<DownloadedEpisode | null> {
  if (!db) {
    await initializeOfflineDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(episodeId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Get all downloaded episodes
 */
export async function getAllDownloadedEpisodes(): Promise<DownloadedEpisode[]> {
  if (!db) {
    await initializeOfflineDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Delete downloaded episode
 */
export async function deleteDownloadedEpisode(episodeId: string): Promise<void> {
  if (!db) {
    await initializeOfflineDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(episodeId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get download progress
 */
export function getDownloadProgress(episodeId: string): DownloadProgress | null {
  return downloadProgress.get(episodeId) || null;
}

/**
 * Get all download progress
 */
export function getAllDownloadProgress(): DownloadProgress[] {
  return Array.from(downloadProgress.values());
}

/**
 * Clear download progress
 */
export function clearDownloadProgress(episodeId: string): void {
  downloadProgress.delete(episodeId);
}

/**
 * Get total offline storage size
 */
export async function getOfflineStorageSize(): Promise<number> {
  const episodes = await getAllDownloadedEpisodes();
  return episodes.reduce((sum, e) => sum + e.size, 0);
}

/**
 * Convert audio data to blob URL for playback
 */
export function getOfflineAudioUrl(audioData: ArrayBuffer): string {
  const blob = new Blob([audioData], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}
