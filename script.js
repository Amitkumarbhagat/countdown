/**
 * CountdownHub - Live Countdown Timer (Single-Screen Edition)
 * Targets:
 *   - CCEE Exam:  13 July 2026, 9:00 AM
 *   - Placement:  19 August 2026, 9:00 AM
 */

(function () {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const EVENTS = {
        exam: {
            name: 'CCEE Exam',
            date: new Date(2026, 6, 13, 9, 0, 0),   // July 13
            startRef: new Date(2026, 0, 1),
            ids: { d: 'examDays', h: 'examHours', m: 'examMinutes', s: 'examSeconds',
                   bar: 'examProgress', pct: 'examProgressText',
                   urg: 'examUrgency', quote: 'examMotivation', card: 'examCard' }
        },
        placement: {
            name: 'Placement Day',
            date: new Date(2026, 7, 19, 9, 0, 0),   // Aug 19
            startRef: new Date(2026, 0, 1),
            ids: { d: 'placementDays', h: 'placementHours', m: 'placementMinutes', s: 'placementSeconds',
                   bar: 'placementProgress', pct: 'placementProgressText',
                   urg: 'placementUrgency', quote: 'placementMotivation', card: 'placementCard' }
        }
    };

    const QUOTES = [
        '"Success is the sum of small efforts, repeated day in and day out."',
        '"The only way to do great work is to love what you do."',
        '"Believe you can and you\'re halfway there."',
        '"Hard work beats talent when talent doesn\'t work hard."',
        '"It always seems impossible until it\'s done."',
        '"Don\'t watch the clock; do what it does. Keep going."',
        '"The future belongs to those who prepare for it today."',
        '"Discipline is the bridge between goals and accomplishment."',
        '"Your limitation—it\'s only your imagination."',
        '"Push yourself, because no one else is going to do it for you."',
    ];

    // DOM cache
    const el = {};
    const prev = {};

    // ==========================================
    // Init
    // ==========================================
    function init() {
        cacheDOM();
        tick();
        rotateQuotes();
        setInterval(tick, 1000);
        setInterval(rotateQuotes, 30000);
    }

    function cacheDOM() {
        el.time = document.getElementById('currentTime');
        el.period = document.getElementById('timePeriod');
        el.date = document.getElementById('currentDate');
        Object.values(EVENTS).forEach(e => {
            Object.entries(e.ids).forEach(([k, id]) => { el[id] = document.getElementById(id); });
        });
    }

    // ==========================================
    // Main tick — clock + countdowns
    // ==========================================
    function tick() {
        const now = new Date();

        // Clock
        let h = now.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        el.time.textContent = pad(h) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        el.period.textContent = ampm;
        el.date.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

        // Countdowns
        Object.values(EVENTS).forEach(e => {
            const diff = e.date - now;
            const ids = e.ids;

            if (diff <= 0) { handlePassed(e); return; }

            const days  = Math.floor(diff / 864e5);
            const hours = Math.floor((diff % 864e5) / 36e5);
            const mins  = Math.floor((diff % 36e5) / 6e4);
            const secs  = Math.floor((diff % 6e4) / 1e3);

            flip(ids.d, pad(days, days > 99 ? 3 : 2));
            flip(ids.h, pad(hours));
            flip(ids.m, pad(mins));
            flip(ids.s, pad(secs));

            // Progress
            const total   = e.date - e.startRef;
            const elapsed = now   - e.startRef;
            const pct     = Math.min(elapsed / total * 100, 100);
            el[ids.bar].style.width = pct.toFixed(1) + '%';
            el[ids.pct].textContent = pct.toFixed(1) + '%';

            // Urgency
            const urg = el[ids.urg];
            urg.classList.remove('critical', 'warning');
            if (days <= 7)       { urg.textContent = '🔥 ' + days + 'd left!'; urg.classList.add('critical'); }
            else if (days <= 30) { urg.textContent = '⚡ ' + days + ' days';   urg.classList.add('warning');  }
            else                 { urg.textContent = '📅 ' + days + ' days'; }
        });
    }

    // ==========================================
    // Flip animation helper
    // ==========================================
    function flip(id, val) {
        const node = el[id];
        if (!node || prev[id] === val) return;
        node.textContent = val;
        node.classList.remove('flip');
        void node.offsetWidth;          // reflow
        node.classList.add('flip');
        prev[id] = val;
    }

    // ==========================================
    // Event passed
    // ==========================================
    function handlePassed(e) {
        const card = el[e.ids.card];
        if (!card || card.classList.contains('event-passed')) return;
        card.classList.add('event-passed');
        ['d','h','m','s'].forEach(k => { el[e.ids[k]].textContent = '00'; });
        el[e.ids.bar].style.width = '100%';
        el[e.ids.pct].textContent = '100%';
        const urg = el[e.ids.urg];
        urg.textContent = '✅ Done!';
        urg.classList.remove('critical', 'warning');

        const grid = card.querySelector('.countdown-grid');
        if (grid && !card.querySelector('.passed-message')) {
            const msg = document.createElement('div');
            msg.className = 'passed-message';
            msg.textContent = e.name + ' day has arrived! All the best! 🎉';
            grid.parentNode.insertBefore(msg, grid);
        }
    }

    // ==========================================
    // Quote rotation
    // ==========================================
    function rotateQuotes() {
        Object.values(EVENTS).forEach(e => {
            const node = el[e.ids.quote];
            if (!node) return;
            const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            node.style.opacity = '0';
            setTimeout(() => { node.textContent = q; node.style.opacity = '1'; }, 300);
        });
    }

    // ==========================================
    // Util
    // ==========================================
    function pad(n, len) { return String(n).padStart(len || 2, '0'); }

    // Start
    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
