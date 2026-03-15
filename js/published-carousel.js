/**
 * Demeni Sites — Published Carousel Autoplay
 * 
 * Standalone script loaded by published sites via <script src="...">.
 * Handles: auto-play, dot sync, touch/mouse pause.
 * 
 * Reads config from data attributes on .d2-carousel-wrap:
 *   data-autoplay="true|false"  (default: true)
 *   data-interval="3000"        (default: 3000ms)
 */
(function () {
    'use strict';

    function initCarousels() {
        var wraps = document.querySelectorAll('.d2-carousel-wrap');
        if (!wraps.length) return;

        wraps.forEach(function (wrap) {
            var track = wrap.querySelector('.d2-carousel-track');
            if (!track) return;

            var dots = wrap.querySelectorAll('.d2-carousel-dot');

            // --- Dot sync ---
            if (dots.length > 0) {
                var syncDots = function () {
                    var w = track.offsetWidth;
                    if (w === 0) return;
                    var idx = Math.round(track.scrollLeft / w);
                    dots.forEach(function (d, i) {
                        d.style.background = i === idx ? '#fff' : 'rgba(255,255,255,0.4)';
                    });
                };
                track.addEventListener('scroll', syncDots, { passive: true });
                dots.forEach(function (dot) {
                    dot.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        track.scrollTo({
                            left: parseInt(dot.dataset.idx) * track.offsetWidth,
                            behavior: 'smooth'
                        });
                    });
                });
            }

            // --- Autoplay ---
            var autoplay = wrap.getAttribute('data-autoplay');
            if (autoplay === 'false') return;

            var slides = track.querySelectorAll('.d2-carousel-slide');
            if (slides.length < 2) return;

            var intervalMs = parseInt(wrap.getAttribute('data-interval')) || 3000;

            var advance = function () {
                var max = track.scrollWidth - track.offsetWidth;
                if (max <= 0) return;
                if (track.scrollLeft >= max - 5) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
                }
            };

            var iv = setInterval(advance, intervalMs);

            var stopAutoplay = function () { clearInterval(iv); };
            var startAutoplay = function () {
                clearInterval(iv);
                iv = setInterval(advance, intervalMs);
            };

            // Pause on hover / touch
            wrap.addEventListener('mouseenter', stopAutoplay);
            wrap.addEventListener('mouseleave', startAutoplay);
            wrap.addEventListener('touchstart', stopAutoplay, { passive: true });
            wrap.addEventListener('touchend', function () {
                setTimeout(startAutoplay, 2000);
            }, { passive: true });
        });
    }

    // Run after DOM is ready + small delay for layout
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(initCarousels, 150);
        });
    } else {
        setTimeout(initCarousels, 150);
    }
})();
