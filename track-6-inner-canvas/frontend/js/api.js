/**
 * Inner Canvas — API Communication
 */

const API_BASE = 'http://localhost:8000';

async function generateFromEntry(entryText, timeOfDay) {
    const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            entry: entryText,
            time_of_day: timeOfDay,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Something went quiet. Let\'s try again.');
    }

    return response.json();
}

async function detectPatterns(entries) {
    const response = await fetch(`${API_BASE}/api/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
    });

    if (!response.ok) {
        throw new Error('Pattern detection failed');
    }

    return response.json();
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'late_night';
}

function getGreeting() {
    const tod = getTimeOfDay();
    const greetings = {
        morning: 'Good morning. How did you wake up feeling?',
        afternoon: 'Pause for a moment. How\'s your day going?',
        evening: 'The day is winding down. What\'s on your heart?',
        late_night: 'Can\'t sleep? Let it out.',
    };
    return greetings[tod];
}
