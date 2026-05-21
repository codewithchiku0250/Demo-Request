/* ======================================================
   CORE FRONTEND SCRIPT - PIXELCRAFT STUDIOS
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global App State
  const state = {
    currentLang: localStorage.getItem('lang') || 'en',
    currentTheme: localStorage.getItem('theme') || 'dark',
    translations: {}
  };

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[PWA] Service Worker registered with scope: ', reg.scope))
        .catch(err => console.warn('[PWA] Service Worker registration failed: ', err));
    });
  }

  // ----------------- DOM ELEMENTS -----------------
  const pageLoader = document.getElementById('pageLoader');
  const themeToggleBtn = document.getElementById('themeToggle');
  const langToggleBtn = document.getElementById('langToggle');
  const mobileToggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const demoForm = document.getElementById('demoRequestForm');
  const captchaCheck = document.getElementById('captchaCheck');
  
  // File Elements
  const logoInput = document.getElementById('logo');
  const photosInput = document.getElementById('photos');
  const logoPreviewName = document.getElementById('logoPreviewName');
  const photosPreviewCount = document.getElementById('photosPreviewCount');

  // Business Selector Cards
  const businessCards = document.querySelectorAll('.business-card');
  const businessTypeSelect = document.getElementById('businessType');

  // Color picker text
  const colorInput = document.getElementById('preferredColor');
  const colorHexDisplay = document.getElementById('colorHex');

  // Modals
  const successModal = document.getElementById('successModal');
  const btnSuccessClose = document.getElementById('btnSuccessClose');
  const successRequestIdDisplay = document.getElementById('successRequestId');

  // Form validations elements
  const fieldsToValidate = [
    { id: 'fullName', errId: 'errFullName', validation: val => val.trim().length > 0 ? '' : 'required' },
    { id: 'email', errId: 'errEmail', validation: val => {
        if (!val.trim()) return 'required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'email';
      }
    },
    { id: 'mobile', errId: 'errMobile', validation: val => val.trim().length >= 8 ? '' : 'phone' },
    { id: 'businessName', errId: 'errBusinessName', validation: val => val.trim().length > 0 ? '' : 'required' },
    { id: 'businessType', errId: 'errBusinessType', validation: val => val ? '' : 'required' },
    { id: 'requiredService', errId: 'errRequiredService', validation: val => val ? '' : 'required' },
    { id: 'referenceLink', errId: 'errReference', validation: val => {
        if (!val.trim()) return ''; // optional
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val) ? '' : 'url';
      }
    }
  ];

  // Hide page loader once DOM is ready
  setTimeout(() => {
    pageLoader.classList.add('hidden');
  }, 400);

  // ----------------- THEME MANAGER -----------------
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    state.currentTheme = theme;
  };

  // Init Theme
  applyTheme(state.currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // ----------------- MULTI-LANGUAGE TRANSLATION -----------------
  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Could not load ${lang} locale JSON file.`);
      state.translations = await response.json();
      applyTranslations();
      langToggleBtn.textContent = lang === 'en' ? 'ES' : 'EN';
      state.currentLang = lang;
      localStorage.setItem('lang', lang);
    } catch (error) {
      console.error('[Translation Error] ', error.message);
    }
  };

  const applyTranslations = () => {
    const t = state.translations;
    if (!t) return;

    // Helper to write text if element exists
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    
    const setPlaceholder = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('placeholder', text);
    };

    // Header Links
    setText('navBrand', t.nav.brand);
    setText('navLinkHome', t.nav.home);
    setText('navLinkPortfolio', t.nav.portfolio);
    setText('navLinkTestimonials', t.nav.testimonials);
    setText('navCta', t.nav.cta);

    // Hero Section
    setText('heroBadge', t.hero.badge);
    setText('heroHeadline', t.hero.headline);
    document.getElementById('heroHeadline').innerHTML = `${t.hero.headline.split('Website')[0]} <span class="gradient-text">Website or App</span>`;
    setText('heroSubheading', t.hero.subheading);
    setText('heroCtaRequest', t.hero.cta_request);
    setText('heroCtaPortfolio', t.hero.cta_portfolio);

    // Business type title
    setText('businessTypesTitle', t.business_types.title);
    setText('businessTypesSubtitle', t.business_types.subtitle);
    setText('btnShop', t.business_types.shop);
    setText('btnRestaurant', t.business_types.restaurant);
    setText('btnClinic', t.business_types.clinic);
    setText('btnHotel', t.business_types.hotel);
    setText('btnSalon', t.business_types.salon);
    setText('btnGym', t.business_types.gym);
    setText('btnSchool', t.business_types.school);
    setText('btnCoaching', t.business_types.coaching);
    setText('btnRealestate', t.business_types.realestate);
    setText('btnOther', t.business_types.other);

    // Form labels & placeholders
    setText('formSectionPersonal', t.form.section_personal);
    setText('formSectionBusiness', t.form.section_business);
    setText('formSectionTechnical', t.form.section_technical);

    setText('lblFullName', t.form.full_name + ' *');
    setPlaceholder('fullName', t.form.full_name_placeholder);
    
    setText('lblEmail', t.form.email + ' *');
    setPlaceholder('email', t.form.email_placeholder);

    setText('lblMobile', t.form.mobile + ' *');
    setPlaceholder('mobile', t.form.mobile_placeholder);

    setText('lblWhatsapp', t.form.whatsapp);
    setPlaceholder('whatsapp', t.form.whatsapp_placeholder);

    setText('lblBusinessName', t.form.business_name + ' *');
    setPlaceholder('businessName', t.form.business_name_placeholder);

    setText('lblBusinessType', t.form.business_type + ' *');
    setText('selectBusinessType', t.form.business_type + '...');

    setText('lblAddress', t.form.address);
    setPlaceholder('businessAddress', t.form.address_placeholder);

    setText('lblCityState', t.form.city_state);
    setPlaceholder('cityState', t.form.city_state_placeholder);

    setText('lblDesc', t.form.desc);
    setPlaceholder('businessDescription', t.form.desc_placeholder);

    setText('lblService', t.form.service + ' *');
    setText('selectService', t.form.service_select);

    setText('lblColor', t.form.color);
    setText('lblLogo', t.form.logo);
    setText('lblPhotos', t.form.photos);
    setText('lblFeatures', t.form.features);

    setText('lblBudget', t.form.budget);
    setText('selectBudget', t.form.budget_select);

    setText('lblDeadline', t.form.deadline);
    setText('lblReference', t.form.reference);
    setPlaceholder('referenceLink', t.form.reference_placeholder);

    setText('lblNotes', t.form.notes);
    setPlaceholder('additionalNotes', t.form.notes_placeholder);

    setText('btnSubmitText', t.form.submit);

    // Testimonials
    setText('testimonialsTitle', t.testimonials.title);
    setText('testimonialsSubtitle', t.testimonials.subtitle);
    setText('textRestaurant', t.testimonials.text_restaurant);
    setText('roleRestaurant', t.testimonials.role_restaurant);
    setText('textGym', t.testimonials.text_gym);
    setText('roleGym', t.testimonials.role_gym);
    setText('textClinic', t.testimonials.text_clinic);

    // Portfolio
    setText('portfolioTitle', t.portfolio.title);
    setText('portfolioSubtitle', t.portfolio.subtitle);
    setText('lnkRestaurantLive', t.portfolio.view_live);
    setText('lnkSalonLive', t.portfolio.view_live);
    setText('lnkRealestateLive', t.portfolio.view_live);
    setText('btnFullPortfolio', t.portfolio.view_full_portfolio);
    setText('tagRestaurant', t.portfolio.tag_restaurant);
    setText('descRestaurant', t.portfolio.desc_restaurant);
    setText('tagSalon', t.portfolio.tag_salon);
    setText('descSalon', t.portfolio.desc_salon);
    setText('tagRealestate', t.portfolio.tag_realestate);
    setText('descRealestate', t.portfolio.desc_realestate);

    // Footer
    setText('footerCtaDesc', t.footer.cta_desc);
    setText('footerRights', t.footer.rights);

    // Success Modal
    setText('successTitle', t.success.title);
    setText('successMsg1', t.success.msg1);
    setText('successMsg2', t.success.msg2);
    setText('btnSuccessClose', t.success.button);
  };

  // Init Translation
  loadTranslations(state.currentLang);

  langToggleBtn.addEventListener('click', () => {
    const nextLang = state.currentLang === 'en' ? 'es' : 'en';
    loadTranslations(nextLang);
  });

  // ----------------- MOBILE MENU -----------------
  mobileToggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggleBtn.classList.toggle('active');
  });

  // Close menu on click link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggleBtn.classList.remove('active');
    });
  });

  // Header Scroll blur
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ----------------- BUSINESS SELECTION INTERACTIONS -----------------
  businessCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected class from others
      businessCards.forEach(c => c.classList.remove('selected'));
      
      // Add class to current
      card.classList.add('selected');

      // Sync selector dropdown
      const type = card.getAttribute('data-type');
      businessTypeSelect.value = type;

      // Reset validation warnings for businessType
      const errEl = document.getElementById('errBusinessType');
      if (errEl) errEl.textContent = '';
      businessTypeSelect.style.borderColor = '';

      // Smooth scroll to form section
      document.getElementById('request-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Synchronize dropdown back to visual cards if modified manually
  businessTypeSelect.addEventListener('change', () => {
    const selectedVal = businessTypeSelect.value;
    businessCards.forEach(card => {
      if (card.getAttribute('data-type') === selectedVal) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  });

  // Color picker HEX label synchronization
  colorInput.addEventListener('input', () => {
    colorHexDisplay.textContent = colorInput.value.toUpperCase();
  });

  // File Upload indicators
  logoInput.addEventListener('change', () => {
    if (logoInput.files && logoInput.files[0]) {
      logoPreviewName.textContent = `Attached: ${logoInput.files[0].name}`;
    } else {
      logoPreviewName.textContent = '';
    }
  });

  photosInput.addEventListener('change', () => {
    const fileCount = photosInput.files.length;
    if (fileCount > 0) {
      if (fileCount > 5) {
        photosPreviewCount.textContent = '❌ Warning: Max 5 photos allowed';
        photosPreviewCount.style.color = '#ef4444';
      } else {
        photosPreviewCount.textContent = `Attached: ${fileCount} files selected`;
        photosPreviewCount.style.color = '';
      }
    } else {
      photosPreviewCount.textContent = '';
      photosPreviewCount.style.color = '';
    }
  });

  // ----------------- INLINE INPUT VALIDATION -----------------
  const validateField = (fieldObj) => {
    const input = document.getElementById(fieldObj.id);
    const errEl = document.getElementById(fieldObj.errId);
    
    if (!input || !errEl) return true;

    const errorKey = fieldObj.validation(input.value);
    
    if (errorKey) {
      const text = state.translations.validation?.[errorKey] || 'Invalid field';
      errEl.textContent = text;
      input.style.borderColor = '#ef4444';
      return false;
    } else {
      errEl.textContent = '';
      input.style.borderColor = '';
      return true;
    }
  };

  // Add real-time event listeners on blur
  fieldsToValidate.forEach(field => {
    const input = document.getElementById(field.id);
    if (input) {
      input.addEventListener('blur', () => validateField(field));
      input.addEventListener('input', () => {
        // Clear errors as soon as they type
        const errEl = document.getElementById(field.errId);
        if (errEl) errEl.textContent = '';
        input.style.borderColor = '';
      });
    }
  });

  // ----------------- FORM SUBMIT -----------------
  demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validate all fields
    let isFormValid = true;
    fieldsToValidate.forEach(field => {
      const isValid = validateField(field);
      if (!isValid) isFormValid = false;
    });

    // 2. Validate captcha
    const errCaptcha = document.getElementById('errCaptcha');
    if (!captchaCheck.checked) {
      errCaptcha.textContent = state.translations.validation?.required || 'Verification required';
      isFormValid = false;
    } else {
      errCaptcha.textContent = '';
    }

    // 3. File limits validation
    if (photosInput.files.length > 5) {
      alert('Maximum 5 shop photos allowed.');
      isFormValid = false;
    }

    if (!isFormValid) {
      // Scroll to first error
      const firstError = document.querySelector('.error-msg:not(:empty)');
      if (firstError) {
        firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 4. Send API Request
    const btnSubmit = document.getElementById('btnSubmitForm');
    const btnText = document.getElementById('btnSubmitText');
    const spinner = btnSubmit.querySelector('.btn-spinner');

    btnSubmit.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      const formData = new FormData(demoForm);

      // Submit request using AJAX
      const response = await fetch('/api/requests/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An error occurred during submission.');
      }

      // Success Setup
      successRequestIdDisplay.textContent = result.requestId;
      successModal.classList.add('active');

      // Reset form
      demoForm.reset();
      logoPreviewName.textContent = '';
      photosPreviewCount.textContent = '';
      businessCards.forEach(c => c.classList.remove('selected'));
      colorHexDisplay.textContent = '#4F46E5';

    } catch (error) {
      console.error('[Submit Error]', error.message);
      alert(error.message || 'Server error. Please try again.');
    } finally {
      btnSubmit.disabled = false;
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });

  // Modal Close Hook
  btnSuccessClose.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  // Auto copyright year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
