/**
 * CountdownHub - Live Countdown Timer
 * Target Dates:
 *   - CCEE Exam: 13 July 2026
 *   - Placement: 19 August 2026
 */

(function () {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const EVENTS = {
        exam: {
            name: 'CCEE Exam',
            // Month is 0-indexed: 6 = July
            date: new Date(2026, 6, 13, 9, 0, 0), // July 13, 2026, 9:00 AM
            startReference: new Date(2026, 0, 1), // Jan 1, 2026
            daysId: 'examDays',
            hoursId: 'examHours',
            minutesId: 'examMinutes',
            secondsId: 'examSeconds',
            progressId: 'examProgress',
            progressTextId: 'examProgressText',
            urgencyId: 'examUrgency',
            motivationId: 'examMotivation',
            cardId: 'examCard',
        },
        placement: {
            name: 'Placement Day',
            date: new Date(2026, 7, 19, 9, 0, 0), // Aug 19, 2026, 9:00 AM
            startReference: new Date(2026, 0, 1),
            daysId: 'placementDays',
            hoursId: 'placementHours',
            minutesId: 'placementMinutes',
            secondsId: 'placementSeconds',
            progressId: 'placementProgress',
            progressTextId: 'placementProgressText',
            urgencyId: 'placementUrgency',
            motivationId: 'placementMotivation',
            cardId: 'placementCard',
        },
    };

    const MOTIVATIONAL_QUOTES = [
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

    // Cache DOM elements
    const elements = {};
    const previousValues = {};

    // ==========================================
    // Initialize
    // ==========================================
    function init() {
        cacheElements();
        createParticles();
        updateClock();
        updateCountdowns();
        rotateQuotes();

        // Update every second
        setInterval(updateClock, 1000);
        setInterval(updateCountdowns, 1000);

        // Rotate quotes every 30 seconds
        setInterval(rotateQuotes, 30000);
    }

    function cacheElements() {
        elements.currentTime = document.getElementById('currentTime');
        elements.timePeriod = document.getElementById('timePeriod');
        elements.currentDate = document.getElementById('currentDate');

        Object.keys(EVENTS).forEach((key) => {
            const evt = EVENTS[key];
            elements[evt.daysId] = document.getElementById(evt.daysId);
            elements[evt.hoursId] = document.getElementById(evt.hoursId);
            elements[evt.minutesId] = document.getElementById(evt.minutesId);
            elements[evt.secondsId] = document.getElementById(evt.secondsId);
            elements[evt.progressId] = document.getElementById(evt.progressId);
            elements[evt.progressTextId] = document.getElementById(evt.progressTextId);
            elements[evt.urgencyId] = document.getElementById(evt.urgencyId);
            elements[evt.motivationId] = document.getElementById(evt.motivationId);
            elements[evt.cardId] = document.getElementById(evt.cardId);
        });
    }

    // ==========================================
    // Particles Background
    // ==========================================
    function createParticles() {
        const container = document.getElementById('particles');
        const count = window.innerWidth < 640 ? 25 : 50;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 15) + 's';
            particle.style.width = (Math.random() * 3 + 1) + 'px';
            particle.style.height = particle.style.width;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            container.appendChild(particle);
        }
    }

    // ==========================================
    // Current Time
    // ==========================================
    function updateClock() {
        const now = new Date();

        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const timeStr =
            pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);

        elements.currentTime.textContent = timeStr;
        elements.timePeriod.textContent = ampm;

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        elements.currentDate.textContent = now.toLocaleDateString('en-IN', options);
    }

    // ==========================================
    // Countdown Logic
    // ==========================================
    function updateCountdowns() {
        const now = new Date();

        Object.keys(EVENTS).forEach((key) => {
            const evt = EVENTS[key];
            const diff = evt.date - now;

            if (diff <= 0) {
                // Event has passed
                handleEventPassed(evt);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Update with flip animation
            updateUnitWithFlip(evt.daysId, pad(days, days > 99 ? 3 : 2));
            updateUnitWithFlip(evt.hoursId, pad(hours));
            updateUnitWithFlip(evt.minutesId, pad(minutes));
            updateUnitWithFlip(evt.secondsId, pad(seconds));

            // Update progress bar
            const totalDuration = evt.date - evt.startReference;
            const elapsed = now - evt.startReference;
            const progress = Math.min((elapsed / totalDuration) * 100, 100);
            elements[evt.progressId].style.width = progress.toFixed(2) + '%';
            elements[evt.progressTextId].textContent =
                progress.toFixed(1) + '% time elapsed';

            // Update urgency badge
            updateUrgency(evt.urgencyId, days);
        });
    }

    function updateUnitWithFlip(id, newValue) {
        const el = elements[id];
        if (!el) return;

        if (previousValues[id] !== newValue) {
            el.textContent = newValue;
            el.classList.remove('flip');
            // Trigger reflow
            void el.offsetWidth;
            el.classList.add('flip');
            previousValues[id] = newValue;
        }
    }

    function updateUrgency(id, days) {
        const el = elements[id];
        if (!el) return;

        el.classList.remove('critical', 'warning');

        if (days <= 7) {
            el.textContent = '🔥 ' + days + 'd left!';
            el.classList.add('critical');
        } else if (days <= 30) {
            el.textContent = '⚡ ' + days + ' days';
            el.classList.add('warning');
        } else {
            el.textContent = '📅 ' + days + ' days';
        }
    }

    function handleEventPassed(evt) {
        const card = elements[evt.cardId];
        if (!card || card.classList.contains('event-passed')) return;

        card.classList.add('event-passed');

        // Set countdown to zeros
        elements[evt.daysId].textContent = '00';
        elements[evt.hoursId].textContent = '00';
        elements[evt.minutesId].textContent = '00';
        elements[evt.secondsId].textContent = '00';

        // Full progress
        elements[evt.progressId].style.width = '100%';
        elements[evt.progressTextId].textContent = '100% — Completed!';

        // Update urgency
        const urgencyEl = elements[evt.urgencyId];
        urgencyEl.textContent = '✅ Done!';
        urgencyEl.classList.remove('critical', 'warning');

        // Insert passed message
        const countdownGrid = card.querySelector('.countdown-grid');
        if (countdownGrid && !card.querySelector('.passed-message')) {
            const msg = document.createElement('div');
            msg.className = 'passed-message';
            msg.textContent = evt.name + ' day has arrived! All the best! 🎉';
            countdownGrid.parentNode.insertBefore(msg, countdownGrid);
        }
    }

    // ==========================================
    // Motivational Quotes Rotation
    // ==========================================
    function rotateQuotes() {
        Object.keys(EVENTS).forEach((key) => {
            const evt = EVENTS[key];
            const el = elements[evt.motivationId];
            if (!el) return;

            const randomQuote =
                MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = randomQuote;
                el.style.opacity = '1';
                el.style.transition = 'opacity 0.5s ease';
            }, 300);
        });
    }

    // ==========================================
    // Utility
    // ==========================================
    function pad(num, length) {
        length = length || 2;
        return String(num).padStart(length, '0');
    }

    // ==========================================
    // Start
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
