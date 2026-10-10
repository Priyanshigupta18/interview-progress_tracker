// Small wrapper around LocalStorage.
// try/catch because localStorage can throw (private mode, quota full)
// and JSON.parse can throw if the saved data is corrupted.
const Store = {
  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error("Could not read from LocalStorage:", err);
      return fallback;
    }
  },

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Could not save to LocalStorage:", err);
    }
  },
};
