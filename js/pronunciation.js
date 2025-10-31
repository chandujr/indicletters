/**
 * This script was made with online TTS engines in mind. If it is decided that local audio files are to be used,
 * then modify this script, remove unnecessary functions.
 */

const version = "1"; // if server voice config changes, update this

// Initialize IndexedDB
let db;
async function initAudioCache() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AudioCache", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("audio")) {
        db.createObjectStore("audio", { keyPath: "key" });
      }
    };
  });
}

async function getCachedAudio(key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["audio"], "readonly");
    const store = transaction.objectStore("audio");
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result?.blob);
    request.onerror = () => reject(request.error);
  });
}

async function setCachedAudio(key, blob) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["audio"], "readwrite");
    const store = transaction.objectStore("audio");
    const request = store.put({ key, blob, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function playPronunciation(text, languageCode = "ta-IN") {
  // Ensure DB is initialized
  if (!db) await initAudioCache();

  const cacheKey = `${text}-${languageCode}-${version}`;

  // Check cache first
  let audioBlob = await getCachedAudio(cacheKey);

  if (audioBlob) {
    console.log("Playing from IndexedDB cache:", text);
  } else {
    // Fetch from API
    console.log("Fetching from API:", text);
    const audioContent = await synthesizeSpeech(text, languageCode);

    if (!audioContent) {
      console.error("Failed to get audio");
      return;
    }

    audioBlob = base64ToBlob(audioContent, "audio/mp3");

    // Save to cache
    await setCachedAudio(cacheKey, audioBlob);
  }

  // Play audio
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();

  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function synthesizeSpeech(text, languageCode = "ta-IN") {
  const API_URL = "https://indicletters.publicvm.com/api/tts";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languageCode }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.audioContent;
  } catch (error) {
    console.error("TTS request failed:", error);
    return null;
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initAudioCache().catch(console.error);
});
