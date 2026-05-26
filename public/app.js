/*
   Kukura · Educación Canina — Interactive Client Logic
   Educación canina a domicilio en Murcia
*/

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Navigation & Theme Toggle
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const themeToggle = document.querySelector('.theme-toggle');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================
  // 2. Before / After Image Slider
  // ==========================================
  const sliderContainer = document.querySelector('.comparison-slider');
  const afterImage = document.querySelector('.image-after');
  const handle = document.querySelector('.slider-handle');

  if (sliderContainer && afterImage && handle) {
    let isDragging = false;

    const moveSlider = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      let percentage = ((clientX - rect.left) / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      afterImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      handle.style.left = `${percentage}%`;
    };

    sliderContainer.addEventListener('mousedown', (e) => { isDragging = true; moveSlider(e.clientX); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    sliderContainer.addEventListener('mousemove', (e) => { if (isDragging) moveSlider(e.clientX); });

    sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; if (e.touches[0]) moveSlider(e.touches[0].clientX); });
    window.addEventListener('touchend', () => { isDragging = false; });
    sliderContainer.addEventListener('touchmove', (e) => { if (isDragging && e.touches[0]) moveSlider(e.touches[0].clientX); });
  }

  // ==========================================
  // 3. Needs Assessment Quiz
  // ==========================================
  const quizData = [
    {
      question: "¿Cuál es la principal situación que quieres trabajar con tu perro?",
      options: [
        { text: "No obedece las órdenes básicas, tira de la correa o no acude a la llamada", score: "basico" },
        { text: "Tiene reactividad, miedo o comportamientos agresivos con personas u otros perros", score: "conducta" },
        { text: "Es cachorro y quiero empezar desde el principio con buenos hábitos", score: "online" },
        { text: "No sé bien cuál es el problema — necesito que alguien lo evalúe", score: "conducta" }
      ]
    },
    {
      question: "¿Qué edad tiene tu perro?",
      options: [
        { text: "Cachorro (menos de 6 meses) — quiero prevenir problemas desde el inicio", score: "online" },
        { text: "Joven (6 meses – 2 años) — tiene energía y le cuesta concentrarse", score: "basico" },
        { text: "Adulto (2 – 7 años) — tiene hábitos ya instaurados que quiero cambiar", score: "conducta" },
        { text: "Senior (más de 7 años) — quiero mejorar su calidad de vida y bienestar", score: "basico" }
      ]
    },
    {
      question: "¿Cómo reacciona tu perro ante estímulos del entorno (otros perros, personas, ruidos)?",
      options: [
        { text: "Se pone muy nervioso, ladra o tira con fuerza hacia ellos", score: "conducta" },
        { text: "Se distrae bastante pero no agrede ni tiene miedo intenso", score: "basico" },
        { text: "Reacciona con miedo — se esconde, se queda bloqueado o huye", score: "conducta" },
        { text: "Responde bastante bien — solo quiero pulir detalles concretos", score: "basico" }
      ]
    },
    {
      question: "¿Cómo prefieres organizar las sesiones?",
      options: [
        { text: "Que Pablo venga a casa — es lo más cómodo y eficaz para nosotros", score: "basico" },
        { text: "Prefiero flexibilidad de horario — las clases online me encajan mejor", score: "online" },
        { text: "Lo antes posible presencialmente — el problema es urgente", score: "conducta" },
        { text: "Me es indiferente — lo que Pablo recomiende", score: "basico" }
      ]
    }
  ];

  let currentStep = 0;
  const userAnswers = [];

  const quizStep = document.getElementById('quiz-step');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressFill = document.getElementById('progress-fill');
  const stepCount = document.getElementById('step-count');
  const quizResult = document.getElementById('quiz-result');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const recDesc = document.getElementById('rec-desc');
  const btnRestart = document.getElementById('btn-restart');
  const btnSelectResultPackage = document.getElementById('btn-select-result-package');

  function initQuiz() {
    if (!quizStep) return;
    currentStep = 0;
    userAnswers.length = 0;
    quizResult.classList.remove('active');
    quizStep.classList.add('active');
    btnPrev.style.visibility = 'hidden';
    btnNext.innerText = 'Siguiente';
    showQuestion();
  }

  function showQuestion() {
    const questionInfo = quizData[currentStep];
    quizQuestion.innerText = questionInfo.question;
    quizOptions.innerHTML = '';

    const progressPercent = (currentStep / quizData.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    stepCount.innerText = `Paso ${currentStep + 1} de ${quizData.length}`;

    questionInfo.options.forEach((option, idx) => {
      const optionEl = document.createElement('div');
      optionEl.classList.add('quiz-option');
      if (userAnswers[currentStep] === idx) optionEl.classList.add('selected');

      optionEl.innerHTML = `
        <div class="quiz-radio"></div>
        <div class="quiz-option-text">${option.text}</div>
      `;

      optionEl.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
        optionEl.classList.add('selected');
        userAnswers[currentStep] = idx;
        btnNext.disabled = false;
      });

      quizOptions.appendChild(optionEl);
    });

    btnNext.disabled = userAnswers[currentStep] === undefined;
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    btnNext.innerText = currentStep === quizData.length - 1 ? 'Ver Resultado' : 'Siguiente';
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentStep < quizData.length - 1) {
        currentStep++;
        showQuestion();
      } else {
        showResults();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 0) { currentStep--; showQuestion(); }
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', initQuiz);
  }

  function showResults() {
    quizStep.classList.remove('active');
    quizResult.classList.add('active');
    progressFill.style.width = '100%';
    stepCount.innerText = 'Resultado';

    const scores = { basico: 0, conducta: 0, online: 0 };
    userAnswers.forEach((ansIdx, qIdx) => {
      const scoreType = quizData[qIdx].options[ansIdx].score;
      scores[scoreType]++;
    });

    let rec = 'basico';
    if (scores.conducta >= scores.basico && scores.conducta >= scores.online) {
      rec = 'conducta';
    } else if (scores.online >= scores.basico && scores.online >= scores.conducta) {
      rec = 'online';
    }

    if (rec === 'basico') {
      resultTitle.innerText = "Educación a Domicilio — el punto de partida ideal";
      resultDesc.innerText = "Tu perro necesita construir una base sólida de obediencia y comunicación en su propio entorno. Las sesiones a domicilio son la forma más eficaz de conseguirlo.";
      recDesc.innerText = "Pablo viene a tu casa y trabaja contigo y tu perro en el entorno real. Obediencia básica, paseo con correa, recall y convivencia armoniosa. Resultados visibles desde las primeras sesiones.";
      btnSelectResultPackage.setAttribute('data-target-package', 'basico');
    } else if (rec === 'conducta') {
      resultTitle.innerText = "Modificación de Conducta — abordamos el origen del problema";
      resultDesc.innerText = "Tu perro muestra señales que requieren un trabajo más específico y especializado. El programa de modificación de conducta está diseñado exactamente para esta situación.";
      recDesc.innerText = "Pablo realiza una evaluación exhaustiva, identifica los desencadenantes y diseña un protocolo personalizado. El cambio es profundo, progresivo y duradero.";
      btnSelectResultPackage.setAttribute('data-target-package', 'conducta');
    } else {
      resultTitle.innerText = "Cachorros / Online — empieza con el pie derecho";
      resultDesc.innerText = "La etapa de cachorro es la más importante para sentar unas bases sólidas. También puedes optar por el formato online si necesitas más flexibilidad de horario.";
      recDesc.innerText = "Socialización, hábitos desde el primer día, prevención de conductas problemáticas. Pablo te guía paso a paso para que tu cachorro crezca equilibrado y seguro.";
      btnSelectResultPackage.setAttribute('data-target-package', 'online');
    }
  }

  if (btnSelectResultPackage) {
    btnSelectResultPackage.addEventListener('click', () => {
      const targetPkg = btnSelectResultPackage.getAttribute('data-target-package');
      selectPackage(targetPkg);
      document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
  }

  initQuiz();

  // ==========================================
  // 4. Pricing Calculator
  // ==========================================
  const pkgBasico = document.getElementById('pkg-basico');
  const pkgConducta = document.getElementById('pkg-conducta');
  const pkgOnline = document.getElementById('pkg-online');
  const rangeSessions = document.getElementById('range-sessions');
  const sessionCountVal = document.getElementById('session-count-val');
  const sessionsLabel = document.getElementById('sessions-label');

  const addonHome = document.getElementById('addon-home');
  const addonSupport = document.getElementById('addon-support');
  const addonMaterials = document.getElementById('addon-materials');

  const summaryPackageName = document.getElementById('summary-package-name');
  const summaryPackagePrice = document.getElementById('summary-package-price');
  const summarySessionsCount = document.getElementById('summary-sessions-count');
  const summarySessionsPrice = document.getElementById('summary-sessions-price');
  const summaryAddonsList = document.getElementById('summary-addons-list');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const btnBookSession = document.getElementById('btn-book-session');

  const packages = {
    basico:   { name: "Educación a Domicilio",    unitPrice: 35, unitLabel: "sesiones", sliderMin: 1, sliderMax: 10, sliderDefault: 5, priceLabel: "35€/sesión",  sessionLabel: "2. Número de Sesiones" },
    conducta: { name: "Modificación de Conducta", unitPrice: 50, unitLabel: "sesiones", sliderMin: 1, sliderMax: 10, sliderDefault: 5, priceLabel: "50€/sesión",  sessionLabel: "2. Número de Sesiones" },
    online:   { name: "Cachorros / Online",        unitPrice: 25, unitLabel: "sesiones", sliderMin: 1, sliderMax: 10, sliderDefault: 5, priceLabel: "25€/sesión",  sessionLabel: "2. Número de Sesiones" }
  };

  let activePackage = 'basico';

  function selectPackage(pkgKey) {
    if (!packages[pkgKey]) return;
    activePackage = pkgKey;

    [pkgBasico, pkgConducta, pkgOnline].forEach(el => { if (el) el.classList.remove('selected'); });
    const targetEl = document.getElementById(`pkg-${pkgKey}`);
    if (targetEl) targetEl.classList.add('selected');

    const pkg = packages[pkgKey];
    rangeSessions.min = pkg.sliderMin;
    rangeSessions.max = pkg.sliderMax;
    rangeSessions.value = pkg.sliderDefault;
    sessionCountVal.innerText = pkg.sliderDefault;

    if (sessionsLabel) {
      sessionsLabel.innerText = pkg.sessionLabel;
    }

    calculateCosts();
  }

  function setupCalculatorEvents() {
    if (!pkgBasico) return;

    pkgBasico.addEventListener('click', () => selectPackage('basico'));
    pkgConducta.addEventListener('click', () => selectPackage('conducta'));
    pkgOnline.addEventListener('click', () => selectPackage('online'));

    rangeSessions.addEventListener('input', (e) => {
      sessionCountVal.innerText = e.target.value;
      calculateCosts();
    });

    [addonHome, addonSupport, addonMaterials].forEach(addon => {
      if (addon) addon.addEventListener('click', () => { addon.classList.toggle('selected'); calculateCosts(); });
    });

    if (btnBookSession) {
      btnBookSession.addEventListener('click', () => {
        const pkg = packages[activePackage];
        const qty = rangeSessions.value;
        const total = summaryTotalPrice.innerText;
        const msg = `Hola Pablo, me gustaría información sobre: *${pkg.name}* — ${qty} ${pkg.unitLabel}. Presupuesto estimado: *${total}*.`;
        const contactMessage = document.getElementById('message');
        if (contactMessage) contactMessage.value = msg;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function calculateCosts() {
    if (!rangeSessions) return;

    const pkg = packages[activePackage];
    const qty = parseInt(rangeSessions.value);
    const baseCost = pkg.unitPrice * qty;

    let addonsTotal = 0;
    const activeAddonsNames = [];

    if (addonHome && addonHome.classList.contains('selected')) {
      const extraCost = qty * 10;
      addonsTotal += extraCost;
      activeAddonsNames.push(`Extrarradio (+${extraCost}€)`);
    }
    if (addonSupport && addonSupport.classList.contains('selected')) {
      addonsTotal += 20;
      activeAddonsNames.push("Soporte WhatsApp (+20€)");
    }
    if (addonMaterials && addonMaterials.classList.contains('selected')) {
      addonsTotal += 25;
      activeAddonsNames.push("Informe evaluación (+25€)");
    }

    const grandTotal = baseCost + addonsTotal;

    if (summaryPackageName) {
      summaryPackageName.innerText = pkg.name;
      summaryPackagePrice.innerText = pkg.priceLabel;
      summarySessionsCount.innerText = `${qty} ${pkg.unitLabel}`;
      summarySessionsPrice.innerText = `${baseCost}€`;
      summaryAddonsList.innerText = activeAddonsNames.length > 0 ? activeAddonsNames.join(', ') : 'Ninguno';
      summaryAddonsPrice.innerText = `+${addonsTotal}€`;

      summaryTotalPrice.classList.remove('pulse');
      void summaryTotalPrice.offsetWidth;
      summaryTotalPrice.classList.add('pulse');
      summaryTotalPrice.innerText = `${grandTotal}€`;
    }
  }

  setupCalculatorEvents();
  calculateCosts();

  // ==========================================
  // 5. Testimonial Carousel
  // ==========================================
  const track = document.querySelector('.reviews-track');
  const slides = Array.from(document.querySelectorAll('.review-slide'));
  const dotsContainer = document.querySelector('.reviews-nav');

  if (track && slides.length > 0 && dotsContainer) {
    let currentSlideIdx = 0;

    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('review-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(idx);
        clearInterval(autoPlayInterval);
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(document.querySelectorAll('.review-dot'));

    function goToSlide(idx) {
      currentSlideIdx = idx;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[idx].classList.add('active');
    }

    let autoPlayInterval = setInterval(() => {
      goToSlide((currentSlideIdx + 1) % slides.length);
    }, 5000);
  }

  // ==========================================
  // 6. FAQ Accordion
  // ==========================================
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-body').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const body = item.querySelector('.faq-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 7. Contact Form
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formStatus.innerText = "Por favor, rellena los campos obligatorios (Nombre, Email y Mensaje).";
        formStatus.className = "form-status error";
        return;
      }

      formStatus.innerText = "¡Gracias por contactar con Kukura! Pablo te responderá lo antes posible.";
      formStatus.className = "form-status success";
      contactForm.reset();

      setTimeout(() => { formStatus.style.display = 'none'; }, 5000);
    });
  }

});
