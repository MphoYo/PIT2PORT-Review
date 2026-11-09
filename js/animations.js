/* ==========================================================================
   PIT2PORT GLOBAL RESOURCES (PTY) LTD - ANIMATIONS & SCROLL OBSERVERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. SCROLL REVEAL EFFECT (FADE UP ON SCROLL)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        const revealItems = entry.target.querySelectorAll('.reveal-item');
        if (entry.target.classList.contains('card-grid') || entry.target.classList.contains('stats-grid') || revealItems.length > 0) {
          staggerCards(entry.target);
        }
      }
    });
  }, { 
    threshold: 0.1, 
    rootMargin: '0px 0px -60px 0px' 
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================
  // 2. STAGGERED REVEAL FOR CARD GRIDS
  // ==========================================
  function staggerCards(gridElement) {
    const children = gridElement.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 0.12}s`;
      child.classList.add('active');
    });
  }

  const cardChildren = document.querySelectorAll('.card-premium, .trust-card, .service-card, .industry-card, .blog-card');
  cardChildren.forEach(card => {
    card.classList.add('reveal-item');
    revealObserver.observe(card);
  });

  // ==========================================
  // 3. ESG CIRCULAR PROGRESS GAUGE
  // ==========================================
  const gaugeFill = document.querySelector('.gauge-fill');
  if (gaugeFill) {
    const gaugeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const percent = entry.target.getAttribute('data-percent');
          const radius = 90;
          const circumference = 2 * Math.PI * radius; // 565.48
          const offset = circumference - (percent / 100) * circumference;
          entry.target.style.strokeDashoffset = offset;
        }
      });
    }, { threshold: 0.3 });
    
    gaugeObserver.observe(gaugeFill);
  }

  // ==========================================
  // 4. HERO TEXT ENTRANCE
  // ==========================================
  const heroElements = document.querySelectorAll('.hero-text > *');
  heroElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = `${index * 0.1}s`;
    }, 150);
  });

  // ==========================================
  // 5. PREMIUM INTERACTIVE CARD HOVER EFFECTS
  // ==========================================
  const premiumCards = document.querySelectorAll('.card-premium');
  
  premiumCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation angles based on mouse position relative to center of card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5; // tilt max 5 degrees
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });
});
