document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. SCROLL ACTIONS (HEADER & PROGRESS BAR)
  // ==========================================
  const header = document.querySelector('.header');
  const scrollProgress = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (windowHeight > 0) {
      const scrolled = (window.scrollY / windowHeight) * 100;
      scrollProgress.style.width = scrolled + '%';
    }
  }, { passive: true });

  // ==========================================
  // 2. MOBILE NAVIGATION MENU
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navMenu) {
    const languageItem = document.createElement('div');
    languageItem.className = 'language-switcher';
    languageItem.innerHTML = `
      <div id="google_translate_element"></div>
      <span class="language-switcher-status" role="status" aria-live="polite"></span>
    `;
    navMenu.parentElement.insertBefore(languageItem, menuToggle || navMenu);

    window.googleTranslateElementInit = () => {
      if (!window.google || !window.google.translate) {
        languageItem.querySelector('.language-switcher-status').textContent = 'Language selection unavailable.';
        console.error('The translation service did not initialize.');
        return;
      }

      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'af,zu,fr,pt,zh-CN,ms,ta',
        autoDisplay: false
      }, 'google_translate_element');

      const configureLanguageSelect = () => {
        const languageSelect = languageItem.querySelector('.goog-te-combo');
        if (!languageSelect || languageSelect.options.length === 0) {
          return false;
        }

        languageSelect.setAttribute('aria-label', 'Select language');

        if (!Array.from(languageSelect.options).some(option => option.value === 'en')) {
          const englishOption = document.createElement('option');
          englishOption.value = 'en';
          englishOption.textContent = 'English';
          languageSelect.insertBefore(englishOption, languageSelect.firstChild);
        }

        if (languageSelect.dataset.englishResetHandler !== 'true') {
          languageSelect.dataset.englishResetHandler = 'true';
          languageSelect.addEventListener('change', event => {
            if (languageSelect.value === 'en') {
              event.stopImmediatePropagation();
              sessionStorage.setItem('pit2port-language', 'en');

              const hostname = window.location.hostname;
              const rootDomain = hostname.split('.').slice(-2).join('.');
              const cookieDomains = new Set([hostname, `.${hostname}`, `.${rootDomain}`]);
              document.cookie = 'googtrans=; Max-Age=0; path=/';
              cookieDomains.forEach(domain => {
                if (domain && domain !== '.') {
                  document.cookie = `googtrans=; Max-Age=0; path=/; domain=${domain}`;
                }
              });
              window.location.reload();
            } else {
              sessionStorage.removeItem('pit2port-language');
            }
          }, true);
        }

        if (sessionStorage.getItem('pit2port-language') === 'en') {
          languageSelect.value = 'en';
        }
        return true;
      };

      const languageSelectObserver = new MutationObserver(() => {
        configureLanguageSelect();
      });
      languageSelectObserver.observe(languageItem, { childList: true, subtree: true });
      configureLanguageSelect();
    };

    const translateScript = document.createElement('script');
    translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    translateScript.async = true;
    translateScript.onerror = () => {
      languageItem.querySelector('.language-switcher-status').textContent = 'Language selection unavailable. Please try again later.';
      console.error('Could not load the translation service.');
    };
    document.head.appendChild(translateScript);
  }

  if (menuToggle && navMenu) {
    const closeMenu = () => {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('nav-open', !expanded);
      document.body.style.overflow = !expanded ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target === navMenu) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // ==========================================
  // 3. ACTIVE NAVIGATION LINK IDENTIFICATION
  // ==========================================
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === pageName || (pageName === 'index.html' && linkHref === './')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ==========================================
  // 4. INTERACTIVE PIT-TO-PORT VALUE CHAIN WIDGET
  // ==========================================
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const panelContents = document.querySelectorAll('.panel-content');
  const progressLine = document.querySelector('.timeline-progress-line');

  function updateTimeline(activeIndex) {
    timelineSteps.forEach((step, idx) => {
      step.classList.remove('active', 'completed');
      if (idx === activeIndex) {
        step.classList.add('active');
      } else if (idx < activeIndex) {
        step.classList.add('completed');
      }
    });

    if (progressLine) {
      const stepPercent = (activeIndex / (timelineSteps.length - 1)) * 100;
      if (window.innerWidth <= 768) {
        progressLine.style.width = '4px';
        progressLine.style.height = stepPercent + '%';
      } else {
        progressLine.style.height = '4px';
        progressLine.style.width = stepPercent + '%';
      }
    }

    panelContents.forEach((panel, idx) => {
      if (idx === activeIndex) {
        panel.style.display = 'block';
        setTimeout(() => {
          panel.classList.add('active');
        }, 50);
      } else {
        panel.classList.remove('active');
        panel.style.display = 'none';
      }
    });
  }

  if (timelineSteps.length > 0) {
    timelineSteps.forEach((step, index) => {
      step.addEventListener('click', () => {
        updateTimeline(index);
      });
    });
    updateTimeline(0);
  }

  window.addEventListener('resize', () => {
    const activeStep = document.querySelector('.timeline-step.active');
    if (activeStep) {
      const index = Array.from(timelineSteps).indexOf(activeStep);
      updateTimeline(index >= 0 ? index : 0);
    }
  }, { passive: true });

  // ==========================================
  // 5. FAQ ACCORDION MENU
  // ==========================================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = question.nextElementSibling;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        const ans = el.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 6. PREMIUM CONTACT PAGE FORM VALIDATION
  // ==========================================
  const contactForm = document.getElementById('quote-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      const name = document.getElementById('name').value.trim();
      const company = document.getElementById('company').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const commodity = document.getElementById('commodity-type').value;
      const origin = document.getElementById('origin').value.trim();
      const destination = document.getElementById('destination').value.trim();
      const message = document.getElementById('message').value.trim();
      
      if (!name || !company || !email || !phone || !commodity || !origin || !destination || !message) {
        showFormAlert(contactForm, 'Please fill out all required fields.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: rotateClockwise 1s linear infinite; width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle>
          <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
        </svg>
        Transmitting Inquiry...
      `;
      
      const formData = new FormData(contactForm);
      
      fetch('process_contact.php', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        return response.json().then(data => {
          if (!response.ok) {
            throw new Error(data.message || 'Transmission failed.');
          }
          return data;
        });
      })
      .then(data => {
        showFormAlert(contactForm, data.message || 'Thank you. Your request has been securely transmitted.', 'success');
        contactForm.reset();
        
        // Reset category buttons to original state
        const inquiryTypeInput = document.getElementById('inquiry-type');
        if (inquiryTypeInput) inquiryTypeInput.value = 'General Inquiry';
        const formHeading = document.getElementById('form-heading');
        if (formHeading) formHeading.textContent = 'General Inquiry';
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach((btn, idx) => {
          if (idx === 0) {
            btn.classList.add('active');
            btn.style.borderColor = 'var(--accent-teal)';
            btn.style.color = 'var(--accent-teal)';
          } else {
            btn.classList.remove('active');
            btn.style.borderColor = 'var(--glass-border)';
            btn.style.color = '';
          }
        });
      })
      .catch(error => {
        showFormAlert(contactForm, error.message || 'System error: Unable to transmit your request.', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
    });
  }

  function showFormAlert(formElement, message, type) {
    const existingAlert = formElement.querySelector('.form-alert');
    if (existingAlert) existingAlert.remove();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `form-alert ${type}`;
    alertDiv.style.padding = '1.25rem';
    alertDiv.style.marginBottom = '2rem';
    alertDiv.style.borderRadius = '6px';
    alertDiv.style.fontSize = '0.95rem';
    alertDiv.style.lineHeight = '1.5';
    alertDiv.style.transition = 'all 0.3s ease';
    
    if (type === 'success') {
      alertDiv.style.background = 'rgba(16, 185, 129, 0.1)';
      alertDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      alertDiv.style.color = '#34d399';
    } else {
      alertDiv.style.background = 'rgba(239, 68, 68, 0.1)';
      alertDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      alertDiv.style.color = '#f87171';
    }
    
    alertDiv.textContent = message;
    formElement.insertBefore(alertDiv, formElement.firstChild);
    
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => alertDiv.remove(), 300);
    }, 8000);
  }
});
