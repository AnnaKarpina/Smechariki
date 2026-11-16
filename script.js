// ==========================================
// 1. ИНТЕРАКТИВНЫЙ ДОЖДЬ НА CANVAS + ПЕРЕКЛЮЧАТЕЛЬ
// ==========================================
const canvas = document.getElementById('rain-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let drops = [];
const mouse = { x: -1000, y: -1000 };


// Состояние дождя (читаем из localStorage, по умолчанию true)
let isRainEnabled = localStorage.getItem('rainEnabled') !== 'false';
const rainToggleBtn = document.getElementById('rain-toggle');


function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});


class RainDrop {
  constructor() {
      this.reset();
  }
 
  reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.speed = Math.random() * 8 + 6;
      this.length = Math.random() * 25 + 15;
      this.opacity = Math.random() * 0.5 + 0.4;
      this.wind = 0;
  }
 
  update() {
      this.y += this.speed;
      this.x += this.wind;
     
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 150;
     
      if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.x += (dx / distance) * force * 4;
          this.y += (dy / distance) * force * 1.5;
          this.opacity = Math.min(this.opacity + 0.4, 1.0);
      } else {
          this.opacity = Math.max(this.opacity - 0.02, 0.4);
      }
     
      if (this.y > height) {
          this.reset();
      }
  }
 
  draw() {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(208, 254, 255, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.wind, this.y + this.length);
      ctx.stroke();
  }
}


const dropCount = Math.min(window.innerWidth / 3, 300);
for (let i = 0; i < dropCount; i++) {
  drops.push(new RainDrop());
}


// Иконки для кнопки
const icons = {
  on: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.832a4.5 4.5 0 0 0-8.336 0H7a4.5 4.5 0 0 0 0 9h13z"/><path d="M8 19v2"/><path d="M12 19v2"/><path d="M16 19v2"/></svg>`,
  off: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.832a4.5 4.5 0 0 0-8.336 0H7a4.5 4.5 0 0 0 0 9h13z"/><line x1="4" y1="4" x2="20" y2="20"/></svg>`
};


function updateRainToggleUI() {
  if (isRainEnabled) {
      rainToggleBtn.classList.remove('disabled');
      rainToggleBtn.innerHTML = icons.on;
      rainToggleBtn.setAttribute('aria-label', 'Выключить дождь');
  } else {
      rainToggleBtn.classList.add('disabled');
      rainToggleBtn.innerHTML = icons.off;
      rainToggleBtn.setAttribute('aria-label', 'Включить дождь');
  }
}


// Обработчик клика по кнопке
rainToggleBtn.addEventListener('click', () => {
  isRainEnabled = !isRainEnabled;
  localStorage.setItem('rainEnabled', isRainEnabled);
  updateRainToggleUI();
});


function animateRain() {
  if (isRainEnabled) {
      ctx.clearRect(0, 0, width, height);
      drops.forEach(drop => {
          drop.update();
          drop.draw();
      });
  } else {
      // Мгновенная очистка холста при выключенном дожде для экономии ресурсов
      ctx.clearRect(0, 0, width, height);
  }
  requestAnimationFrame(animateRain);
}


// Инициализация UI и запуск анимации
updateRainToggleUI();
animateRain();




// ==========================================
// 2. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
// ==========================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};


const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
      }
  });
}, observerOptions);


document.querySelectorAll('.reveal').forEach(el => {
  scrollObserver.observe(el);
});




// ==========================================
// 3. 3D-НАКЛОН КАРТОЧЕК (TILT EFFECT)
// ==========================================
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
     
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
     
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
     
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
  });
 
  card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  });
});




// ==========================================
// 4. ЭФФЕКТ РЯБИ НА КНОПКАХ (RIPPLE)
// ==========================================
document.querySelectorAll('.ripple-btn').forEach(button => {
  button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
     
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
     
      this.appendChild(ripple);
     
      setTimeout(() => {
          ripple.remove();
      }, 600);
  });
});




// ==========================================
// 5. ОСНОВНОЙ ФУНКЦИОНАЛ (ТЕКСТ, КАРУСЕЛЬ, ЛАЙТБОКС)
// ==========================================
const STORAGE_KEY = 'earth_attraction_meaning';
const DEFAULT_TEXT = `Серия о том, как мы сами ограничиваем себя выдуманными правилами и не даём себе развиваться дальше. Основная мораль серии в том, что мы должны двигаться вперёд несмотря на препятствия на своём пути.`;


const editableText = document.getElementById('meaning');
const resetBtn = document.getElementById('resetBtn');
const clearBtn = document.getElementById('clearBtn');


function loadText() {
  const saved = localStorage.getItem(STORAGE_KEY);
  editableText.textContent = saved !== null ? saved : DEFAULT_TEXT;
}


