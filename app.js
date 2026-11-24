// אפליקציה אינטראקטיבית ומיני-סייטים - הטיסה של חבר וחברה 💜 
document.addEventListener("DOMContentLoaded", () => {
  // Application State
  let currentActiveMiniSite = "view-home";
  let currentDay = 1;
  let foodFilter = "all";
  let foodSort = "rank";
  let foodViewMode = "cards";
  let tasteFilter = "all";
  let tasteSort = "rank";
  let tasteViewMode = "cards";
  let barsSort = "distance";
  let shoppingFilter = "all";
  let shoppingSort = "rank";
  let attractionsFilter = "all";
  let attractionsSort = "rank";
  let completedItems = {};
  try { completedItems = JSON.parse(localStorage.getItem("budapest_completed_2026") || "{}") || {}; } catch (e) { completedItems = {}; }

  // שער אוקטובר 2026: 1 ש"ח ≈ 105 פורינט (כלומר 10,000 HUF ≈ 95 ₪)
  const HUF_PER_ILS = 105;
  const HUF_PER_EUR = 364;
  const TAX_FREE_MIN_HUF = 68000; // NAV 2026: מעל 175 € = 68,000 HUF

  // DOM Elements
  const navButtons = document.querySelectorAll(".nav-btn");
  const miniSiteViews = document.querySelectorAll(".minisite-view");
  const itineraryDayPills = document.getElementById("itinerary-day-pills");
  const activeDayContent = document.getElementById("active-day-content");
  const resetItineraryBtn = document.getElementById("reset-itinerary-btn");

  const foodItemsGrid = document.getElementById("food-items-grid");
  const foodSearchInput = document.getElementById("food-search-input");
  const foodFilterPills = document.querySelectorAll("#food-filter-pills .filter-pill");

  const tasteItemsGrid = document.getElementById("taste-items-grid");
  const tasteSearchInput = document.getElementById("taste-search-input");
  const tasteFilterPills = document.querySelectorAll("#taste-filter-pills .filter-pill");

  const barsItemsGrid = document.getElementById("bars-items-grid");
  const barsSearchInput = document.getElementById("bars-search-input");

  const shoppingItemsGrid = document.getElementById("shopping-items-grid");
  const shoppingSearchInput = document.getElementById("shopping-search-input");
  const shoppingFilterPills = document.querySelectorAll("#shopping-filter-pills .filter-pill");

  const attractionsItemsGrid = document.getElementById("attractions-items-grid");
  const attractionsSearchInput = document.getElementById("attractions-search-input");
  const attractionsFilterPills = document.querySelectorAll("#attractions-filter-pills .filter-pill");

  const tipsItemsGrid = document.getElementById("tips-items-grid");

  // Currency Modal Elements
  const currencyModalBackdrop = document.getElementById("currency-modal-backdrop");
  const openCurrencyModalBtn = document.getElementById("open-currency-modal-btn");
  const openCurrencyFloatingBtn = document.getElementById("open-currency-floating-btn");
  const quickCurrencyPill = document.getElementById("quick-currency-pill");
  const closeCurrencyModalBtn = document.getElementById("close-currency-modal-btn");
  const modalHufInput = document.getElementById("modal-huf-input");
  const modalIlsInput = document.getElementById("modal-ils-input");
  const chipValButtons = document.querySelectorAll(".chip-val-btn");

  // Countdown timer element
  const countdownTimer = document.getElementById("countdown-timer");

  // Expand/Collapse accordion in Compact Table/List View
  window.toggleRowExpand = function(rowElement) {
    rowElement.classList.toggle("expanded");
    const tray = rowElement.nextElementSibling;
    if (tray && tray.classList.contains("compact-expanded-tray")) {
      tray.classList.toggle("active");
    }
  };

  // ==================== MINI-SITE VIEW SWITCHING & HISTORY ====================
  let isHandlingModalClose = false;

  function pushModalHistory(modalName) {
    try {
      history.pushState({ modal: modalName, view: currentActiveMiniSite }, '');
    } catch (e) {
      console.warn('History pushState error:', e);
    }
  }

  function closeModalCleanly(backdropElement, fromPopState = false) {
    if (backdropElement) {
      backdropElement.classList.remove("open");
    }
    const anyModalOpen = document.querySelector('.modal-backdrop.open');
    if (!anyModalOpen) {
      document.body.style.overflow = "";
    }
    if (!fromPopState && history.state && history.state.modal) {
      isHandlingModalClose = true;
      try {
        history.back();
      } catch (e) {
        isHandlingModalClose = false;
      }
    }
  }

  // Categories Menu Modal Elements
  const categoriesModalBackdrop = document.getElementById("categories-modal-backdrop");
  const closeCategoriesTopBtn = document.getElementById("close-categories-top-btn");
  const closeCategoriesFooterBtn = document.getElementById("close-categories-footer-btn");

  window.openCategoriesMenu = function() {
    if (categoriesModalBackdrop) {
      categoriesModalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      pushModalHistory('categories');
    }
  };

  window.closeCategoriesMenu = function(fromPopState = false) {
    closeModalCleanly(categoriesModalBackdrop, fromPopState);
  };

  if (closeCategoriesTopBtn) {
    closeCategoriesTopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.closeCategoriesMenu();
    });
  }
  if (closeCategoriesFooterBtn) {
    closeCategoriesFooterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.closeCategoriesMenu();
    });
  }
  if (categoriesModalBackdrop) {
    categoriesModalBackdrop.addEventListener("click", (e) => {
      if (e.target === categoriesModalBackdrop) {
        window.closeCategoriesMenu();
      }
    });
  }

  window.setAttractionsFilter = function(filterVal) {
    const pill = document.querySelector(`#attractions-filter-pills .filter-pill[data-filter="${filterVal}"]`);
    if (pill) {
      pill.click();
    }
  };

  window.switchMiniSite = function(targetViewId, pushHistory = true) {
    if (currentActiveMiniSite === targetViewId) {
      const openModals = document.querySelectorAll(".modal-backdrop.open");
      if (openModals.length > 0) {
        openModals.forEach(m => m.classList.remove("open"));
        document.body.style.overflow = "";
      }
      return;
    }

    // If any modal is open, close it cleanly without bouncing history
    const openModals = document.querySelectorAll(".modal-backdrop.open");
    openModals.forEach(m => m.classList.remove("open"));
    document.body.style.overflow = "";

    currentActiveMiniSite = targetViewId;

    if (pushHistory) {
      try {
        if (targetViewId !== "view-home") {
          history.pushState({ view: targetViewId }, '', '#' + targetViewId.replace('view-', ''));
        } else {
          history.pushState({ view: 'view-home' }, '', window.location.pathname);
        }
      } catch (e) {
        console.warn('History pushState error:', e);
      }
    }

    // Update Nav Buttons
    navButtons.forEach(btn => {
      if (btn.getAttribute("data-target") === targetViewId) {
        btn.classList.add("active");
        try {
          btn.scrollIntoView({ inline: "center", block: "nearest" });
        } catch(e) {}
      } else {
        btn.classList.remove("active");
      }
    });

    // Update Mobile Bottom Nav Buttons
    const bottomNavItems = document.querySelectorAll(".bottom-nav-item[data-target]");
    bottomNavItems.forEach(btn => {
      if (btn.getAttribute("data-target") === targetViewId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update Views
    miniSiteViews.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    if (targetViewId === "view-must-taste") {
      renderMustTaste();
    } else if (targetViewId === "view-food") {
      renderRestaurants();
    }

    window.scrollTo(0, 0);
  };

  // Popstate handler - intercepts phone/browser back button to prevent exiting the app!
  window.addEventListener("popstate", (e) => {
    if (isHandlingModalClose) {
      isHandlingModalClose = false;
      return;
    }

    // 1. If any modal is open, back button closes the modal and stays in the app
    const openModals = document.querySelectorAll(".modal-backdrop.open");
    if (openModals.length > 0) {
      openModals.forEach(m => m.classList.remove("open"));
      document.body.style.overflow = "";
      return;
    }

    // 2. If no modal is open, navigate between views
    if (e.state && e.state.view) {
      window.switchMiniSite(e.state.view, false);
    } else {
      if (currentActiveMiniSite !== "view-home") {
        window.switchMiniSite("view-home", false);
      }
    }
  });

  // Set initial history state
  try {
    const initialHash = window.location.hash;
    if (initialHash && document.getElementById('view-' + initialHash.replace('#', ''))) {
      const target = 'view-' + initialHash.replace('#', '');
      window.switchMiniSite(target, false);
      history.replaceState({ view: target }, '');
    } else {
      history.replaceState({ view: 'view-home' }, '');
    }
  } catch (e) {}

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      switchMiniSite(target);
    });
  });

  // ==================== GLOBAL HELPER ACTIONS (LUXURY TRAVEL UI) ====================
  window.toggleActivityDone = function(actId) {
    completedItems[actId] = !completedItems[actId];
    try { localStorage.setItem("budapest_completed_2026", JSON.stringify(completedItems)); } catch (e) {}
    renderActiveDay();
  };

  window.selectDayAndGo = function(dayNum) {
    if (dayNum !== currentDay) openActivityId = null;
    currentDay = dayNum;
    renderItineraryPills();
    renderActiveDay();
    window.switchMiniSite("view-itinerary");
    window.scrollTo(0, 0);
  };

  window.shareTripWhatsApp = function() {
    const text = `היי! 💜 הנה אפליקציית הטיול המלאה שלנו לבודפשט (24-28 נובמבר):
🛫 טיסות, מלון ולו״ז יומי
🏨 מלון בוטיק Casati + בריכת Cortile המחוממת על הגג
🍔 26 מסעדות מובחרות (הוט סטון, סושי, בורגרים)
📅 לו״ז מתוזמן לפי שעות לכל 5 הימים
🛍️ שופינג, שווקי כריסמס, החזר מס וממיר פורינט

פשוט פתח/י ישירות כאן בטלפון:
https://bencohen05.github.io/budapest-trip/`;
    const waUrl = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(waUrl, "_blank");
  };

  // ==================== MASTER ROUTE & DAYS OVERVIEW (SCREENSHOT 2) ====================
  function renderMasterRoute() {
    const container = document.getElementById("master-route-container");
    if (!container) return;

    const daysHtml = TRIP_DATA.itinerary.map((day, idx) => {
      const dateParts = (day.date || "").split(".");
      const dayNumStr = dateParts[0] || (24 + idx);
      const weekdayStr = day.dayName ? day.dayName.replace("יום ", "") : "";
      const thumbImg = (day.schedule && day.schedule[0] && day.schedule[0].image) ? day.schedule[0].image : "images/danube-cruise.jpg";
      const activityCount = day.schedule ? day.schedule.length : 5;

      return `
        <div class="route-day-row">
          <div class="route-date-block">
            <span class="route-date-num">${dayNumStr}</span>
            <span class="route-date-month">נוב׳</span>
            <span class="route-date-weekday">${weekdayStr}</span>
          </div>

          <div class="route-day-card" onclick="selectDayAndGo(${day.dayNumber})">
            <div class="route-day-thumb">
              <img src="${thumbImg}" alt="${day.title}" loading="lazy" decoding="async">
            </div>
            <div class="route-day-details">
              <span class="route-day-chip">יום ${day.dayNumber}</span>
              <h3 class="route-day-title">${day.title}</h3>
              <p class="route-day-meta">${activityCount} פעילויות • ${day.dayName}</p>
            </div>
            <span class="route-day-arrow">‹</span>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <!-- Master Cover Banner (Screenshot 2) -->
      <div class="route-hero-card">
        <div class="route-hero-media">
          <img src="images/danube-cruise.jpg" alt="Budapest Parliament at Night" class="route-hero-img" loading="eager" decoding="async">
          <div class="route-hero-overlay">
            <span class="route-hero-badge">החופשה שלכם <span class="hu-flag-icon"></span> • 5 ימים</span>
            <h2 class="route-hero-title">בודפשט 2026</h2>
            <span class="route-hero-sub">24 - 28 נובמבר • חוגגים 7 שנים ביחד ❤️</span>
          </div>
        </div>
      </div>

      <!-- Casati Hotel Summary Banner (Screenshot 2) -->
      <div class="route-hotel-banner" onclick="switchMiniSite('view-hotel')">
        <div class="route-hotel-thumb">
          <img src="images/casati-1.jpg" alt="Hotel Casati" loading="lazy" decoding="async">
          <span class="hotel-bed-icon">🛏️</span>
        </div>
        <div class="route-hotel-info">
          <span class="route-hotel-label">מלון הבוטיק שלכם</span>
          <h3 class="route-hotel-name">Hotel Casati Budapest</h3>
          <span class="route-hotel-meta">★ 9.4 Google • בריכת Cortile מחוממת על הגג 🏊</span>
        </div>
        <span class="route-hotel-arrow">‹</span>
      </div>

      <!-- Vertical Days Timeline (Screenshot 2) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin: 16px 4px 10px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0;">ימי הטיול (לפי סדר):</h3>
        <button type="button" class="btn-chip" onclick="selectDayFromSummary(0)" style="font-size: 0.72rem; padding: 3px 8px;">
          📋 כל הלו"ז במלל אחד
        </button>
      </div>

      <div class="route-days-timeline">
        ${daysHtml}
      </div>

      <!-- Quick Summary Link at bottom -->
      <div style="margin-top: 18px; text-align: center;">
        <button type="button" class="btn-primary-action" onclick="switchMiniSite('view-itinerary')" style="margin: 0 auto; display: inline-flex;">
          מעבר לצפייה בלו"ז היומי המפורט ➔
        </button>
      </div>
    `;
  }

  // ==================== HOTEL VIP & CORTILE POOL (SCREENSHOT 3) ====================
  function renderHotelVip() {
    const container = document.getElementById("hotel-vip-container");
    if (!container) return;

    container.innerHTML = `
      <!-- VIP Hero Card (Screenshot 3) -->
      <div class="hotel-vip-hero">
        <div class="hotel-vip-media">
          <img src="images/cortile-pool.jpg" alt="Cortile Heated Rooftop Pool" class="hotel-vip-cover" loading="lazy" decoding="async">
          <div class="hotel-vip-badge-row">
            <span class="hotel-vip-badge-count">2 מלונות שותפים</span>
            <span class="hotel-vip-rating">★ 9.4 Google מצוין</span>
          </div>
        </div>

        <div class="hotel-vip-header-content">
          <div class="hotel-stars-row">★★★★</div>
          <h2 class="hotel-vip-title">Hotel Casati & Cortile Budapest</h2>
          <div class="hotel-vip-address">📍 Paulay Ede u. 31, רובע 6 (ליד האופרה ושדרת אנדראשי)</div>

          <div class="hotel-vip-tags">
            <span class="vip-tag">ארוחת בוקר בופה כלולה</span>
            <span class="vip-tag highlight">בריכה מחוממת על הגג (Cortile) בחינם 🏊</span>
            <span class="vip-tag">סאונה וכושר 24/7</span>
            <span class="vip-tag">TukTuk קוקטייל בר בלובי</span>
            <span class="vip-tag">מבוגרים בלבד (14+)</span>
          </div>
        </div>
      </div>

      <!-- Dual Comparison Cards (Screenshot 3) -->
      <div class="hotel-cards-grid">
        <!-- Card 1: Casati -->
        <div class="hotel-select-card selected">
          <div class="hotel-card-img-wrap">
            <img src="images/casati-2.jpg" alt="Casati Room" loading="lazy" decoding="async">
            <span class="card-status-pill selected">החדר הנבחר שלכם ✓</span>
          </div>
          <div class="hotel-card-body">
            <h4>Hotel Casati Budapest</h4>
            <p class="hotel-card-desc">מלון בוטיק רומנטי למבוגרים בלבד (14+), חדרים שקטים ומעוצבים, ארוחת בוקר מעולה וסאונה פנימית חופשית.</p>
            <div class="hotel-card-hours">📍 רובע 6 היוקרתי • מרחק הליכה קצר מכל מקום</div>
            <a href="https://maps.google.com/?q=Casati+Budapest+Hotel" target="_blank" rel="noopener" class="btn-hotel-nav">
              <span>📍</span> ניווט ל-Casati ב-Google Maps
            </a>
          </div>
        </div>

        <!-- Card 2: Cortile Rooftop Pool -->
        <div class="hotel-select-card perk">
          <div class="hotel-card-img-wrap">
            <img src="images/cortile-pool.jpg" alt="Cortile Heated Pool" loading="lazy" decoding="async">
            <span class="card-status-pill perk">הטבת VIP חינמית 🏊</span>
          </div>
          <div class="hotel-card-body">
            <h4>בריכת Cortile המחוממת על הגג</h4>
            <p class="hotel-card-desc">בריכת אינפיניטי מקורה בזכוכית ומחוממת בקומה העליונה מול שמי בודפשט + בר קוקטיילים SkyBar. כניסה חינם לאורחי Casati!</p>
            <div class="hotel-card-hours">⏰ פתוח כל יום: 06:00 עד 22:00 • 7 דק' הליכה מ-Casati</div>
            <a href="https://maps.google.com/?q=Cortile+Budapest+Hotel" target="_blank" rel="noopener" class="btn-hotel-nav">
              <span>📍</span> ניווט רגלי ל-Cortile (600 מטר)
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== ITINERARY RENDERING (SCREENSHOT 1) ====================
  function renderItineraryPills() {
    if (!itineraryDayPills) return;
    const daysHtml = TRIP_DATA.itinerary.map(day => `
      <div class="itinerary-day-pill ${day.dayNumber === currentDay ? 'active' : ''}" data-day="${day.dayNumber}">
        <div class="pill-date">${day.date}</div>
        <div class="pill-daynum">יום ${day.dayNumber}</div>
        <div class="pill-name">${day.dayName}</div>
      </div>
    `).join("");

    const summaryPillHtml = `
      <div class="itinerary-day-pill summary-tab-pill ${currentDay === 0 ? 'active' : ''}" data-day="0" style="background: ${currentDay === 0 ? 'var(--primary-purple)' : '#fef3c7'}; color: ${currentDay === 0 ? '#fff' : '#92400e'}; border-color: #fde68a;">
        <div class="pill-date">כל הימים</div>
        <div class="pill-daynum">📋 סיכום</div>
        <div class="pill-name">במלל אחד</div>
      </div>
    `;

    itineraryDayPills.innerHTML = daysHtml + summaryPillHtml;

    itineraryDayPills.querySelectorAll(".itinerary-day-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        currentDay = parseInt(pill.getAttribute("data-day"));
        renderItineraryPills();
        renderActiveDay();
      });
    });
  }

  window.selectDayFromSummary = function(dayNum) {
    if (dayNum !== currentDay) openActivityId = null;
    currentDay = dayNum;
    renderItineraryPills();
    renderActiveDay();
    window.scrollTo(0, 0);
  };

  // ==================== ITINERARY: DAY VIEW (stacked photo cards, no gaps) ====================
  const HE_WEEKDAY_LETTER = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const HE_WEEKDAY_NAME = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const DAY_HERO_IMAGES = {
    0: "images/danube-cruise.jpg",
    1: "images/danube-cruise.jpg",
    2: "images/gellert-hill.jpg",
    3: "images/shop-vaci.jpg",
    4: "images/szechenyi-baths.jpg",
    5: "images/vorosmarty-xmas.jpg"
  };
  let openActivityId = null;

  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function dayDateObj(day) {
    const [dd, mm] = (day.date || "").split(".").map(Number);
    return new Date(2026, (mm || 11) - 1, dd || 24);
  }

  function splitTime(range) {
    const parts = String(range || "").split("-").map(s => s.trim());
    return { start: parts[0] || "", end: parts[1] || parts[0] || "" };
  }

  // "🚶‍♂️ הליכה 3 דק' • 200 מ' סביב המלון" -> { icon, main, rest }
  function parseTransit(text) {
    const raw = String(text || "").trim();
    const m = raw.match(/^(\S+)\s+(.*)$/u);
    let icon = "", body = raw;
    if (m && !/[֐-׿A-Za-z0-9]/.test(m[1])) { icon = m[1]; body = m[2]; }
    const [main, ...rest] = body.split("•").map(s => s.trim());
    return { icon, main: main || "", rest: rest.join(" · ") };
  }

  function dayRouteUrl(activities) {
    const stops = activities.map(a => a.mapsQuery || (a.title + " Budapest"));
    if (stops.length < 2) {
      return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(stops[0] || "Budapest");
    }
    const params = new URLSearchParams({
      api: "1",
      origin: stops[0],
      destination: stops[stops.length - 1],
      travelmode: "walking"
    });
    const mids = stops.slice(1, -1).slice(0, 8);
    if (mids.length) params.set("waypoints", mids.join("|"));
    return "https://www.google.com/maps/dir/?" + params.toString();
  }

  function renderDayHero(dayData) {
    const days = TRIP_DATA.itinerary;
    const isSummary = !dayData;
    const heroImg = DAY_HERO_IMAGES[isSummary ? 0 : dayData.dayNumber] || DAY_HERO_IMAGES[0];

    const stripHtml = days.map(d => {
      const dt = dayDateObj(d);
      const isCur = d.dayNumber === currentDay;
      return `
        <button type="button" class="td-day-btn ${isCur ? "is-active" : ""}" onclick="selectDayAndGo(${d.dayNumber})"
          ${isCur ? 'aria-current="date"' : ""} aria-label="יום ${d.dayNumber}, ${HE_WEEKDAY_NAME[dt.getDay()]} ${dt.getDate()} בנובמבר">
          <span class="td-day-num">${dt.getDate()}</span>
          <span class="td-day-dow">${HE_WEEKDAY_NAME[dt.getDay()]}</span>
        </button>`;
    }).join("") + `
        <button type="button" class="td-day-btn td-day-allbtn ${isSummary ? "is-active" : ""}" onclick="selectDayFromSummary(0)"
          ${isSummary ? 'aria-current="page"' : ""} aria-label="סיכום כל הימים">
          <span class="td-day-num" aria-hidden="true">☰</span>
          <span class="td-day-dow">סיכום</span>
        </button>`;

    let topLine, title, meta, mapUrl;
    if (isSummary) {
      topLine = "בודפשט · 24–28 בנובמבר";
      title = "כל הטיול במבט אחד";
      meta = `${days.length} ימים · ${days.reduce((n, d) => n + (d.schedule || []).length, 0)} מקומות`;
      mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Casati Budapest Hotel");
    } else {
      const acts = dayData.schedule || [];
      const dt = dayDateObj(dayData);
      const first = splitTime(acts[0] && acts[0].time).start;
      const last = splitTime(acts[acts.length - 1] && acts[acts.length - 1].time).end;
      topLine = `בודפשט · יום ${dayData.dayNumber} מתוך ${days.length}`;
      title = `${HE_WEEKDAY_NAME[dt.getDay()]}, ${dt.getDate()} בנובמבר`;
      meta = `${acts.length} מקומות${first && last ? ` · ${first}–${last}` : ""}`;
      mapUrl = dayRouteUrl(acts);
    }

    return `
      <header class="td-hero">
        <img class="td-hero-img" src="${heroImg}" alt="" loading="eager" decoding="async">
        <div class="td-hero-shade" aria-hidden="true"></div>
        <div class="td-hero-inner">
          <div class="td-hero-top">
            <button type="button" class="td-round-btn" onclick="switchMiniSite('view-home')" aria-label="חזרה למסך הראשי">
              <span aria-hidden="true">›</span>
            </button>
            <span class="td-hero-route">${topLine}</span>
            <a class="td-map-pill" href="${mapUrl}" target="_blank" rel="noopener" aria-label="מסלול היום ב-Google Maps (נפתח בחלון חדש)">
              <span aria-hidden="true">🗺️</span> מפה
            </a>
          </div>
          <h2 class="td-hero-title">${title}</h2>
          <p class="td-hero-meta">${meta}</p>
          ${!isSummary ? `<p class="td-hero-theme">${escHtml(dayData.title)}</p>` : ""}
          <nav class="td-day-strip" aria-label="בחירת יום בטיול">${stripHtml}</nav>
        </div>
      </header>`;
  }

  function renderActivityItem(act, idx, isLast) {
    const isDone = !!completedItems[act.id];
    const isOpen = openActivityId === act.id;
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(act.mapsQuery || act.title + " Budapest");
    const numStr = String(idx + 1).padStart(2, "0");
    const t = splitTime(act.time);
    const sub = act.categoryLabel || act.location || "";
    const transit = act.transitToNext ? parseTransit(act.transitToNext) : null;

    const transitHtml = transit ? `
      <div class="td-transit">
        ${transit.icon ? `<span class="td-transit-icon" aria-hidden="true">${transit.icon}</span>` : ""}
        <strong>${escHtml(transit.main)}</strong>${transit.rest ? `<span class="td-transit-rest"> · ${escHtml(transit.rest)}</span>` : ""}
      </div>` : "";

    return `
      <li class="td-item ${isOpen ? "is-open" : ""} ${isDone ? "is-done" : ""}" id="card-${act.id}" style="z-index:${50 - idx}">
        <div class="td-card">
          <img class="td-card-img" src="${act.image || "images/danube-cruise.jpg"}" alt="" loading="${idx < 3 ? "eager" : "lazy"}" decoding="async">
          <div class="td-card-shade" aria-hidden="true"></div>
          <button type="button" class="td-card-btn" onclick="toggleCardDetail('${act.id}')"
            aria-expanded="${isOpen}" aria-controls="drawer-${act.id}">
            <span class="td-num" aria-hidden="true">${isDone ? "✓" : numStr}</span>
            <span class="td-text">
              <span class="td-time">${escHtml(t.start)}${act.duration ? ` · ${escHtml(act.duration)}` : ""}</span>
              <span class="td-title">${escHtml(act.title)}</span>
              <span class="td-sub">${escHtml(sub)}</span>
              <span class="sr-only">${isDone ? "(בוצע)" : ""} ${escHtml(act.time)}</span>
            </span>
            <span class="td-chev" aria-hidden="true"></span>
          </button>
        </div>
        <div class="td-drawer" id="drawer-${act.id}" role="region" aria-label="פרטים: ${escHtml(act.title)}">
          <div class="td-drawer-inner">
            <div class="td-drawer-body">
              <div class="td-drawer-facts">
                <span>🕒 ${escHtml(act.time)}</span>
                ${act.location ? `<span>📍 ${escHtml(act.location)}</span>` : ""}
                ${act.distanceText ? `<span>🚶 ${escHtml(act.distanceText)}</span>` : ""}
              </div>
              <p class="td-desc">${escHtml(act.description)}</p>
              ${act.tip ? `<p class="td-tip"><strong>💡 טיפ:</strong> ${escHtml(act.tip)}</p>` : ""}
              <div class="td-actions">
                <a class="td-btn td-btn-maps" href="${mapsUrl}" target="_blank" rel="noopener">
                  <span aria-hidden="true">📍</span> ניווט במפות
                </a>
                <button type="button" class="td-btn td-btn-done ${isDone ? "is-done" : ""}" aria-pressed="${isDone}" onclick="toggleActivityDone('${act.id}')">
                  ${isDone ? "✓ ביקרנו!" : "סמנו V שביקרנו"}
                </button>
              </div>
            </div>
          </div>
        </div>
        ${!isLast ? transitHtml : ""}
      </li>`;
  }

  function renderHomeDays() {
    const box = document.getElementById("home-days-strip");
    if (!box) return;
    const now = new Date();
    box.innerHTML = TRIP_DATA.itinerary.map(day => {
      const dt = dayDateObj(day);
      const isToday = dt.toDateString() === now.toDateString();
      return `
        <button type="button" class="hm-day ${isToday ? "is-today" : ""}" onclick="selectDayAndGo(${day.dayNumber})"
          aria-label="יום ${day.dayNumber}, ${HE_WEEKDAY_NAME[dt.getDay()]} ${dt.getDate()} בנובמבר: ${escHtml(day.title)}">
          <img src="${DAY_HERO_IMAGES[day.dayNumber] || DAY_HERO_IMAGES[0]}" alt="" loading="lazy" decoding="async">
          <span class="hm-day-shade" aria-hidden="true"></span>
          <span class="hm-day-date"><b>${dt.getDate()}</b>${HE_WEEKDAY_NAME[dt.getDay()]}</span>
          <span class="hm-day-title">${escHtml(day.title)}</span>
          ${isToday ? '<span class="hm-day-today">היום</span>' : ""}
        </button>`;
    }).join("");
  }

  window.toggleDirCard = function(ev, card) {
    if (ev && ev.target.closest("a")) return;
    const open = card.classList.toggle("is-expanded");
    card.setAttribute("aria-expanded", String(open));
  };

  window.toggleCardDetail = function(actId) {
    const item = document.getElementById("card-" + actId);
    if (!item) return;
    const willOpen = !item.classList.contains("is-open");
    document.querySelectorAll(".td-item.is-open").forEach(el => {
      el.classList.remove("is-open");
      const b = el.querySelector(".td-card-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    openActivityId = willOpen ? actId : null;
    if (willOpen) {
      item.classList.add("is-open");
      const b = item.querySelector(".td-card-btn");
      if (b) b.setAttribute("aria-expanded", "true");
      setTimeout(() => {
        const r = item.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight - 70) {
          item.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 260);
    }
  };

  window.resetItineraryMarks = function() {
    if (confirm("לאפס את כל סימוני ה-V שסימנתם בלוח הזמנים?")) {
      completedItems = {};
      try { localStorage.removeItem("budapest_completed_2026"); } catch (e) {}
      renderActiveDay();
    }
  };

  function renderActiveDay() {
    if (!activeDayContent) return;

    // ---- Summary tab: all days in short text ----
    if (currentDay === 0) {
      activeDayContent.innerHTML = renderDayHero(null) + `
        <div class="td-sheet">
          <ol class="td-summary-list">
            ${TRIP_DATA.itinerary.map(day => {
              const dt = dayDateObj(day);
              return `
              <li class="td-summary-day">
                <button type="button" class="td-summary-head" onclick="selectDayFromSummary(${day.dayNumber})">
                  <span class="td-summary-date"><b>${dt.getDate()}</b>${HE_WEEKDAY_NAME[dt.getDay()]}</span>
                  <span class="td-summary-title">יום ${day.dayNumber} · ${escHtml(day.title)}</span>
                  <span class="td-summary-go" aria-hidden="true">‹</span>
                </button>
                <p>${escHtml(day.textSummary || day.theme)}</p>
              </li>`;
            }).join("")}
          </ol>
        </div>`;
      return;
    }

    const dayData = TRIP_DATA.itinerary.find(d => d.dayNumber === currentDay);
    if (!dayData) return;
    const activities = dayData.schedule || [];
    const doneCount = activities.filter(a => completedItems[a.id]).length;
    const lastAct = activities[activities.length - 1];
    let lastTransitHtml = "";
    if (lastAct && lastAct.transitToNext) {
      const tr = parseTransit(lastAct.transitToNext);
      lastTransitHtml = `
        <div class="td-transit is-last">
          ${tr.icon ? `<span class="td-transit-icon" aria-hidden="true">${tr.icon}</span>` : ""}
          <strong>${escHtml(tr.main)}</strong>${tr.rest ? `<span class="td-transit-rest"> · ${escHtml(tr.rest)}</span>` : ""}
        </div>`;
    }

    activeDayContent.innerHTML = renderDayHero(dayData) + `
      <div class="td-sheet">
        ${dayData.textSummary ? `
          <details class="td-day-summary">
            <summary>
              <span class="td-day-summary-label">סיכום היום</span>
              <span class="td-day-summary-preview">${escHtml(dayData.theme || dayData.textSummary)}</span>
            </summary>
            <p>${escHtml(dayData.textSummary)}</p>
          </details>` : ""}

        <ol class="td-stack" aria-label="סדר היום">
          ${activities.map((act, idx) => renderActivityItem(act, idx, idx === activities.length - 1)).join("")}
        </ol>
        ${lastTransitHtml}

        <div class="td-footer">
          <span>${doneCount} מתוך ${activities.length} סומנו V</span>
          ${doneCount ? `<button type="button" class="td-link-btn" onclick="resetItineraryMarks()">איפוס סימונים</button>` : ""}
        </div>
      </div>`;
  }

  if (resetItineraryBtn) {
    resetItineraryBtn.addEventListener("click", () => {
      if (confirm("לאפס את כל סימוני ה-V שסימנתם בלוח הזמנים?")) {
        completedItems = {};
        localStorage.removeItem("budapest_completed_2026");
        renderActiveDay();
      }
    });
  }

  // ==================== RESTAURANTS RENDERING WITH PHOTOS ====================
  function renderRestaurants() {
    if (!foodItemsGrid) return;
    const query = (foodSearchInput ? foodSearchInput.value.toLowerCase().trim() : "");

    let filtered = TRIP_DATA.restaurants.filter(item => {
      const matchFilter = (foodFilter === "all") || 
        (foodFilter === "top" && item.rank <= 5) || 
        (foodFilter === item.type);

      const matchSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.nameOrig && item.nameOrig.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        (item.mustOrder && item.mustOrder.toLowerCase().includes(query));

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      foodItemsGrid.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          לא נמצאו מסעדות התואמות את החיפוש 🔍
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => {
      if (foodSort === "distance") {
        return (a.distanceMeters || 0) - (b.distanceMeters || 0);
      }
      return (a.rank || 0) - (b.rank || 0);
    });

    if (foodViewMode === "table") {
      foodItemsGrid.classList.add("table-view");
      foodItemsGrid.innerHTML = filtered.map(item => `
        <div class="compact-row-wrapper">
          <div class="compact-list-row" onclick="toggleRowExpand(this)">
            <img src="${item.image || 'images/danube-cruise.jpg'}" alt="${item.name}" class="compact-row-thumb" loading="lazy" decoding="async" onerror="this.src='images/danube-cruise.jpg'">
            <div class="compact-row-main">
              <div class="compact-row-header">
                <span class="compact-rank-num">#${item.rank}</span>
                <span class="compact-row-title">${item.name}</span>
              </div>
              <div class="compact-row-sub">${item.nameOrig || ''}</div>
              <div class="compact-row-meta">
                ${item.distanceText ? `<span class="compact-badge distance">🚶 ${item.distanceText.split('(')[0].trim()}</span>` : ''}
                <span class="compact-badge kosher">🛡️ ${item.kosherNote ? item.kosherNote.slice(0, 24) + '...' : 'נקי'}</span>
              </div>
            </div>
            <div class="compact-row-actions">
              <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-quick-maps" onclick="event.stopPropagation()" title="פתח ב-Maps">
                📍
              </a>
              <span class="compact-row-chevron">▼</span>
            </div>
          </div>
          <div class="compact-expanded-tray">
            <div class="tray-desc">${item.description}</div>
            <div class="tray-order-box">✨ <strong>מה חובה להזמין:</strong> ${item.mustOrder}</div>
            <div class="tray-actions-row">
              <span style="font-size: 0.74rem; color: var(--text-muted);">📍 ${item.address} | 🕒 ${item.hours}</span>
              <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-primary-action" style="padding: 5px 12px; font-size: 0.76rem;">
                פתח מסלול ב-Maps
              </a>
            </div>
          </div>
        </div>
      `).join("");
      return;
    }

    foodItemsGrid.classList.remove("table-view");
    foodItemsGrid.innerHTML = filtered.map(item => `
      <div class="directory-card has-detail" tabindex="0" role="button" aria-label="${item.name} – פרטים מלאים" onclick="openRestaurantDetail('${item.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openRestaurantDetail('${item.id}');}">
        ${item.image ? `
          <div class="dir-card-media">
            <img src="${item.image}" alt="${item.name}" class="dir-card-img" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
            <div class="dir-media-overlay">
              <span class="dir-rank-badge-overlay">${item.badge}</span>
            </div>
          </div>
        ` : ''}

        <div class="dir-card-body">
          <div class="dir-top-meta">
            ${!item.image ? `<span class="dir-rank-badge">${item.badge}</span>` : ''}
            <span class="dir-rating-text">${item.rating}</span>
          </div>

          <div class="dir-title-row">
            <h3 class="dir-name">${item.name}</h3>
            ${item.nameOrig ? `<div class="dir-orig-name">${item.nameOrig}</div>` : ''}
          </div>

          <div class="dir-tags-row">
            ${item.distanceText ? `<span class="tag-badge distance">🚶 ${item.distanceText}</span>` : ''}
            <span class="tag-badge kosher">🛡️ ${item.kosherNote}</span>
            <span class="tag-badge hours">🕒 ${item.hours}</span>
          </div>

          <p class="dir-description">${item.description}</p>

          <div style="margin: 10px 0 8px;">
            <button type="button" class="btn-open-detail-pill" onclick="event.stopPropagation(); openRestaurantDetail('${item.id}')">
              <span>🍽️</span> דף מידע מלא, מה להזמין & כשרות
            </button>
          </div>

          <div class="dir-must-order-box">
            ✨ <strong>מה חובה להזמין:</strong> ${item.mustOrder}
          </div>

          <div class="dir-bottom-action-bar" onclick="event.stopPropagation();">
            <span class="dir-address-txt">📍 ${item.address}</span>
            <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps">
              <span aria-hidden="true">📍</span> ניווט
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (foodFilterPills) {
    foodFilterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const filterVal = pill.getAttribute("data-filter");
        if (filterVal === "must_taste") {
          switchMiniSite("view-must-taste");
          return;
        }
        foodFilterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        foodFilter = filterVal;
        renderRestaurants();
      });
    });
  }

  if (foodSearchInput) {
    foodSearchInput.addEventListener("input", renderRestaurants);
  }

  // ==================== MUST-TASTE FOODS RENDERING ====================
  function renderMustTaste() {
    if (!tasteItemsGrid || !TRIP_DATA.mustTasteFoods) return;
    const query = (tasteSearchInput ? tasteSearchInput.value.toLowerCase().trim() : "");

    let filtered = TRIP_DATA.mustTasteFoods.filter(item => {
      const matchFilter = (tasteFilter === "all") || (tasteFilter === item.type);
      const matchSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        (item.nameOrig && item.nameOrig.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        item.whereToEat.toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      tasteItemsGrid.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          לא נמצאו מאכלים התואמים את החיפוש 🔍
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => {
      if (tasteSort === "price") {
        const pA = parseInt(a.priceHuf.replace(/\D/g, "")) || 0;
        const pB = parseInt(b.priceHuf.replace(/\D/g, "")) || 0;
        return pA - pB;
      }
      return (a.rank || 0) - (b.rank || 0);
    });

    if (tasteViewMode === "table") {
      tasteItemsGrid.classList.add("table-view");
      tasteItemsGrid.innerHTML = filtered.map(item => `
        <div class="compact-row-wrapper">
          <div class="compact-list-row" onclick="toggleRowExpand(this)">
            <img src="${item.image}" alt="${item.name}" class="compact-row-thumb" loading="lazy" decoding="async" onerror="this.src='images/danube-cruise.jpg'">
            <div class="compact-row-main">
              <div class="compact-row-header">
                <span class="compact-rank-num">#${item.rank}</span>
                <span class="compact-row-title">${item.name}</span>
              </div>
              <div class="compact-row-sub">${item.nameOrig} • ${item.categoryName}</div>
              <div class="compact-row-meta">
                <span class="compact-badge price">💰 ${item.priceIls}</span>
                <span class="compact-badge kosher">🛡️ ${item.kosherGuide.slice(0, 24)}...</span>
              </div>
            </div>
            <div class="compact-row-actions">
              <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-quick-maps" onclick="event.stopPropagation()" title="נווט למקום המומלץ">
                📍
              </a>
              <span class="compact-row-chevron">▼</span>
            </div>
          </div>
          <div class="compact-expanded-tray">
            <div class="tray-desc">${item.description}</div>
            <div class="tray-order-box" style="border-right-color: #ea580c;">
              🛡️ <strong>הנחיית כשרות (בטוח & ללא חזיר):</strong> ${item.kosherGuide}
            </div>
            <div style="margin-bottom: 6px; font-size: 0.8rem; color: #15803d;">
              📍 <strong>איפה הכי מומלץ לאכול:</strong> ${item.whereToEat}
            </div>
            <div style="margin-bottom: 8px; font-size: 0.8rem; color: #b45309;">
              ✨ <strong>איך להזמין:</strong> ${item.mustOrderTip}
            </div>
            <div class="tray-actions-row">
              <span style="font-size: 0.76rem; font-weight: 700; color: #1e40af;">מחיר: ${item.priceHuf} (${item.priceIls})</span>
              <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-primary-action" style="padding: 5px 12px; font-size: 0.76rem;">
                פתח מקום מומלץ ב-Maps
              </a>
            </div>
          </div>
        </div>
      `).join("");
      return;
    }

    tasteItemsGrid.classList.remove("table-view");
    tasteItemsGrid.innerHTML = filtered.map(item => `
      <div class="directory-card is-expandable" tabindex="0" role="button" aria-expanded="false" onclick="toggleDirCard(event, this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDirCard(event,this);}">
        <div class="dir-card-media">
          <img src="${item.image}" alt="${item.name}" class="dir-card-img" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
          <div class="dir-media-overlay">
            <span class="dir-rank-badge-overlay">${item.badge}</span>
          </div>
        </div>

        <div class="dir-card-body">
          <div class="dir-top-meta">
            <span class="dir-rating-text">${item.rating}</span>
            <span class="tag-badge hours" style="background:#fef3c7; color:#92400e; font-weight:700;">${item.categoryName}</span>
          </div>

          <div class="dir-title-row">
            <h3 class="dir-name">${item.name}</h3>
            <div class="dir-orig-name">${item.nameOrig}</div>
          </div>

          <div class="dir-tags-row">
            <span class="tag-badge distance" style="background:#eff6ff; color:#1e40af; font-weight:700;">💰 ${item.priceHuf} (${item.priceIls})</span>
          </div>

          <p class="dir-description">${item.description}</p>

          <div class="dir-must-order-box" style="background: #fdf2f8; border-right-color: #db2777; margin-bottom: 8px;">
            🛡️ <strong>הנחיית כשרות (בטוח & ללא חזיר):</strong> ${item.kosherGuide}
          </div>

          <div class="dir-must-order-box" style="background: #f0fdf4; border-right-color: #16a34a; margin-bottom: 8px;">
            📍 <strong>איפה הכי מומלץ לאכול ליד Casati:</strong> ${item.whereToEat}
          </div>

          <div class="dir-must-order-box">
            ✨ <strong>איך להזמין:</strong> ${item.mustOrderTip}
          </div>

          <div class="dir-bottom-action-bar" style="margin-top: 12px;">
            <span class="dir-address-txt" style="font-size: 0.78rem;"><span class="hu-flag-icon"></span> מסורת הונגרית אותנטית</span>
            <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps">
              <span aria-hidden="true">📍</span> ניווט
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (tasteFilterPills) {
    tasteFilterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        tasteFilterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        tasteFilter = pill.getAttribute("data-filter");
        renderMustTaste();
      });
    });
  }

  if (tasteSearchInput) {
    tasteSearchInput.addEventListener("input", renderMustTaste);
  }

  // ==================== BARS RENDERING WITH PHOTOS ====================
  function renderBars() {
    if (!barsItemsGrid) return;
    const query = (barsSearchInput ? barsSearchInput.value.toLowerCase().trim() : "");

    let filtered = TRIP_DATA.bars.filter(item => {
      const matchSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.nameOrig && item.nameOrig.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        item.vibe.toLowerCase().includes(query);

      return matchSearch;
    });

    if (filtered.length === 0) {
      barsItemsGrid.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          לא נמצאו ברים התואמים את החיפוש 🔍
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => {
      if (barsSort === "distance") {
        return (a.distanceMeters || 0) - (b.distanceMeters || 0);
      }
      return (a.rank || 0) - (b.rank || 0);
    });

    barsItemsGrid.innerHTML = filtered.map(item => `
      <div class="directory-card is-expandable" tabindex="0" role="button" aria-expanded="false" onclick="toggleDirCard(event, this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDirCard(event,this);}">
        ${item.image ? `
          <div class="dir-card-media">
            <img src="${item.image}" alt="${item.name}" class="dir-card-img" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
            <div class="dir-media-overlay">
              <span class="dir-rank-badge-overlay">${item.badge}</span>
            </div>
          </div>
        ` : ''}

        <div class="dir-card-body">
          <div class="dir-top-meta">
            ${!item.image ? `<span class="dir-rank-badge">${item.badge}</span>` : ''}
            <span class="dir-rating-text">${item.rating}</span>
          </div>

          <div class="dir-title-row">
            <h3 class="dir-name">${item.name}</h3>
            ${item.nameOrig ? `<div class="dir-orig-name">${item.nameOrig}</div>` : ''}
          </div>

          <div class="dir-tags-row">
            <span class="tag-badge distance">🚶 ${item.distanceText || item.distance}</span>
            <span class="tag-badge hours">🕒 ${item.hours}</span>
            <span class="tag-badge">✨ ${item.vibe}</span>
          </div>

          <p class="dir-description">${item.description}</p>

          <div class="dir-must-order-box">
            🍸 <strong>מה להזמין:</strong> ${item.mustOrder}
          </div>

          <div class="dir-bottom-action-bar">
            <span class="dir-address-txt">📍 ${item.address}</span>
            <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps">
              <span aria-hidden="true">📍</span> ניווט
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (barsSearchInput) {
    barsSearchInput.addEventListener("input", renderBars);
  }

  // ==================== SHOPPING RENDERING WITH PHOTOS ====================
  function renderShopping() {
    if (!shoppingItemsGrid) return;
    const query = (shoppingSearchInput ? shoppingSearchInput.value.toLowerCase().trim() : "");

    let filtered = TRIP_DATA.shopping.filter(item => {
      const matchFilter = (shoppingFilter === "all") || (shoppingFilter === item.type);
      const matchSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.nameOrig && item.nameOrig.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        item.tip.toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      shoppingItemsGrid.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          לא נמצאו קניונים או חנויות התואמים את החיפוש 🔍
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => {
      if (shoppingSort === "distance") {
        return (a.distanceMeters || 0) - (b.distanceMeters || 0);
      }
      return (a.rank || 0) - (b.rank || 0);
    });

    shoppingItemsGrid.innerHTML = filtered.map(item => `
      <div class="directory-card has-detail" tabindex="0" role="button" aria-label="${item.name} – פרטים מלאים" onclick="openShoppingDetail('${item.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openShoppingDetail('${item.id}');}">
        ${item.image ? `
          <div class="dir-card-media">
            <img src="${item.image}" alt="${item.name}" class="dir-card-img" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
            <div class="dir-media-overlay">
              <span class="dir-rank-badge-overlay">${item.badge}</span>
            </div>
          </div>
        ` : ''}

        <div class="dir-card-body">
          <div class="dir-top-meta">
            ${!item.image ? `<span class="dir-rank-badge">${item.badge}</span>` : ''}
            <span class="dir-rating-text">${item.rating}</span>
          </div>

          <div class="dir-title-row">
            <h3 class="dir-name">${item.name}</h3>
            ${item.nameOrig ? `<div class="dir-orig-name">${item.nameOrig}</div>` : ''}
          </div>

          <div class="dir-tags-row">
            ${item.distanceText ? `<span class="tag-badge distance">🚶 ${item.distanceText}</span>` : ''}
            <span class="tag-badge hours">🕒 ${item.hours}</span>
          </div>

          <p class="dir-description">${item.description}</p>

          <div style="margin: 10px 0 8px;">
            <button type="button" class="btn-open-detail-pill" onclick="event.stopPropagation(); openShoppingDetail('${item.id}')">
              <span>🔎</span> מדריך חנויות, קומות & דרכי הגעה
            </button>
          </div>

          <div class="dir-must-order-box">
            💡 <strong>טיפ שופינג:</strong> ${item.tip}
          </div>

          <div class="dir-bottom-action-bar" onclick="event.stopPropagation();">
            <span class="dir-address-txt">📍 ${item.address}</span>
            <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps">
              <span aria-hidden="true">📍</span> ניווט
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (shoppingFilterPills) {
    shoppingFilterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        shoppingFilterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        shoppingFilter = pill.getAttribute("data-filter");
        renderShopping();
      });
    });
  }

  if (shoppingSearchInput) {
    shoppingSearchInput.addEventListener("input", renderShopping);
  }

  // ==================== ATTRACTIONS RENDERING WITH PHOTOS ====================
  function renderAttractions() {
    if (!attractionsItemsGrid) return;
    const query = (attractionsSearchInput ? attractionsSearchInput.value.toLowerCase().trim() : "");

    let filtered = TRIP_DATA.attractions.filter(item => {
      const matchFilter = (attractionsFilter === "all") || 
        (attractionsFilter === item.type) || 
        (Array.isArray(item.categories) && item.categories.includes(attractionsFilter));
      const matchSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.nameOrig && item.nameOrig.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        item.tip.toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      attractionsItemsGrid.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          לא נמצאו אטרקציות התואמות את החיפוש 🔍
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => {
      if (attractionsSort === "distance") {
        return (a.distanceMeters || 0) - (b.distanceMeters || 0);
      }
      return (a.rank || 0) - (b.rank || 0);
    });

    attractionsItemsGrid.innerHTML = filtered.map(item => `
      <div class="directory-card has-detail" tabindex="0" role="button" aria-label="${item.name} – פרטים מלאים" onclick="openAttractionDetail('${item.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openAttractionDetail('${item.id}');}">
        ${item.image ? `
          <div class="dir-card-media">
            <img src="${item.image}" alt="${item.name}" class="dir-card-img" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
            <div class="dir-media-overlay">
              <span class="dir-rank-badge-overlay">${item.badge}</span>
            </div>
          </div>
        ` : ''}

        <div class="dir-card-body">
          <div class="dir-top-meta">
            ${!item.image ? `<span class="dir-rank-badge">${item.badge}</span>` : ''}
            <span class="dir-rating-text">${item.rating}</span>
          </div>

          <div class="dir-title-row">
            <h3 class="dir-name">${item.name}</h3>
            ${item.nameOrig ? `<div class="dir-orig-name">${item.nameOrig}</div>` : ''}
          </div>

          <div class="dir-tags-row">
            ${item.distanceText ? `<span class="tag-badge distance">🚶 ${item.distanceText}</span>` : ''}
            <span class="tag-badge hours">🕒 ${item.hours}</span>
          </div>

          <p class="dir-description">${item.description}</p>

          ${item.ticketInfo ? `
            <div class="dir-ticket-preview">
              🎟️ <strong>כרטיס מומלץ:</strong> ${item.ticketInfo.recommendedType || item.ticketInfo.recommended} (${item.ticketInfo.priceApprox || item.ticketInfo.price})
            </div>
          ` : ''}

          <div style="margin: 10px 0 8px;">
            <button type="button" class="btn-open-detail-pill" onclick="event.stopPropagation(); openAttractionDetail('${item.id}')">
              <span>🔎</span> דף מידע מלא, גלריית תמונות & האם שווה?
            </button>
          </div>

          <div class="dir-must-order-box">
            ✨ <strong>טיפ מנצח:</strong> ${item.tip}
          </div>

          <div class="dir-bottom-action-bar" onclick="event.stopPropagation();">
            <span class="dir-address-txt">📍 ${item.address}</span>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${item.ticketLink ? `
                <a href="${item.ticketLink}" target="_blank" rel="noopener" class="btn-open-maps btn-tickets">
                  <span aria-hidden="true">🎟️</span> כרטיסים
                </a>
              ` : ''}
              <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps">
                <span aria-hidden="true">📍</span> ניווט
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  // ==================== ATTRACTION DETAIL MODAL LOGIC ====================
  const attractionModalBackdrop = document.getElementById("attraction-detail-modal-backdrop");
  const attractionModalTitleGroup = document.getElementById("attraction-modal-title-group");
  const attractionModalBody = document.getElementById("attraction-modal-body");
  const closeAttractionModalBtn = document.getElementById("close-attraction-modal-btn");

  window.openAttractionDetail = function(id) {
    const item = TRIP_DATA.attractions.find(a => a.id === id);
    if (!item || !attractionModalBackdrop || !attractionModalBody) return;

    if (attractionModalTitleGroup) {
      attractionModalTitleGroup.innerHTML = `
        <div style="margin-bottom: 4px;">
          <span class="pill-badge gold">${item.badge || 'אטרקציה מומלצת'}</span>
        </div>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0 0 2px;">${item.name}</h3>
        ${item.nameOrig ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${item.nameOrig}</p>` : ''}
      `;
    }

    const galleryImages = (item.gallery && item.gallery.length > 0) ? item.gallery : [item.image].filter(Boolean);

    attractionModalBody.innerHTML = `
      ${galleryImages.length > 0 ? `
        <div class="attraction-gallery-slider">
          ${galleryImages.map((imgUrl, idx) => `
            <div class="attraction-gallery-item">
              <img src="${imgUrl}" alt="${item.name} ${idx + 1}" loading="lazy" decoding="async" onerror="this.src='${item.image || ''}'">
              <div class="gallery-photo-caption">
                📷 תמונה ${idx + 1} מתוך ${galleryImages.length}
              </div>
            </div>
          `).join("")}
        </div>
      ` : ''}

      <!-- Verdict Box -->
      <div class="verdict-box">
        <div class="verdict-title-bar">
          <h4>⚖️ האם שווה את הזמן או לוותר? (חוות דעת)</h4>
          <span class="verdict-score-pill">${item.verdictScore || 'מומלץ בחום! ⭐⭐⭐⭐⭐'}</span>
        </div>

        ${item.pros ? `
          <div class="verdict-row pros">
            <strong>👍 למה שווה:</strong> ${item.pros}
          </div>
        ` : `
          <div class="verdict-row pros">
            <strong>👍 למה שווה:</strong> ${item.description}
          </div>
        `}

        ${item.cons ? `
          <div class="verdict-row cons">
            <strong>⚠️ למה לשקול לוותר:</strong> ${item.cons}
          </div>
        ` : ''}

        <div class="verdict-row bottom-line">
          🎯 <strong>שורה תחתונה:</strong> ${item.bottomLine || item.tip}
        </div>
      </div>

      <!-- Ticket Guide Box -->
      ${item.ticketInfo ? `
        <div class="ticket-guide-box">
          <div class="ticket-guide-header">
            <h4>🎟️ מדריך כרטיסים, מחירים ואיפה לקנות</h4>
            <span class="ticket-badge-pill">${item.ticketInfo.priceApprox || item.ticketInfo.price}</span>
          </div>
          <div class="ticket-guide-row highlight">
            <span class="ticket-guide-icon">⭐</span>
            <div class="ticket-guide-content">
              <strong>סוג כרטיס מומלץ:</strong>
              <div>${item.ticketInfo.recommendedType || item.ticketInfo.recommended}</div>
            </div>
          </div>
          <div class="ticket-guide-row">
            <span class="ticket-guide-icon">🛒</span>
            <div class="ticket-guide-content">
              <strong>איפה הכי מומלץ לקנות:</strong>
              <div>${item.ticketInfo.whereToBuy}</div>
            </div>
          </div>
          <div class="ticket-guide-row tip">
            <span class="ticket-guide-icon">💡</span>
            <div class="ticket-guide-content">
              <strong>טיפ זהב לחיסכון והבדלים:</strong>
              <div>${item.ticketInfo.proTip || item.ticketInfo.ticketTip}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- How to get there from Casati Box -->
      <div class="how-to-reach-card">
        <h4>🗺️ איך מגיעים מ-Hotel Casati (שלב אחרי שלב):</h4>
        ${item.howToGetThere ? `
          <div>${item.howToGetThere}</div>
        ` : `
          <div>מרחק מהמלון: ${item.distanceText || 'במרכז העיר'}. מומלץ ללכת ברגל או להשתמש במטרו / מונית Bolt ישירה.</div>
        `}
      </div>

      <!-- Details Summary Grid -->
      <div class="modal-details-grid">
        <div class="modal-detail-item">
          <span class="modal-detail-label">📍 כתובת</span>
          <span class="modal-detail-val">${item.address}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🕒 שעות פעילות</span>
          <span class="modal-detail-val">${item.hours}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">💰 מחיר / כניסה</span>
          <span class="modal-detail-val">${item.priceText || 'מחיר מקומי רגיל'}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🌟 דירוג מומלצים</span>
          <span class="modal-detail-val">${item.rating}</span>
        </div>
      </div>

      <!-- Tips Box -->
      <div class="dir-must-order-box" style="margin-bottom: 16px;">
        💡 <strong>טיפ מעשי לביקור:</strong> ${item.tip}
      </div>

      <!-- Bottom Action Buttons -->
      <div class="attraction-action-buttons-bar">
        <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps" style="flex: 1; justify-content: center; padding: 12px;">
          <span>📍</span> פתח ניווט ב-Google Maps
        </a>
        ${item.ticketLink ? `
          <a href="${item.ticketLink}" target="_blank" rel="noopener" class="btn-open-maps" style="background: var(--accent-gold); color: #0f172a; font-weight: 800; flex: 1; justify-content: center; padding: 12px;">
            <span>🎟️</span> אתר רשמי / כרטיסים
          </a>
        ` : ''}
      </div>

      <button type="button" class="btn-modal-footer-close" onclick="closeAttractionDetail()">
        <span>✕</span> סגור וחזור לרשימה
      </button>
    `;

    attractionModalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    pushModalHistory('attraction');
  };


  // ==================== SHOPPING DETAIL MODAL LOGIC ====================
  window.openShoppingDetail = function(id) {
    const item = TRIP_DATA.shopping.find(s => s.id === id);
    if (!item || !attractionModalBackdrop || !attractionModalBody) return;

    if (attractionModalTitleGroup) {
      attractionModalTitleGroup.innerHTML = `
        <div style="margin-bottom: 4px;">
          <span class="pill-badge gold">${item.badge || 'שופינג וקניות'}</span>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 0 0 2px;">${item.name}</h3>
        ${item.nameOrig ? `<p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">${item.nameOrig}</p>` : ''}
      `;
    }

    const galleryImages = (item.gallery && item.gallery.length > 0) ? item.gallery : [item.image].filter(Boolean);

    attractionModalBody.innerHTML = `
      ${galleryImages.length > 0 ? `
        <div class="attraction-gallery-slider">
          ${galleryImages.map((imgUrl, idx) => `
            <div class="attraction-gallery-item">
              <img src="${imgUrl}" alt="${item.name} ${idx + 1}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
              <div class="gallery-photo-caption">
                📷 ${item.name}
              </div>
            </div>
          `).join("")}
        </div>
      ` : ''}

      ${item.partnerQuote ? `
        <div class="mall-quote-box">
          <span style="font-size: 1.3rem;">🛋️</span>
          <div>${item.partnerQuote}</div>
        </div>
      ` : ''}

      <!-- Quick Summary Box -->
      <div class="verdict-box">
        <div class="verdict-title-bar">
          <h4>⚖️ שווה להגיע במיוחד או לוותר?</h4>
          <span class="verdict-score-pill">${item.verdictScore || 'מומלץ בחום! ⭐⭐⭐⭐⭐'}</span>
        </div>

        ${item.pros ? `
          <div class="verdict-row pros">
            <strong>👍 למה שווה:</strong> ${item.pros}
          </div>
        ` : ''}

        ${item.cons ? `
          <div class="verdict-row cons">
            <strong>⚠️ נקודה לתשומת לב:</strong> ${item.cons}
          </div>
        ` : ''}

        <div class="verdict-row bottom-line">
          🎯 <strong>שורה תחתונה:</strong> ${item.bottomLine || item.description}
        </div>
      </div>

      <!-- Store Directory / Brand Categories -->
      ${item.stores && item.stores.length > 0 ? `
        <div class="mall-stores-section">
          <div class="mall-stores-title">
            <span>🛍️</span>
            <span>מדריך חנויות, מותגים וקומות (${item.stores.reduce((acc, c) => acc + c.items.length, 0)} נקודות עניין)</span>
          </div>

          <div class="mall-categories-grid">
            ${item.stores.map(cat => `
              <div class="mall-category-card">
                <div class="mall-category-header">
                  <span class="mall-category-name">
                    ${cat.category}
                  </span>
                  <span class="mall-category-count">${cat.items.length} חנויות</span>
                </div>
                <div class="mall-brands-wrap">
                  ${cat.items.map(store => `
                    <span class="mall-brand-pill">${store}</span>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ''}

      <!-- How to get there from Casati Box -->
      <div class="how-to-reach-card">
        <h4>🗺️ דרכי הגעה מ-Hotel Casati:</h4>
        ${item.howToGetThere ? `
          <div>${item.howToGetThere}</div>
        ` : `
          <div>מרחק מהמלון: ${item.distanceText || 'במרכז העיר'}. מומלץ ללכת ברגל או להשתמש במטרו / מונית Bolt.</div>
        `}
      </div>

      <!-- Details Summary Grid -->
      <div class="modal-details-grid">
        <div class="modal-detail-item">
          <span class="modal-detail-label">📍 כתובת</span>
          <span class="modal-detail-val">${item.address}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🕒 שעות פתיחה</span>
          <span class="modal-detail-val">${item.hours}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🚶 מרחק מקאסטי</span>
          <span class="modal-detail-val">${item.distanceText || 'במרכז'}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🌟 דירוג וסוג</span>
          <span class="modal-detail-val">${item.rating}</span>
        </div>
      </div>

      <!-- Shopping Tip Box -->
      <div class="dir-must-order-box" style="margin-bottom: 16px;">
        💡 <strong>טיפ שופינג זהב:</strong> ${item.tip}
      </div>

      <!-- Bottom Action Buttons -->
      <div class="attraction-action-buttons-bar">
        <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps" style="flex: 1; justify-content: center; padding: 12px;">
          <span>📍</span> פתח ניווט ב-Google Maps
        </a>
        ${item.websiteLink ? `
          <a href="${item.websiteLink}" target="_blank" rel="noopener" class="btn-open-maps" style="background: var(--accent-purple); color: #ffffff; font-weight: 800; flex: 1; justify-content: center; padding: 12px;">
            <span>🌐</span> אתר רשמי של הקניון
          </a>
        ` : ''}
      </div>

      <button type="button" class="btn-modal-footer-close" onclick="closeAttractionDetail()">
        <span>✕</span> סגור וחזור לרשימת הקניות
      </button>
    `;

    attractionModalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    pushModalHistory('shopping');
  };

  // ==================== RESTAURANT DETAIL MODAL LOGIC ====================
  window.openRestaurantDetail = function(id) {
    const item = TRIP_DATA.restaurants.find(r => r.id === id);
    if (!item || !attractionModalBackdrop || !attractionModalBody) return;

    if (attractionModalTitleGroup) {
      attractionModalTitleGroup.innerHTML = `
        <div style="margin-bottom: 4px;">
          <span class="pill-badge gold">${item.badge || 'מסעדה מומלצת'}</span>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 0 0 2px;">${item.name}</h3>
        ${item.nameOrig ? `<p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">${item.nameOrig}</p>` : ''}
      `;
    }

    attractionModalBody.innerHTML = `
      ${item.image ? `
        <div class="attraction-gallery-slider">
          <div class="attraction-gallery-item" style="flex: 0 0 100%;">
            <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'">
            <div class="gallery-photo-caption">
              📷 ${item.name}
            </div>
          </div>
        </div>
      ` : ''}

      <div class="verdict-box">
        <div class="verdict-title-bar">
          <h4>🍽️ על המקום וחוויית האוכל</h4>
          <span class="verdict-score-pill">${item.rating}</span>
        </div>
        <div class="verdict-row" style="font-size: 0.9rem; line-height: 1.6;">
          ${item.description}
        </div>
      </div>

      <div class="dir-must-order-box" style="margin-bottom: 14px; border-right-color: var(--accent-gold); background: #fefce8;">
        ✨ <strong>מה חובה להזמין:</strong> ${item.mustOrder}
      </div>

      ${item.kosherNote ? `
        <div class="how-to-reach-card" style="background: #f0fdf4; border-color: #bbf7d0; color: #166534; margin-bottom: 14px;">
          <h4>🛡️ מדריך כשרות ובחירת מנות:</h4>
          <div>${item.kosherNote}</div>
        </div>
      ` : ''}

      <div class="modal-details-grid">
        <div class="modal-detail-item">
          <span class="modal-detail-label">📍 כתובת</span>
          <span class="modal-detail-val">${item.address}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">🚶 מרחק מקאסטי</span>
          <span class="modal-detail-val">${item.distanceText || 'במרכז'}</span>
        </div>
        <div class="modal-detail-item">
          <span class="modal-detail-label">⭐ דירוג מקומי</span>
          <span class="modal-detail-val">${item.rating}</span>
        </div>
        <div class="modal-detail-item" style="grid-column: 1 / -1; background: #fffbeb; border-color: #fde68a;">
          <span class="modal-detail-label" style="color: #92400e; font-weight: 800;">🕒 שעות פעילות מדויקות (כל השבוע):</span>
          <div class="modal-detail-val" style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; font-size: 0.82rem;">
            ${item.hours.split(' | ').map(h => `<div style="display: flex; align-items: center; gap: 6px;"><span style="color: #d97706;">⏰</span><strong>${h}</strong></div>`).join('')}
          </div>
        </div>

      </div>

      <div class="attraction-action-buttons-bar">
        <a href="${item.mapsLink}" target="_blank" rel="noopener" class="btn-open-maps" style="flex: 1; justify-content: center; padding: 12px;">
          <span>📍</span> פתח ניווט ישיר ב-Google Maps
        </a>
      </div>

      <button type="button" class="btn-modal-footer-close" onclick="closeAttractionDetail()">
        <span>✕</span> סגור וחזור למסעדות
      </button>
    `;

    attractionModalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    pushModalHistory('restaurant');
  };

  window.closeAttractionDetail = function(fromPopState = false) {
    closeModalCleanly(attractionModalBackdrop, fromPopState);
  };

  if (closeAttractionModalBtn) {
    closeAttractionModalBtn.addEventListener("click", () => window.closeAttractionDetail());
  }

  if (attractionModalBackdrop) {
    attractionModalBackdrop.addEventListener("click", (e) => {
      if (e.target === attractionModalBackdrop) {
        window.closeAttractionDetail();
      }
    });
  }

  if (attractionsFilterPills) {
    attractionsFilterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        attractionsFilterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        attractionsFilter = pill.getAttribute("data-filter");
        renderAttractions();
      });
    });
  }

  if (attractionsSearchInput) {
    attractionsSearchInput.addEventListener("input", renderAttractions);
  }

  // ==================== SORT PILL BUTTONS HANDLER ====================
  const sortPills = document.querySelectorAll(".sort-pill");
  sortPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const grid = pill.getAttribute("data-grid");
      const sort = pill.getAttribute("data-sort");
      const parent = pill.closest(".sort-bar");
      if (parent) {
        parent.querySelectorAll(".sort-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      }
      if (grid === "food") {
        foodSort = sort;
        renderRestaurants();
      } else if (grid === "taste") {
        tasteSort = sort;
        renderMustTaste();
      } else if (grid === "bars") {
        barsSort = sort;
        renderBars();
      } else if (grid === "shopping") {
        shoppingSort = sort;
        renderShopping();
      } else if (grid === "attractions") {
        attractionsSort = sort;
        renderAttractions();
      }
    });
  });

  // ==================== VIEW MODE BUTTONS HANDLER (Cards vs Table) ====================
  const viewModeButtons = document.querySelectorAll(".view-mode-btn");
  viewModeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const grid = btn.getAttribute("data-grid");
      const mode = btn.getAttribute("data-mode");
      const parent = btn.closest(".view-mode-bar");
      if (parent) {
        parent.querySelectorAll(".view-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
      if (grid === "food") {
        foodViewMode = mode;
        renderRestaurants();
      } else if (grid === "taste") {
        tasteViewMode = mode;
        renderMustTaste();
      }
    });
  });

  // ==================== ESSENTIAL TIPS RENDERING ====================
  function renderTips() {
    if (!tipsItemsGrid) return;
    tipsItemsGrid.innerHTML = TRIP_DATA.essentialTips.map(tip => `
      <div class="tip-card ${tip.highlight ? 'tip-card-highlight' : ''}">
        <div class="tip-card-header">
          <span class="tip-icon-lg">${tip.icon}</span>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <h3 style="margin: 0;">${tip.title}</h3>
              ${tip.badge ? `<span class="pill-badge ${tip.badgeClass || 'gold'}">${tip.badge}</span>` : ''}
            </div>
          </div>
        </div>
        <p class="tip-card-desc">${tip.desc}</p>
      </div>
    `).join("");
  }

  // ==================== CURRENCY CONVERTER MODAL ====================
  window.openCurrencyModal = function() {
    if (currencyModalBackdrop) {
      currencyModalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      pushModalHistory('currency');
    }
  };

  window.closeCurrencyModal = function(fromPopState = false) {
    closeModalCleanly(currencyModalBackdrop, fromPopState);
  };

  if (openCurrencyModalBtn) openCurrencyModalBtn.addEventListener("click", () => window.openCurrencyModal());
  if (openCurrencyFloatingBtn) openCurrencyFloatingBtn.addEventListener("click", () => window.openCurrencyModal());
  if (quickCurrencyPill) quickCurrencyPill.addEventListener("click", () => window.openCurrencyModal());
  if (closeCurrencyModalBtn) closeCurrencyModalBtn.addEventListener("click", () => window.closeCurrencyModal());

  if (currencyModalBackdrop) {
    currencyModalBackdrop.addEventListener("click", (e) => {
      if (e.target === currencyModalBackdrop) {
        window.closeCurrencyModal();
      }
    });
  }

  // ==================== PWA INSTALL MODAL & SERVICE WORKER ====================
  const installModalBackdrop = document.getElementById("install-modal-backdrop");
  const openInstallModalBtn = document.getElementById("open-install-modal-btn");
  const closeInstallModalBtn = document.getElementById("close-install-modal-btn");

  window.openInstallModal = function() {
    if (installModalBackdrop) {
      installModalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      pushModalHistory('install');
    }
  };

  window.closeInstallModal = function(fromPopState = false) {
    closeModalCleanly(installModalBackdrop, fromPopState);
  };

  if (openInstallModalBtn) openInstallModalBtn.addEventListener("click", () => window.openInstallModal());
  if (closeInstallModalBtn) closeInstallModalBtn.addEventListener("click", () => window.closeInstallModal());
  if (installModalBackdrop) {
    installModalBackdrop.addEventListener("click", (e) => {
      if (e.target === installModalBackdrop) {
        window.closeInstallModal();
      }
    });
  }

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const directBtn = document.getElementById('btn-pwa-install-trigger');
    if (directBtn) {
      directBtn.style.display = 'inline-flex';
    }
  });

  window.triggerPwaInstall = function() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('PWA installation accepted by user');
        }
        deferredInstallPrompt = null;
        window.closeInstallModal();
      });
    } else {
      alert("הוראות התקנה למסך הבית:\n\n🍏 באייפון (Safari): לחצו על כפתור השיתוף בתחתית המסך (ריבוע עם חץ ⎋) ובחרו 'הוסף למסך הבית'!\n\n🤖 באנדרואיד (Chrome): לחצו על 3 הנקודות (⋮) בתפריט הדפדפן ובחרו 'התקנת אפליקציה'.");
    }
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('Budapest PWA Service Worker Registered:', reg.scope);
      }).catch((err) => {
        console.log('Service Worker Registration Failed:', err);
      });
    });
  }

  function updateCurrencyFromHuf(hufVal) {
    if (isNaN(hufVal) || hufVal <= 0) {
      modalIlsInput.value = "";
    } else {
      modalIlsInput.value = (hufVal / HUF_PER_ILS).toFixed(1);
    }
  }

  function updateCurrencyFromIls(ilsVal) {
    if (isNaN(ilsVal) || ilsVal <= 0) {
      modalHufInput.value = "";
    } else {
      modalHufInput.value = Math.round(ilsVal * HUF_PER_ILS);
    }
  }

  if (modalHufInput) {
    modalHufInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      updateCurrencyFromHuf(val);
    });
  }

  if (modalIlsInput) {
    modalIlsInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      updateCurrencyFromIls(val);
    });
  }

  if (chipValButtons) {
    chipValButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = parseFloat(btn.getAttribute("data-val"));
        modalHufInput.value = val;
        updateCurrencyFromHuf(val);
      });
    });
  }

  // ==================== FLIGHT COUNTDOWN TIMER ====================
  function updateCountdown() {
    if (!countdownTimer) return;
    // Outbound flight: 24 November 2026, 10:10 AM 
    const flightDate = new Date("2026-11-24T10:10:00+02:00");
    const now = new Date();
    const diff = flightDate - now;

    if (diff <= 0) {
      countdownTimer.textContent = "טסים עכשיו! ✈️";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days > 0) {
      countdownTimer.textContent = `עוד ${days} ימים ו-${hours} שעות`;
    } else {
      countdownTimer.textContent = `עוד ${hours} שעות!`;
    }
  }

  // ==================== TAX FREE CALCULATOR WIDGET ====================
  const tfCalcInput = document.getElementById("tf-calc-input");
  const tfResHuf = document.getElementById("tf-res-huf");
  const tfResEur = document.getElementById("tf-res-eur");
  const tfResIls = document.getElementById("tf-res-ils");

  function updateTaxFreeCalc() {
    if (!tfCalcInput || !tfResHuf || !tfResEur || !tfResIls) return;
    const amount = parseFloat(tfCalcInput.value);
    if (isNaN(amount) || amount <= TAX_FREE_MIN_HUF) {
      tfResHuf.textContent = "מתחת ל-68K";
      tfResEur.textContent = "—";
      tfResIls.textContent = "אין זכאות";
      return;
    }
    const refundHuf = Math.round(amount * 0.15);
    const refundEur = Math.round(refundHuf / HUF_PER_EUR);
    const refundIls = Math.round(refundHuf / HUF_PER_ILS);

    tfResHuf.textContent = `~${refundHuf.toLocaleString()} HUF`;
    tfResEur.textContent = `~${refundEur} €`;
    tfResIls.textContent = `~${refundIls} ₪`;
  }

  if (tfCalcInput) {
    tfCalcInput.addEventListener("input", updateTaxFreeCalc);
    updateTaxFreeCalc();
  }

  // ==================== INITIALIZATION ====================
  renderMasterRoute();
  renderHotelVip();
  renderItineraryPills();
  renderActiveDay();
  renderHomeDays();
  renderRestaurants();
  renderMustTaste();
  renderBars();
  renderShopping();
  renderAttractions();
  renderTips();
  updateCountdown();
  setInterval(updateCountdown, 60000);
});
