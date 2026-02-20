const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : window.location.origin);

export async function detectMood(formData) {
  const url = `${API_BASE.replace(/\/$/, '')}/detect-mood`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(`Could not connect to backend at ${API_BASE}. Is the server running? (${err.message})`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getMoodMusic(mood = 'neutral') {
  const url = `${API_BASE.replace(/\/$/, '')}/mood-music?mood=${encodeURIComponent(mood)}`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Could not fetch mood music from backend at ${API_BASE}. (${err.message})`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}