function saveText() {
  const currentText = editableText.textContent.trim();
  localStorage.setItem(STORAGE_KEY, currentText);
  showNotification('💾 Изменения сохранены');
}


function resetText() {
  if (confirm('Вернуть текст к исходному варианту?')) {
      editableText.textContent = DEFAULT_TEXT;
      localStorage.setItem(STORAGE_KEY, DEFAULT_TEXT);
      showNotification('🔄 Текст восстановлен');
  }
}


function clearText() {
  if (confirm('Очистить весь текст?')) {
      editableText.textContent = '';
      localStorage.setItem(STORAGE_KEY, '');
      showNotification('🗑️ Текст очищен');
  }
}


function showNotification(message) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
 
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, var(--card-2), var(--card-3));
      color: var(--text-dark);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 10001;
      animation: slideIn 0.3s ease forwards;
  `;
  document.body.appendChild(notification);
 
  setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
  }, 2000);
}


const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);


editableText.addEventListener('input', saveText);
resetBtn.addEventListener('click', resetText);
clearBtn.addEventListener('click', clearText);


editableText.addEventListener('paste', (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});


loadText();


const heroTitle = document.querySelector('.hero__title');
heroTitle.addEventListener('mousemove', (e) => {
  const rect = heroTitle.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  heroTitle.style.textShadow = `
      ${-(x - rect.width/2) * 0.05}px ${-(y - rect.height/2) * 0.05}px 25px rgba(83, 242, 184, 0.6)
  `;
});


heroTitle.addEventListener('mouseleave', () => {
  heroTitle.style.textShadow = 'none';
});




/* =========================================================
 КАРУСЕЛЬ ФОТО
 ========================================================= */
const carouselTrack = document.querySelector('.carousel__track');
const carouselSlides = document.querySelectorAll('.carousel__slide');
const carouselIndicators = document.querySelectorAll('.carousel__indicator');
const prevArrow = document.querySelector('.carousel__arrow--left');
const nextArrow = document.querySelector('.carousel__arrow--right');


let currentSlide = 0;


function goToSlide(index) {
  carouselSlides[currentSlide].classList.remove('active');
  carouselIndicators[currentSlide].classList.remove('active');
  currentSlide = index;
  carouselSlides[currentSlide].classList.add('active');
  carouselIndicators[currentSlide].classList.add('active');
}


function nextSlide() {
  const next = (currentSlide + 1) % carouselSlides.length;
  goToSlide(next);
}


function prevSlide() {
  const prev = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
  goToSlide(prev);
}


nextArrow.addEventListener('click', nextSlide);
prevArrow.addEventListener('click', prevSlide);


carouselIndicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => goToSlide(index));
});


let autoPlayInterval = setInterval(nextSlide, 5000);


carouselTrack.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
carouselTrack.addEventListener('mouseleave', () => {
  autoPlayInterval = setInterval(nextSlide, 5000);
});




/* =========================================================
 ЛАЙТБОКС ДЛЯ ПРОСМОТРА ФОТО
 ========================================================= */
const lightbox = document.getElementById('photo-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox__close');
const lightboxPrevArrow = document.querySelector('.lightbox__arrow--left');
const lightboxNextArrow = document.querySelector('.lightbox__arrow--right');


let lightboxScale = 1;


carouselSlides.forEach((slide, index) => {
  const img = slide.querySelector('img');
  img.addEventListener('click', () => openLightbox(index));
});


function openLightbox(index) {
  const img = carouselSlides[index].querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxScale = 1;
  lightboxImg.style.transform = 'scale(1)';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}


function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}


function nextLightboxImage() {
  const next = (currentSlide + 1) % carouselSlides.length;
  goToSlide(next);
  const img = carouselSlides[next].querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxScale = 1;
  lightboxImg.style.transform = 'scale(1)';
}


function prevLightboxImage() {
  const prev = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
  goToSlide(prev);
  const img = carouselSlides[prev].querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxScale = 1;
  lightboxImg.style.transform = 'scale(1)';
}


closeBtn.addEventListener('click', closeLightbox);
lightboxNextArrow.addEventListener('click', (e) => { e.stopPropagation(); nextLightboxImage(); });
lightboxPrevArrow.addEventListener('click', (e) => { e.stopPropagation(); prevLightboxImage(); });


lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox__container')) {
      closeLightbox();
  }
});


document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextLightboxImage();
  if (e.key === 'ArrowLeft') prevLightboxImage();
});


lightbox.addEventListener('wheel', (e) => {
  if (!lightbox.classList.contains('active')) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.2 : 0.2;
  lightboxScale = Math.min(Math.max(1, lightboxScale + delta), 4);
  lightboxImg.style.transform = `scale(${lightboxScale})`;
}, { passive: false });


lightbox.addEventListener('transitionend', (e) => {
  if (!lightbox.classList.contains('active')) {
      lightboxScale = 1;
  }
});
