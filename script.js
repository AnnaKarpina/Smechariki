document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Логика для редактируемого блока "Смысл сюжета" ---
    const editableText = document.getElementById('editable-meaning');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    const savedMeaning = localStorage.getItem('customMeaning');
    if (savedMeaning) {
        editableText.textContent = savedMeaning;
    }

    editBtn.addEventListener('click', () => {
        editableText.setAttribute('contenteditable', 'true');
        editableText.focus();
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', () => {
        editableText.setAttribute('contenteditable', 'false');
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        localStorage.setItem('customMeaning', editableText.textContent);
        
        saveBtn.textContent = 'Сохранено!';
        setTimeout(() => { saveBtn.textContent = 'Сохранить'; }, 2000);
    });

    // --- 2. ЛОГИКА ПЕРЕХОДА ПАЛИТРЫ ---
    const bgGradient = document.querySelector('.bg-gradient');
    const triggerElement = document.getElementById('palette-trigger');
    
    function lerpColor(hex1, hex2, t) {
        const c1 = hexToRgb(hex1);
        const c2 = hexToRgb(hex2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    const topC1 = '#fa855a';
    const topC2 = '#ffe4b9';
    const topC3 = '#62c4da';
    const botC1 = '#0d2e92';
    const botC2 = '#4abbb0';
    const botC3 = '#0d2e92';

    function updateColors() {
        if (!triggerElement) return;
        const triggerRect = triggerElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const startPoint = windowHeight * 0.9;
        const endPoint = windowHeight * 0.3;
        
        let progress = (startPoint - triggerRect.top) / (startPoint - endPoint);
        
        if (progress > 1) progress = 1;
        if (progress < 0) progress = 0;

        const currentC1 = lerpColor(topC1, botC1, progress);
        const currentC2 = lerpColor(topC2, botC2, progress);
        const currentC3 = lerpColor(topC3, botC3, progress);

        bgGradient.style.background = `linear-gradient(135deg, ${currentC1} 0%, ${currentC2} 50%, ${currentC3} 100%)`;

        const root = document.documentElement;
        
        const textColor = progress > 0.5 ? '#ffffff' : '#2c1e16';
        root.style.setProperty('--current-text', textColor);
        
        const accentColor = lerpColor('#c93638', '#ffe4b9', progress);
        root.style.setProperty('--current-accent', accentColor);

        if (progress > 0.3) {
            const glassOpacity = 0.45 - (progress * 0.2);
            root.style.setProperty('--current-glass', `rgba(13, 46, 146, ${glassOpacity})`);
            root.style.setProperty('--current-glass-border', `rgba(255, 255, 255, ${0.6 - progress * 0.4})`);
        } else {
            root.style.setProperty('--current-glass', `rgba(255, 255, 255, 0.45)`);
            root.style.setProperty('--current-glass-border', `rgba(255, 255, 255, 0.6)`);
        }
    }

    window.addEventListener('scroll', updateColors);
    window.addEventListener('resize', updateColors);
    updateColors();

    // --- 3. Анимация появления секций (Подъем из пыли) ---
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- 4. Логика модального окна (Zoom) ---
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("zoomed-image");
    const closeBtn = document.querySelector(".close-modal");
    const zoomableImages = document.querySelectorAll(".zoomable-img");

    zoomableImages.forEach(img => {
        img.addEventListener("click", function() {
            modalImg.src = this.src;
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
        });
    });

    function closeModal() {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
        setTimeout(() => { modalImg.src = ""; }, 300);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", function(event) {
            if (event.target === modal) closeModal();
        });
    }
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && modal.classList.contains("show")) closeModal();
    });

    // --- 5. НОВОЕ: Фоновый вихрь (Пыльная буря) ---
    const swirl = document.createElement('div');
    swirl.classList.add('bg-swirl');
    document.body.appendChild(swirl);

    // --- 6. НОВОЕ: Пыльный след за курсором (Dust Trail) ---
    let lastDustTime = 0;
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Создаем пылинку не чаще, чем раз в 50 мс, чтобы не перегружать браузер
        if (now - lastDustTime > 50) {
            createDustParticle(e.clientX, e.clientY);
            lastDustTime = now;
        }
    });

    function createDustParticle(x, y) {
        const dust = document.createElement('div');
        dust.classList.add('dust-particle');
        
        // Случайный размер
        const size = Math.random() * 6 + 3;
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;
        
        // Позиция
        dust.style.left = `${x}px`;
        dust.style.top = `${y}px`;
        
        document.body.appendChild(dust);
        
        // Удаляем элемент после завершения анимации
        setTimeout(() => {
            dust.remove();
        }, 800);
    }

    // --- 7. НОВОЕ: Добавление класса fall-card для эффекта падения ---
    // Находим все карточки и добавляем им класс для клика
    const interactiveCards = document.querySelectorAll('.info-card, .story-step, .awards-list li');
    interactiveCards.forEach(card => {
        card.classList.add('fall-card');
    });
});