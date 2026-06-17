/* ========== PARTICLE SYSTEM ========== */
class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 120 };
        this.options = {
            count: options.count || 60,
            color: options.color || 'rgba(204, 255, 0, 0.4)',
            lineColor: options.lineColor || 'rgba(204, 255, 0, 0.08)',
            maxRadius: options.maxRadius || 3,
            speed: options.speed || 0.4,
            connectDistance: options.connectDistance || 120,
            ...options,
        };
        this.resize();
        this.createParticles();
        this.addListeners();
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.options.speed,
                vy: (Math.random() - 0.5) * this.options.speed,
                radius: Math.random() * this.options.maxRadius + 0.5,
            });
        }
    }

    addListeners() {
        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += (dx / dist) * force * 2;
                    p.y += (dy / dist) * force * 2;
                }
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.options.color;
            this.ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.options.connectDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.options.lineColor;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.globalAlpha = 1 - dist / this.options.connectDistance;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {

    // ---- Particles ----
    const heroCanvas = document.getElementById('particlesCanvas');
    if (heroCanvas) {
        new ParticleSystem(heroCanvas, {
            count: 50,
            color: 'rgba(204, 255, 0, 0.35)',
            lineColor: 'rgba(204, 255, 0, 0.07)',
            maxRadius: 2.5,
            speed: 0.3,
            connectDistance: 130,
        });
    }

    // ---- Parallax ----
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    function updateParallax() {
        const scrollY = window.scrollY;
        parallaxElements.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            el.style.transform = `translateY(${scrollY * speed * -0.3}px)`;
        });

        // Blob parallax
        document.querySelectorAll('.blob').forEach((blob, i) => {
            const speed = 0.05 + i * 0.02;
            blob.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
    window.addEventListener('scroll', updateParallax, { passive: true });

    // ---- Navbar ----
    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('navBurger');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(250, 250, 250, 0.95)';
        } else {
            navbar.style.background = 'rgba(250, 250, 250, 0.85)';
        }
    });

    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    navLinks?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    // ---- Counter animation ----
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    const duration = 2000;
                    const start = performance.now();

                    function update(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(target * ease).toLocaleString('uk-UA');
                        if (progress < 1) requestAnimationFrame(update);
                    }
                    requestAnimationFrame(update);
                    counterObserver.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));

    // ---- Scroll Reveal ----
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.revealDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

    // ---- Leaflet Map (CartoDB dark tiles — no token needed) ----
    if (typeof L !== 'undefined' && document.getElementById('mapContainer')) {
        const map = L.map('mapContainer', {
            center: [50.4501, 30.5234],
            zoom: 11,
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: false,
        });

        // Overlay-based interaction control
        const mapContainer = document.getElementById('mapContainer');
        const mapOverlay = document.getElementById('mapClickOverlay');

        // Click overlay to activate map
        mapOverlay?.addEventListener('click', () => {
            mapOverlay.classList.add('hidden');
            map.scrollWheelZoom.enable();
            map.dragging.enable();
        });

        // Deactivate map when mouse leaves
        const mapWrapper = mapContainer?.closest('.map-wrapper');
        mapWrapper?.addEventListener('mouseleave', () => {
            mapOverlay.classList.remove('hidden');
            map.scrollWheelZoom.disable();
            map.dragging.disable();
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        const districts = [
            { name: 'Печерський', coords: [50.4298, 30.5438], cleanings: 420, rating: 4.9 },
            { name: 'Шевченківський', coords: [50.4547, 30.5067], cleanings: 380, rating: 4.8 },
            { name: 'Подільський', coords: [50.4782, 30.5178], cleanings: 310, rating: 4.9 },
            { name: 'Голосіївський', coords: [50.3962, 30.5159], cleanings: 340, rating: 4.7 },
            { name: 'Оболонський', coords: [50.5127, 30.4987], cleanings: 290, rating: 4.8 },
            { name: 'Дарницький', coords: [50.4173, 30.6289], cleanings: 260, rating: 4.7 },
            { name: 'Деснянський', coords: [50.5057, 30.6158], cleanings: 230, rating: 4.6 },
            { name: 'Дніпровський', coords: [50.4616, 30.5892], cleanings: 280, rating: 4.8 },
            { name: 'Святошинський', coords: [50.4532, 30.3667], cleanings: 245, rating: 4.7 },
            { name: 'Солом\'янський', coords: [50.4264, 30.4429], cleanings: 270, rating: 4.8 },
        ];

        const markerIcon = L.divIcon({
            className: 'map-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -14],
        });

        districts.forEach((d) => {
            L.marker(d.coords, { icon: markerIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="map-popup-title">${d.name}</div>
                    <div class="map-popup-stat">${d.cleanings} прибирань за місяць</div>
                `);
        });
    }

    // ---- Before/After Slider ----
    document.querySelectorAll('.ba-slider').forEach((slider) => {
        const beforeEl = slider.querySelector('.ba-before');
        let isDragging = false;

        function setPosition(x) {
            const rect = slider.getBoundingClientRect();
            let percent = ((x - rect.left) / rect.width) * 100;
            percent = Math.max(2, Math.min(98, percent));
            beforeEl.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            slider.querySelector('.ba-handle').style.left = percent + '%';
        }

        // Initialize at 50%
        setPosition(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
        // Actually set via CSS initially
        beforeEl.style.clipPath = 'inset(0 50% 0 0)';
        slider.querySelector('.ba-handle').style.left = '50%';

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            setPosition(e.clientX);
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) setPosition(e.clientX);
        });
        window.addEventListener('mouseup', () => (isDragging = false));

        // Touch
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            setPosition(e.touches[0].clientX);
        });
        slider.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                setPosition(e.touches[0].clientX);
            }
        });
        slider.addEventListener('touchend', () => (isDragging = false));
    });

    // ---- Multi-step Booking Wizard ----
    const wizard = document.getElementById('bookingWizard');
    if (wizard) {
        const steps = [
            document.getElementById('wizardStep1'),
            document.getElementById('wizardStep2'),
            document.getElementById('wizardStep3'),
            document.getElementById('wizardStep4'),
        ];
        const successPanel = document.getElementById('wizardSuccess');
        const indicators = wizard.querySelectorAll('.wizard-step-indicator');
        let currentStep = 0;

        // Price rates per m² based on type (real prices)
        const priceRates = {
            apartment: 150,
            house: 150,
            office: 45,
            commercial: 45
        };
        let selectedType = null;
        let selectedDate = null;

        function goToStep(n) {
            steps.forEach((s) => s.classList.remove('active'));
            successPanel.classList.remove('active');
            steps[n].classList.add('active');

            indicators.forEach((ind, i) => {
                ind.classList.remove('active', 'completed');
                if (i < n) ind.classList.add('completed');
                if (i === n) ind.classList.add('active');
            });

            // Update completed step number to checkmark
            indicators.forEach((ind, i) => {
                const numEl = ind.querySelector('.step-num');
                if (i < n) {
                    numEl.textContent = '✓';
                } else {
                    numEl.textContent = (i + 1).toString();
                }
            });

            currentStep = n;
        }

        // Step 1: Type selection
        const typeInputs = wizard.querySelectorAll('input[name="propertyType"]');
        typeInputs.forEach((input) => {
            input.addEventListener('change', () => {
                selectedType = input.value;
                // Auto-advance to step 2
                setTimeout(() => goToStep(1), 300);
                updatePrice();
            });
        });

        // Step 2: Area Slider
        const areaSlider = document.getElementById('areaSlider');
        const priceValue = document.getElementById('priceValue');
        const areaDisplay = document.getElementById('areaDisplay');

        function updatePrice() {
            const area = parseInt(areaSlider.value);
            const rate = priceRates[selectedType] || 40;
            const price = area * rate;
            priceValue.textContent = price.toLocaleString('uk-UA');
            areaDisplay.textContent = `Площа: ${area} м²`;

            // Update slider fill
            const percent = ((area - 20) / (500 - 20)) * 100;
            areaSlider.style.background = `linear-gradient(to right, #CCFF00 0%, #CCFF00 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
        }

        areaSlider?.addEventListener('input', updatePrice);
        updatePrice();

        // Navigation buttons
        document.getElementById('backToStep1')?.addEventListener('click', () => goToStep(0));
        document.getElementById('toStep3')?.addEventListener('click', () => goToStep(2));
        document.getElementById('backToStep2')?.addEventListener('click', () => goToStep(1));
        document.getElementById('toStep4')?.addEventListener('click', () => goToStep(3));
        document.getElementById('backToStep3')?.addEventListener('click', () => goToStep(2));

        // Step 3: Calendar
        const calDays = document.getElementById('calDays');
        const calMonth = document.getElementById('calMonth');
        const calPrev = document.getElementById('calPrev');
        const calNext = document.getElementById('calNext');

        const monthNames = [
            'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
        ];

        let calDate = new Date();

        function renderCalendar() {
            const year = calDate.getFullYear();
            const month = calDate.getMonth();
            const today = new Date();

            calMonth.textContent = `${monthNames[month]} ${year}`;
            calDays.innerHTML = '';

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const adj = firstDay === 0 ? 6 : firstDay - 1; // Monday start

            // Empty cells
            for (let i = 0; i < adj; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-day empty';
                calDays.appendChild(empty);
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const btn = document.createElement('button');
                btn.className = 'cal-day';
                btn.textContent = d;

                const cellDate = new Date(year, month, d);

                if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                    btn.classList.add('disabled');
                }

                if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    btn.classList.add('today');
                }

                if (selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                    btn.classList.add('selected');
                }

                btn.addEventListener('click', () => {
                    if (btn.classList.contains('disabled')) return;
                    selectedDate = new Date(year, month, d);
                    renderCalendar();
                });

                calDays.appendChild(btn);
            }
        }

        calPrev?.addEventListener('click', () => {
            calDate.setMonth(calDate.getMonth() - 1);
            renderCalendar();
        });

        calNext?.addEventListener('click', () => {
            calDate.setMonth(calDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();

        // Submit with validation
        const clientNameInput = document.getElementById('clientName');
        const clientPhoneInput = document.getElementById('clientPhone');
        const nameError = document.getElementById('nameError');
        const phoneError = document.getElementById('phoneError');

        // Phone input mask
        clientPhoneInput?.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            // Ensure starts with 380
            if (val.startsWith('380')) {
                val = val;
            } else if (val.startsWith('80')) {
                val = '3' + val;
            } else if (val.startsWith('0')) {
                val = '38' + val;
            } else if (!val.startsWith('3')) {
                val = '380' + val;
            }
            // Limit to 12 digits (380XXXXXXXXX)
            val = val.substring(0, 12);
            // Format: +380 (XX) XXX-XX-XX
            let formatted = '';
            if (val.length > 0) formatted = '+' + val.substring(0, 3);
            if (val.length >= 4) formatted += ' (' + val.substring(3, 5);
            if (val.length >= 5) formatted += ') ';
            if (val.length >= 6) formatted += val.substring(5, 8);
            if (val.length >= 9) formatted += '-' + val.substring(8, 10);
            if (val.length >= 11) formatted += '-' + val.substring(10, 12);
            e.target.value = formatted;
        });

        // Clear error on input
        clientNameInput?.addEventListener('input', () => {
            clientNameInput.classList.remove('error');
            nameError.classList.remove('visible');
        });
        clientPhoneInput?.addEventListener('input', () => {
            clientPhoneInput.classList.remove('error');
            phoneError.classList.remove('visible');
        });

        document.getElementById('submitBooking')?.addEventListener('click', () => {
            const name = clientNameInput?.value.trim();
            const phone = clientPhoneInput?.value.replace(/\D/g, '');
            let valid = true;

            // Validate name
            if (!name || name.length < 2) {
                clientNameInput.classList.add('error');
                nameError.classList.add('visible');
                valid = false;
            }

            // Validate phone (Ukrainian format: 12 digits)
            if (!phone || phone.length < 10) {
                clientPhoneInput.classList.add('error');
                phoneError.classList.add('visible');
                valid = false;
            }

            if (!valid) return;

            steps.forEach((s) => s.classList.remove('active'));
            successPanel.classList.add('active');

            indicators.forEach((ind) => {
                ind.classList.remove('active');
                ind.classList.add('completed');
                ind.querySelector('.step-num').textContent = '✓';
            });
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========== BENTO GRID — Sparkle Canvas ==========
    document.querySelectorAll('[data-sparkle]').forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        const sparkles = [];
        const SPARKLE_COUNT = 40;

        function resizeCanvas() {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (let i = 0; i < SPARKLE_COUNT; i++) {
            sparkles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * Math.PI * 2,
            });
        }

        function animateSparkles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparkles.forEach((s) => {
                s.x += s.vx;
                s.y += s.vy;
                s.pulse += 0.03;

                if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
                if (s.y < 0 || s.y > canvas.height) s.vy *= -1;

                const glowAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));

                // Outer glow
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(204, 255, 0, ${glowAlpha * 0.15})`;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(204, 255, 0, ${glowAlpha})`;
                ctx.fill();
            });

            requestAnimationFrame(animateSparkles);
        }
        animateSparkles();
    });

    // ========== BENTO GRID — Inline Calculator ==========
    document.querySelectorAll('.bento-cell').forEach((cell) => {
        const slider = cell.querySelector('[data-calc-slider]');
        const areaEl = cell.querySelector('[data-calc-area]');
        const priceEl = cell.querySelector('[data-calc-price]');
        const rate = parseInt(cell.dataset.rate) || 40;

        if (slider && areaEl && priceEl) {
            function updateBentoCalc() {
                const area = parseInt(slider.value);
                areaEl.textContent = `${area} м²`;
                const price = area * rate;
                priceEl.textContent = price.toLocaleString('uk-UA');

                // Update slider fill
                const min = parseInt(slider.min);
                const max = parseInt(slider.max);
                const percent = ((area - min) / (max - min)) * 100;
                slider.style.background = `linear-gradient(to right, #CCFF00 0%, #CCFF00 ${percent}%, rgba(255,255,255,0.12) ${percent}%)`;
            }

            slider.addEventListener('input', updateBentoCalc);
            updateBentoCalc();
        }
    });

    // ========== SPA MENU — Stagger Reveal on Scroll ==========
    const spaCards = document.querySelectorAll('[data-spa-reveal]');
    if (spaCards.length) {
        const spaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = Array.from(spaCards).indexOf(card);
                    setTimeout(() => {
                        card.classList.add('is-revealed');
                    }, index * 100); // 100ms stagger between cards
                    spaObserver.unobserve(card);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        spaCards.forEach(card => spaObserver.observe(card));
    }

});
