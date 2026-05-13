/**
 * Inner Canvas — Local Storage (Phase 2)
 */
const STORAGE_KEY = 'inner-canvas-entries';

const storage = {
    getEntries() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    },
    saveEntry(entry) {
        const entries = this.getEntries();
        const saved = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            date: new Date().toISOString(),
            text: entry.text,
            mood: entry.mood,
            artwork: entry.artwork,
            reflection: entry.reflection,
            timestamp: Date.now(),
        };
        entries.unshift(saved);
        if (entries.length > 365) entries.length = 365;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return saved;
    },
    getEntries() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    },
    hasEntries() { return this.getEntries().length > 0; },
};
