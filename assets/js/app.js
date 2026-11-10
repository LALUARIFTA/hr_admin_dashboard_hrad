/* ==========================================================================
   HRAD Dashboard Template — Application Logic
   Depends on (loaded before this file, in this order):
     1. assets/js/config.js  → window.HRAD_CONFIG  (brand, menus, years, animations)
     2. assets/js/data.js    → window.HRAD_DATA    (demo datasets)
   ========================================================================== */

// =========================================================================
// 1. STATE & DATA WIRING
// =========================================================================
const CONFIG = window.HRAD_CONFIG;
const DATA = window.HRAD_DATA;
const menusConfig = CONFIG.menus;
const years = CONFIG.years;
const yearlyData = DATA.yearlyData;
const employeesList = DATA.employeesList;

const state = {
  activeMenu: 'overview',
  activeSubMenu: 0,
  selectedYear: CONFIG.defaultYear,
  sidebarExpanded: false,
  transitionClass: 'anim-slide-fade',
  lang: 'EN',
  satisfactionScore: 74,
  salaryMetricMode: 'Salary Statistics',
  newEmpSortMode: 'Years',
  searchQuery: '',
  notices: [...DATA.notices]
};

// =========================================================================
// 2. SIDEBAR & SUB-MENU NAVIGATION RENDERING
// =========================================================================
function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  const itemsHtml = menusConfig.map((m) => {
    const isActive = state.activeMenu === m.id;
    return `
      <button
        id="sideBtn-${m.id}"
        onclick="switchMenu('${m.id}')"
        title="${m.title}"
        class="sidebar-item w-full flex items-center ${state.sidebarExpanded ? 'px-4 justify-start gap-3' : 'justify-center'} py-1 group focus:outline-none"
      >
        <div class="sidebar-item-box shrink-0 ${isActive ? 'active-box' : 'text-[#8ea0be] hover:text-[#3b5998]'}">
          <div class="${isActive ? 'active-icon-inner' : 'w-8 h-8 flex items-center justify-center'}">
            ${m.icon}
          </div>
          ${m.badge || isActive ? `<span class="w-2 h-2 rounded-full bg-[#e53e51] border border-white absolute top-1.5 right-1.5"></span>` : ''}
        </div>
        <span class="${state.sidebarExpanded ? 'inline-block' : 'hidden'} text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'text-[#2b3654]' : 'text-[#7b879c] group-hover:text-[#2b3654]'}">
          ${m.title}
        </span>
      </button>
    `;
  }).join('');

  nav.innerHTML = `<div id="sidebarGlider" style="top: 10px;"></div>` + itemsHtml;
  updateSidebarGliderPosition();
}

function updateSidebarGliderPosition() {
  const activeBtn = document.getElementById(`sideBtn-${state.activeMenu}`);
  const glider = document.getElementById('sidebarGlider');
  if (activeBtn && glider) {
    const offsetTop = activeBtn.offsetTop + (activeBtn.offsetHeight - 34) / 2;
    glider.style.top = `${offsetTop}px`;
  }
}

function toggleSidebarExpand() {
  state.sidebarExpanded = !state.sidebarExpanded;
  const sidebar = document.getElementById('sidebar');
  const icon = document.getElementById('sidebarToggleIcon');
  if (state.sidebarExpanded) {
    sidebar.classList.remove('w-[78px]', 'md:w-[86px]');
    sidebar.classList.add('w-[225px]');
    icon.style.transform = 'scaleX(-1)';
  } else {
    sidebar.classList.remove('w-[225px]');
    sidebar.classList.add('w-[78px]', 'md:w-[86px]');
    icon.style.transform = 'scaleX(1)';
  }
  renderSidebar();
}

function renderSubMenuTabs() {
  const menuObj = menusConfig.find(m => m.id === state.activeMenu);
  const container = document.getElementById('subMenuTabsContainer');
  const titleEl = document.getElementById('currentMenuTitle');
  if (!menuObj) return;

  titleEl.textContent = menuObj.title;

  container.innerHTML = menuObj.subMenus.map((sub, idx) => {
    const active = state.activeSubMenu === idx;
    return `
      <button
        onclick="switchSubMenu(${idx})"
        class="submenu-tab ${active ? 'active' : ''} px-3 py-1.5 rounded-lg text-[11.5px] whitespace-nowrap transition-all duration-200 ${
          active
            ? 'bg-white text-[#2b3654] font-extrabold shadow-sm'
            : 'text-[#7b879c] hover:text-[#2b3654] font-medium'
        }"
      >
        ${sub}
      </button>
    `;
  }).join('');
}

function switchMenu(menuId, subIdx = 0) {
  if (state.activeMenu === menuId && state.activeSubMenu === subIdx) return;
  state.activeMenu = menuId;
  state.activeSubMenu = subIdx;

  renderSidebar();
  renderSubMenuTabs();
  triggerViewportTransition();
}

function switchSubMenu(subIdx) {
  if (state.activeSubMenu === subIdx) return;
  state.activeSubMenu = subIdx;
  renderSubMenuTabs();
  triggerViewportTransition();
}

function cycleNextMenu() {
  const idx = menusConfig.findIndex(m => m.id === state.activeMenu);
  const nextIdx = (idx + 1) % menusConfig.length;
  switchMenu(menusConfig[nextIdx].id, 0);
}

function changeTransitionStyle(styleClass) {
  state.transitionClass = styleClass;
  triggerViewportTransition();
  showToast('Animation Style Updated', `Switched to ${styleClass.replace('anim-', '').toUpperCase()} transition.`);
}

function triggerViewportTransition() {
  const viewport = document.getElementById('menuViewport');
  viewport.classList.remove('anim-slide-fade', 'anim-slide-right', 'anim-3d-flip', 'anim-elastic');
  // Force reflow so CSS keyframe restarts cleanly
  void viewport.offsetWidth;
  viewport.scrollTop = 0;
  viewport.classList.add(state.transitionClass);
  renderActiveMenuContent();
}

function updateScrollProgress(el) {
  const indicator = document.getElementById('scrollProgressIndicator');
  if (!indicator) return;
  const maxScroll = el.scrollHeight - el.clientHeight;
  if (maxScroll <= 5) {
    indicator.style.height = '0%';
  } else {
    const pct = Math.min(100, Math.max(12, (el.scrollTop / maxScroll) * 100));
    indicator.style.height = `${pct}%`;
  }
}

// =========================================================================
// 3. OVERVIEW MENU
// =========================================================================
function renderOverviewScreen() {
  const yData = yearlyData[state.selectedYear] || yearlyData[CONFIG.defaultYear];

  // Sub-menu 1, 2, 3 show dedicated scrollable views within Overview, while Sub-menu 0 shows the main dashboard + live notices below the fold
  if (state.activeSubMenu === 1) return renderOverviewNoticesSubmenu();
  if (state.activeSubMenu === 2) return renderOverviewOKRSubmenu();
  if (state.activeSubMenu === 3) return renderOverviewExecutiveSubmenu();

  const kpiItems = [
    { count: yData.kpis[0], label: 'Users', pct: 74, color: '#eb7d62', bgRing: '#f6d8d0', dir: 'up' },
    { count: yData.kpis[1], label: 'Events', pct: 64, color: '#58cbe9', bgRing: '#d4f1f9', dir: 'down' },
    { count: yData.kpis[2], label: 'Holidays', pct: 52, color: '#f3b644', bgRing: '#faead0', dir: 'up' },
    { count: yData.kpis[3], label: 'Payrolls', pct: 78, color: '#6fd484', bgRing: '#daf3df', dir: 'down' },
    { count: yData.kpis[4], label: 'Reports', pct: 72, color: '#9c64f4', bgRing: '#e6d8fc', dir: 'up' }
  ];

  // Vertical capsule bars for the "New Employees" chart (one per cohort)
  const empBarsHeights = [
    52, 72, 64, 58, 60, 74, 62, 54, 66, 78, 63, 76, 56, 50, 79, 68, 75, 59, 44, 66, 62, 56
  ];

  return `
    <!-- ROW 1: 5 TOP KPI CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
      ${kpiItems.map((item, idx) => {
        const radius = 25;
        const circum = 2 * Math.PI * radius;
        const dashOffset = circum - (item.pct / 100) * circum;
        return `
          <div onclick="handleKpiCardClick(${idx})" style="animation-delay: ${idx * 55}ms" class="stagger-item neu-card neu-card-interactive px-5 py-4 flex items-center justify-between cursor-pointer">
            <!-- Circular Progress Ring + Inner Neumorphic Button -->
            <div class="relative w-[62px] h-[62px] flex items-center justify-center shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="${radius}" stroke="${item.bgRing}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                <circle
                  class="kpi-ring-progress"
                  cx="30" cy="30" r="${radius}"
                  stroke="${item.color}"
                  stroke-width="4.5"
                  fill="none"
                  stroke-linecap="round"
                  stroke-dasharray="${circum}"
                  stroke-dashoffset="${circum}"
                  data-target-offset="${dashOffset}"
                />
              </svg>
              <div class="neu-circle-inner w-9 h-9 rounded-full absolute flex items-center justify-center text-[#2b3654]">
                ${item.dir === 'up'
                  ? `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H9M17 7v8"/></svg>`
                  : `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 7L7 17M7 17h8M7 17V9"/></svg>`
                }
              </div>
            </div>

            <!-- Number & Label -->
            <div class="text-right pr-1">
              <div class="text-[26px] xl:text-[28px] font-extrabold text-[#2b3654] leading-tight tracking-tight counter-num" data-target="${item.count}">
                0
              </div>
              <div class="text-[12.5px] font-semibold text-[#7b879c] mt-0.5">${item.label}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- ROW 2: SALARY STATISTICS (2/3) & EMPLOYEE SATISFACTION (1/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

      <!-- Salary Statistics Card (8 Cols) -->
      <div style="animation-delay: 140ms" class="stagger-item lg:col-span-8 neu-card p-5 sm:p-6 relative flex flex-col justify-between min-h-[295px]">
        <!-- Card Top Controls -->
        <div class="flex flex-wrap items-center justify-between gap-2 z-10">
          <!-- Dropdown Pill -->
          <div class="neu-pill px-4 py-2 flex items-center gap-6 cursor-pointer" onclick="cycleSalaryMetric()">
            <span id="salaryMetricTitle" class="text-[13px] font-bold text-[#2b3654]">${state.salaryMetricMode}</span>
            <svg class="w-3.5 h-3.5 text-[#2b3654]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </div>

          <!-- Sort by Years + Export Icon -->
          <div class="flex items-center gap-2.5">
            <span class="text-[12px] font-semibold text-[#6c7a96]">Sort by</span>
            <div class="neu-pill px-3.5 py-2 flex items-center gap-3 cursor-pointer" onclick="cycleGlobalYear()">
              <span class="text-[12px] font-bold text-[#2b3654]">Years</span>
              <svg class="w-3.5 h-3.5 text-[#2b3654]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
            <button onclick="exportReport('Salary Statistics CSV')" class="neu-btn-icon w-9 h-9 flex items-center justify-center text-[#4f5d78]" title="Download Salary Report">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Floating Neumorphic Tooltip Card -->
        <div id="salaryFloatingTooltip" class="neu-card px-4 py-2.5 absolute top-5 left-[35%] sm:left-[38%] z-20 border border-white pointer-events-none transition-all duration-500">
          <div id="tooltipYearLabel" class="text-[12.5px] font-extrabold text-[#2b3654] mb-1">${state.selectedYear}</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10.5px] text-[#7b879c]">
            <div>Marketing: <span class="font-bold text-[#4f5d78]">${yData.salary.mkt}</span></div>
            <div>Design: <span class="font-bold text-[#4f5d78]">${yData.salary.des}</span></div>
            <div>Development: <span class="font-bold text-[#4f5d78]">${yData.salary.dev}</span></div>
            <div>Others: <span class="font-bold text-[#4f5d78]">${yData.salary.oth}</span></div>
          </div>
        </div>

        <!-- Multi-Wave Cubic Bezier Chart Area -->
        <div class="flex items-end gap-3 mt-8 pt-2">
          <!-- Y-Axis Labels -->
          <div class="flex flex-col justify-between h-[145px] text-[11px] font-semibold text-[#6c7a96] pb-6 pr-1 select-none">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          <!-- SVG Wave Canvas + X-Axis Years -->
          <div class="flex-1 flex flex-col">
            <div class="relative h-[125px] w-full">
              <svg viewBox="0 0 700 130" class="w-full h-full overflow-visible">
                <defs>
                  <filter id="waveShadow" x="-10%" y="-10%" width="120%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#8b9bb8" flood-opacity="0.28"/>
                  </filter>
                  <linearGradient id="orangeWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#f7c899" stop-opacity="0.35"/>
                    <stop offset="18%" stop-color="#f59229" stop-opacity="1"/>
                    <stop offset="85%" stop-color="#f59229" stop-opacity="1"/>
                    <stop offset="100%" stop-color="#f7c899" stop-opacity="0.3"/>
                  </linearGradient>
                  <linearGradient id="navyWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8f9eb8" stop-opacity="0.25"/>
                    <stop offset="20%" stop-color="#516587" stop-opacity="0.95"/>
                    <stop offset="82%" stop-color="#516587" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#8f9eb8" stop-opacity="0.2"/>
                  </linearGradient>
                  <linearGradient id="greyWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#d2d8e6" stop-opacity="0.2"/>
                    <stop offset="25%" stop-color="#b4bfd4" stop-opacity="0.8"/>
                    <stop offset="80%" stop-color="#b4bfd4" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#d2d8e6" stop-opacity="0.2"/>
                  </linearGradient>
                </defs>

                <!-- Wave 1: Soft Grey-Blue Background Spline -->
                <path
                  class="spline-path"
                  d="M 0,68 C 55,48 95,105 150,92 C 205,78 245,52 300,72 C 355,92 395,48 450,62 C 505,76 555,98 610,82 C 650,70 675,55 700,64"
                  fill="none"
                  stroke="url(#greyWaveGrad)"
                  stroke-width="3.5"
                  stroke-linecap="round"
                />

                <!-- Wave 2: Dark Slate-Navy Spline -->
                <path
                  class="spline-path"
                  filter="url(#waveShadow)"
                  d="M 0,88 C 60,92 105,82 155,70 C 210,55 245,44 295,62 C 345,80 390,82 440,60 C 495,35 545,42 600,68 C 645,88 675,85 700,72"
                  fill="none"
                  stroke="url(#navyWaveGrad)"
                  stroke-width="4"
                  stroke-linecap="round"
                />

                <!-- Wave 3: Vibrant Orange Primary Spline -->
                <path
                  class="spline-path"
                  filter="url(#waveShadow)"
                  d="M 0,76 C 50,76 90,104 140,94 C 195,82 225,45 275,58 C 325,72 345,86 385,62 C 420,40 435,28 465,42 C 505,60 525,88 575,78 C 625,68 660,72 700,82"
                  fill="none"
                  stroke="url(#orangeWaveGrad)"
                  stroke-width="4.5"
                  stroke-linecap="round"
                />

                <!-- Interactive Highlight Node on Orange Spline -->
                <g id="salaryActiveNode" class="cursor-pointer transition-transform duration-500" transform="translate(${(yData.salary.xPct / 100) * 700}, ${yData.salary.yDot})">
                  <circle cx="0" cy="0" r="12" fill="#f59229" opacity="0.22" class="badge-dot"/>
                  <circle cx="0" cy="0" r="7.5" fill="#f59229" stroke="#ffffff" stroke-width="3"/>
                </g>
              </svg>
            </div>

            <!-- Interactive X-Axis Year Labels -->
            <div class="grid grid-cols-8 text-center text-[11px] font-semibold pt-2">
              ${years.map(yr => `
                <button
                  onclick="handleGlobalYearChange('${yr}')"
                  class="py-1 rounded-lg transition-colors ${
                    state.selectedYear === yr
                      ? 'text-[#2b3654] font-extrabold bg-white/80 shadow-sm'
                      : 'text-[#8c97ac] hover:text-[#2b3654]'
                  }"
                >
                  ${yr}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Satisfaction Semi-Circular Gauge Card (4 Cols) -->
      <div style="animation-delay: 200ms" class="stagger-item lg:col-span-4 neu-card p-5 sm:p-6 flex flex-col justify-between min-h-[295px]">
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-extrabold text-[#2b3654]">Employee Satisfaction</h3>
          <button onclick="exportReport('Employee Satisfaction PDF')" class="neu-btn-icon w-9 h-9 flex items-center justify-center text-[#4f5d78]" title="Download Satisfaction Report">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </button>
        </div>

        <!-- Semi-Circular Thick Arc Gauge -->
        <div class="flex-1 flex flex-col items-center justify-center relative my-1">
          <div class="relative w-[240px] h-[155px] flex items-center justify-center">
            <svg viewBox="0 0 240 155" class="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="satisfactionArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#f26a5b"/>
                  <stop offset="55%" stop-color="#ff8c42"/>
                  <stop offset="100%" stop-color="#ffb668"/>
                </linearGradient>
                <filter id="gaugeGlow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#b4bfd4" flood-opacity="0.45"/>
                </filter>
              </defs>

              <!-- Background Recessed White/Soft-Grey Semi-Circle Arc -->
              <path
                d="M 32,126 A 88,88 0 1,1 208,126"
                fill="none"
                stroke="#ffffff"
                stroke-width="26"
                stroke-linecap="butt"
                filter="url(#gaugeGlow)"
              />

              <!-- Foreground Animated Coral-Orange Arc -->
              <path
                id="satisfactionGaugeArc"
                d="M 32,126 A 88,88 0 1,1 208,126"
                fill="none"
                stroke="url(#satisfactionArcGrad)"
                stroke-width="26"
                stroke-linecap="butt"
                stroke-dasharray="305"
                stroke-dashoffset="305"
                style="transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);"
              />
            </svg>

            <!-- Center Thumbs-Up Neumorphic Button & Percentage -->
            <div class="absolute top-[52px] flex flex-col items-center">
              <button onclick="boostSatisfaction()" title="Click to Boost Team Morale!" class="neu-circle-inner w-12 h-12 rounded-full flex items-center justify-center text-[#2b3654] hover:text-[#ff7e29] hover:scale-110 active:scale-95 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                </svg>
              </button>
              <div id="satisfactionValueText" class="text-[23px] font-extrabold text-[#2b3654] mt-2 tracking-tight">
                ${yData.satisfaction}%
              </div>
            </div>

            <!-- 0% and 100% Tilted End Labels -->
            <span class="absolute bottom-[8px] left-[22px] text-[11px] font-bold text-[#5b6782] -rotate-12">0%</span>
            <span class="absolute bottom-[6px] right-[14px] text-[11px] font-bold text-[#5b6782] rotate-12">100%</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ROW 3: PERFORMANCE STATISTICS (1/3) & NEW EMPLOYEES (2/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">

      <!-- Performance Statistics Card (4 Cols) -->
      <div style="animation-delay: 260ms" class="stagger-item lg:col-span-4 neu-card p-5 sm:p-6 flex flex-col justify-between min-h-[275px]">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[14px] font-extrabold text-[#2b3654]">Performance Statistics</h3>
          <button onclick="exportReport('Team Performance CSV')" class="neu-btn-icon w-9 h-9 flex items-center justify-center text-[#4f5d78]" title="Download Performance Stats">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4 my-auto">
          ${[
            { name: 'Developer Team', pct: yData.perf[0], grad: 'linear-gradient(90deg, #ff9945 0%, #d45b3e 100%)' },
            { name: 'Design Team', pct: yData.perf[1], grad: 'linear-gradient(90deg, #62cff4 0%, #1c64d9 100%)' },
            { name: 'Marketing Team', pct: yData.perf[2], grad: 'linear-gradient(90deg, #f7d046 0%, #2eb872 100%)' },
            { name: 'Management Team', pct: yData.perf[3], grad: 'linear-gradient(90deg, #f368e0 0%, #6c36c9 100%)' }
          ].map((team) => `
            <div class="cursor-pointer group" onclick="switchMenu('departments')">
              <div class="flex items-center justify-between text-[12px] mb-1.5">
                <span class="font-semibold text-[#5b6782] group-hover:text-[#2b3654] transition-colors">${team.name}</span>
                <span class="font-extrabold text-[#4f5d78]">${team.pct}%</span>
              </div>
              <div class="w-full h-[6px] rounded-full bg-[#e6eaf4] overflow-hidden shadow-inner">
                <div
                  class="perf-bar-fill h-full rounded-full transition-all duration-1000 ease-out"
                  style="width: 0%; background: ${team.grad};"
                  data-target-width="${team.pct}%"
                ></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- New Employees Vertical Capsule Bar Chart Card (8 Cols) -->
      <div style="animation-delay: 320ms" class="stagger-item lg:col-span-8 neu-card p-5 sm:p-6 relative flex flex-col justify-between min-h-[275px]">
        <!-- Card Top Header -->
        <div class="flex flex-wrap items-center justify-between gap-2 z-10">
          <div class="neu-pill px-4 py-2 flex items-center gap-6 cursor-pointer" onclick="switchMenu('employees')">
            <span class="text-[13px] font-bold text-[#2b3654]">New Employees</span>
            <svg class="w-3.5 h-3.5 text-[#2b3654]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </div>

          <div class="flex items-center gap-2.5">
            <span class="text-[12px] font-semibold text-[#6c7a96]">Sort by</span>
            <div class="neu-pill px-3.5 py-2 flex items-center gap-3 cursor-pointer" onclick="cycleGlobalYear()">
              <span class="text-[12px] font-bold text-[#2b3654]">Years</span>
              <svg class="w-3.5 h-3.5 text-[#2b3654]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
            <button onclick="exportReport('New Employees Breakdown CSV')" class="neu-btn-icon w-9 h-9 flex items-center justify-center text-[#4f5d78]" title="Download New Employees Data">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Floating Male/Female + Growth Ring Tooltip -->
        <div class="neu-card px-3.5 py-2 absolute top-3.5 left-[42%] sm:left-[47%] z-20 flex items-center gap-3 border border-white">
          <div>
            <div class="text-[12px] font-extrabold text-[#2b3654]">${state.selectedYear}</div>
            <div class="text-[10px] text-[#7b879c] leading-tight mt-0.5">
              <div>Male: <strong class="text-[#4f5d78]">${yData.newEmp.male}</strong></div>
              <div>Female: <strong class="text-[#4f5d78]">${yData.newEmp.female}</strong></div>
            </div>
          </div>
          <!-- Mini Growth Ring -->
          <div class="relative w-11 h-11 flex items-center justify-center">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" stroke="#f6d8d0" stroke-width="3.5" fill="none"/>
              <circle cx="22" cy="22" r="18" stroke="#eb7d62" stroke-width="3.5" fill="none" stroke-dasharray="113" stroke-dashoffset="35" stroke-linecap="round"/>
            </svg>
            <div class="neu-circle-inner w-7 h-7 rounded-full absolute flex flex-col items-center justify-center leading-none">
              <span class="text-[7px] text-[#2b3654]">↗</span>
              <span class="text-[8px] font-extrabold text-[#2b3654]">${yData.newEmp.growth}%</span>
            </div>
          </div>
        </div>

        <!-- Bar Chart Body -->
        <div class="flex items-end gap-3 mt-7">
          <!-- Y-Axis Labels -->
          <div class="flex flex-col justify-between h-[135px] text-[11px] font-semibold text-[#6c7a96] pb-6 pr-1 select-none">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          <!-- Capsule Bars + Dashed Trend Wave + X-Axis -->
          <div class="flex-1 flex flex-col relative">
            <!-- Dashed Wave Overlay + Orange Pointer Pin -->
            <svg viewBox="0 0 700 120" class="w-full h-[118px] absolute top-0 left-0 pointer-events-none z-10 overflow-visible">
              <path
                d="M 15,72 Q 95,40 175,68 T 335,58 T 490,74 T 665,65"
                fill="none"
                stroke="#aeb8cc"
                stroke-width="1.6"
                stroke-dasharray="3 3"
              />
              <!-- Vertical Orange Pin Line at active bar -->
              <line x1="432" y1="6" x2="432" y2="70" stroke="#f59229" stroke-width="1.8"/>
              <circle cx="432" cy="70" r="7" fill="#f59229" stroke="#ffffff" stroke-width="2.5"/>
            </svg>

            <!-- Capsule Bars Row -->
            <div class="flex items-end justify-between w-full px-1 h-[118px]">
              ${empBarsHeights.map((h, i) => {
                const isOrange = i % 2 === 1;
                return `
                  <div
                    onclick="showToast('Cohort Analytics', 'Batch #${i + 1}: ${h + 120} onboarded employees')"
                    class="emp-bar-track"
                    title="Click to inspect cohort #${i + 1}"
                  >
                    <div
                      class="emp-bar-fill ${isOrange ? 'emp-bar-orange' : 'emp-bar-slate'}"
                      style="height: 0%;"
                      data-target-height="${h}%"
                    ></div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- X-Axis Years -->
            <div class="grid grid-cols-8 text-center text-[11px] font-semibold pt-2">
              ${years.map(yr => `
                <button
                  onclick="handleGlobalYearChange('${yr}')"
                  class="py-0.5 rounded-md transition-colors ${
                    state.selectedYear === yr ? 'text-[#2b3654] font-extrabold' : 'text-[#9aa5b8] hover:text-[#2b3654]'
                  }"
                >
                  ${yr}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- EXTRA SCROLLABLE SECTION BELOW THE FOLD (demonstrates internal scrolling inside the fixed uniform frame) -->
    <div style="animation-delay: 380ms" class="stagger-item neu-card p-5 sm:p-6 mb-2">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff7e29]"></span>
          <h3 class="text-[14px] font-extrabold text-[#2b3654]">Recent Company Notices & Live HR Stream (Scrollable Sub-Section)</h3>
        </div>
        <button onclick="openCreateNoticeModal()" class="text-xs font-bold text-[#3168f8] hover:underline">+ Add Notice</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        ${state.notices.map(n => `
          <div class="p-4 rounded-2xl bg-white/80 border border-white shadow-sm flex flex-col justify-between gap-2 hover:shadow-md transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  n.priority === 'Important' ? 'bg-orange-100 text-orange-600' :
                  n.priority === 'Holiday' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }">${n.priority} • ${n.dept}</span>
                <h4 class="text-[13px] font-extrabold text-[#2b3654] mt-1">${n.title}</h4>
              </div>
              <span class="text-[10.5px] font-semibold text-[#8c97ac] whitespace-nowrap">${n.date}</span>
            </div>
            <p class="text-[11.5px] text-[#6c7a96] leading-relaxed">${n.body}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Overview Sub-Menus (1, 2, 3)
function renderOverviewNoticesSubmenu() {
  return `
    <div class="neu-card p-6 mb-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654]">Live Broadcast Notices & Audit Feed</h3>
          <p class="text-xs text-[#7b879c]">Scroll down to inspect all historical announcements and HR activity logs inside the uniform menu frame.</p>
        </div>
        <button onclick="openCreateNoticeModal()" class="btn-create-notice text-white text-xs font-bold px-4 py-2 rounded-xl">+ New Broadcast</button>
      </div>
      <div class="space-y-3">
        ${[...state.notices, ...state.notices].map((n, i) => `
          <div style="animation-delay: ${i * 45}ms" class="stagger-item p-4 rounded-2xl bg-white/85 border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-600">${n.dept}</span>
                <span class="text-xs font-extrabold text-[#2b3654]">${n.title}</span>
              </div>
              <p class="text-xs text-[#6c7a96] mt-1">${n.body}</p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-[11px] font-bold text-[#4f5d78]">${n.date}</div>
              <button onclick="showToast('Notice Acknowledged', 'Marked as read by Admin')" class="text-[11px] text-[#3168f8] font-semibold hover:underline mt-1">Acknowledge →</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOverviewOKRSubmenu() {
  const okrs = [
    { dept: 'Developer Team', obj: 'Reduce Cloud Infrastructure Latency by 35%', progress: 82, owner: 'Rizky Ramadhan', q: 'Q4 2014' },
    { dept: 'Design Team', obj: 'Unify Neumorphic Design System Tokens Across 12 Modules', progress: 94, owner: 'Nadia Putri', q: 'Q4 2014' },
    { dept: 'Marketing Team', obj: 'Scale Monthly Recurring Inbound Leads to 4,500+', progress: 68, owner: 'Elena Rostova', q: 'Q4 2014' },
    { dept: 'Management Team', obj: 'Maintain Annual Employee Retention Rate Above 94%', progress: 91, owner: 'Marcus Vance', q: 'Q4 2014' },
    { dept: 'HR Operations', obj: 'Automate 100% of Monthly Tax & Payroll Slips', progress: 88, owner: 'Clara Wijaya', q: 'Q4 2014' },
    { dept: 'Security & IT', obj: 'Zero Critical Vulnerability SLA in SOC-2 Audit', progress: 100, owner: 'Naufal Azhar', q: 'Q4 2014' },
    { dept: 'Product Team', obj: 'Ship Self-Service Employee Onboarding Portal v2.4', progress: 76, owner: 'Sherina Munaf', q: 'Q4 2014' }
  ];
  return `
    <div class="neu-card p-6">
      <h3 class="text-base font-extrabold text-[#2b3654] mb-1">Quarterly OKR Tracker (${state.selectedYear})</h3>
      <p class="text-xs text-[#7b879c] mb-5">Track key results across all departments. Content scrolls smoothly inside the fixed menu container.</p>
      <div class="space-y-4">
        ${okrs.map((o, i) => `
          <div style="animation-delay: ${i * 50}ms" class="stagger-item p-4 rounded-2xl bg-white/80 border border-white shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#3168f8]">${o.dept} • ${o.q}</span>
                <h4 class="text-sm font-extrabold text-[#2b3654]">${o.obj}</h4>
              </div>
              <span class="text-sm font-extrabold text-[#ff7e29]">${o.progress}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-[#e6eaf4] overflow-hidden mb-2">
              <div class="perf-bar-fill h-full rounded-full bg-gradient-to-r from-[#3168f8] to-[#ff7e29] transition-all duration-1000" style="width: 0%" data-target-width="${o.progress}%"></div>
            </div>
            <div class="text-[11px] text-[#7b879c]">Lead Owner: <strong class="text-[#2b3654]">${o.owner}</strong></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOverviewExecutiveSubmenu() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
      <div class="neu-card p-5">
        <div class="text-xs font-bold text-[#7b879c]">Net Revenue per Employee</div>
        <div class="text-2xl font-extrabold text-[#2b3654] mt-1">$142,800</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-2">↗ +18.4% vs prior year</div>
      </div>
      <div class="neu-card p-5">
        <div class="text-xs font-bold text-[#7b879c]">Avg Time to Fill Roles</div>
        <div class="text-2xl font-extrabold text-[#2b3654] mt-1">19.5 Days</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-2">↘ 4.2 days faster</div>
      </div>
      <div class="neu-card p-5">
        <div class="text-xs font-bold text-[#7b879c]">Annual Retention Score</div>
        <div class="text-2xl font-extrabold text-[#2b3654] mt-1">94.8%</div>
        <div class="text-[11px] text-blue-600 font-bold mt-2">★ Top 5% Industry Benchmark</div>
      </div>
    </div>
    <div class="neu-card p-6">
      <h3 class="text-sm font-extrabold text-[#2b3654] mb-3">Executive Board Summary Notes</h3>
      <p class="text-xs text-[#5b6782] leading-relaxed mb-4">
        Across ${state.selectedYear}, total workforce scaled to 348 full-time equivalents with Design and Developer teams leading overall KPI attainment (84% and 65% respectively). Payroll disbursements remained 100% on-schedule across 3,458 individual transactions.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-xl bg-white/80"><strong>Q1 Highlight:</strong> Launched automated benefits portal for all 348 employees.</div>
        <div class="p-3.5 rounded-xl bg-white/80"><strong>Q2 Highlight:</strong> Expanded Engineering hub with 42 new senior hires.</div>
        <div class="p-3.5 rounded-xl bg-white/80"><strong>Q3 Highlight:</strong> Employee satisfaction reached 74% positive sentiment.</div>
        <div class="p-3.5 rounded-xl bg-white/80"><strong>Q4 Highlight:</strong> Completed 3,488 audit & compliance reports without findings.</div>
      </div>
    </div>
  `;
}

// =========================================================================
// 4. OTHER SIDEBAR MENUS (rich long scrollable content)
// =========================================================================

// MENU: DEPARTMENTS
function renderDepartmentsScreen() {
  const depts = [
    { name: 'Developer Team', lead: 'Reza Rahadian', headcount: 142, budget: '$1.84M', util: 82, color: '#ff7e29', desc: 'Core Platform, Mobile Apps, Cloud Infrastructure & SRE' },
    { name: 'Design Team', lead: 'Nadia Putri Pratama', headcount: 64, budget: '$790K', util: 88, color: '#3168f8', desc: 'Product UI/UX, Design Systems, Motion & Brand Identity' },
    { name: 'Marketing Team', lead: 'Elena Rostova', headcount: 58, budget: '$920K', util: 71, color: '#5cd68d', desc: 'Growth Acquisition, Content Strategy, PR & Field Events' },
    { name: 'Management Team', lead: 'Maudy Ayunda', headcount: 34, budget: '$680K', util: 76, color: '#9e68f6', desc: 'Executive Strategy, People Ops, Finance & Legal Compliance' },
    { name: 'Data & AI Research', lead: 'Putra Mahendra', headcount: 28, budget: '$610K', util: 91, color: '#45c4e9', desc: 'Predictive Analytics, BI Warehousing & ML Pipelines' },
    { name: 'Customer Success', lead: 'Sherina Munaf', headcount: 22, budget: '$340K', util: 69, color: '#f4b952', desc: 'Enterprise Onboarding, 24/7 Support & Account Retention' }
  ];

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
      ${depts.map((d, i) => `
        <div style="animation-delay: ${i * 55}ms" class="stagger-item neu-card neu-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold text-white" style="background:${d.color}">${d.headcount} Members</span>
              <span class="text-xs font-bold text-[#7b879c]">Budget: <strong class="text-[#2b3654]">${d.budget}</strong></span>
            </div>
            <h3 class="text-base font-extrabold text-[#2b3654] mt-2">${d.name}</h3>
            <p class="text-[11.5px] text-[#7b879c] mt-1">${d.desc}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-200/60">
            <div class="flex justify-between text-[11px] font-bold mb-1">
              <span class="text-[#6c7a96]">Lead: ${d.lead}</span>
              <span class="text-[#2b3654]">${d.util}% KPI</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-[#e6eaf4] overflow-hidden">
              <div class="perf-bar-fill h-full rounded-full transition-all duration-1000" style="width:0%; background:${d.color}" data-target-width="${d.util}%"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Long Scrollable Sub-Unit Breakdown Table -->
    <div class="neu-card p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-extrabold text-[#2b3654]">Department Sub-Units & Cost Center Breakdown (Scrollable Table)</h3>
        <button onclick="exportReport('Departments Allocation CSV')" class="neu-pill px-3 py-1.5 text-xs font-bold text-[#3168f8]">Export CSV ↓</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="text-[#7b879c] border-b border-slate-200/70">
              <th class="py-2.5 px-3">Cost Center</th>
              <th class="py-2.5 px-3">Sub-Unit Squad</th>
              <th class="py-2.5 px-3">Department</th>
              <th class="py-2.5 px-3">Active HC</th>
              <th class="py-2.5 px-3">Quarterly Burn</th>
              <th class="py-2.5 px-3">Velocity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/50">
            ${[
              ['CC-01', 'Core API & Microservices', 'Developer Team', '38', '$410,000', '96%'],
              ['CC-02', 'Design Systems & Tokens', 'Design Team', '19', '$185,000', '94%'],
              ['CC-03', 'Mobile iOS & Android', 'Developer Team', '32', '$360,000', '91%'],
              ['CC-04', 'Performance Growth Marketing', 'Marketing Team', '24', '$295,000', '88%'],
              ['CC-05', 'SecOps & Cloud Reliability', 'Developer Team', '22', '$275,000', '97%'],
              ['CC-06', 'People Partner & Talent Acquisition', 'Management Team', '16', '$145,000', '92%'],
              ['CC-07', 'Brand Motion & 3D Interactive', 'Design Team', '21', '$210,000', '90%'],
              ['CC-08', 'Enterprise Field Sales & Events', 'Marketing Team', '20', '$240,000', '85%']
            ].map(r => `
              <tr class="hover:bg-white/70 transition">
                <td class="py-3 px-3 font-bold text-[#3168f8]">${r[0]}</td>
                <td class="py-3 px-3 font-extrabold text-[#2b3654]">${r[1]}</td>
                <td class="py-3 px-3 text-[#5b6782]">${r[2]}</td>
                <td class="py-3 px-3 font-bold text-[#2b3654]">${r[3]}</td>
                <td class="py-3 px-3 font-semibold text-[#4f5d78]">${r[4]}</td>
                <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">${r[5]}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// MENU: EMPLOYEES DIRECTORY
function renderEmployeesScreen() {
  const q = state.searchQuery.toLowerCase();
  const filtered = employeesList.filter(e => {
    const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
    if (state.activeSubMenu === 1) return matchesQuery && e.status === 'Remote';
    if (state.activeSubMenu === 2) return matchesQuery && e.status === 'On Leave';
    if (state.activeSubMenu === 3) return matchesQuery && e.score >= 94;
    return matchesQuery;
  });

  return `
    <div class="neu-card p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654]">Employee Master Directory (${filtered.length} Listed)</h3>
          <p class="text-xs text-[#7b879c]">Daftar panjang karyawan dapat di-scroll dengan mulus di dalam frame seragam ini.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="exportReport('Employee Directory CSV')" class="neu-pill px-3.5 py-2 text-xs font-bold text-[#2b3654]">Export All ↓</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="text-[#7b879c] border-b border-slate-200/70">
              <th class="py-3 px-3">Employee</th>
              <th class="py-3 px-3">Role & Title</th>
              <th class="py-3 px-3">Department</th>
              <th class="py-3 px-3">Monthly Salary</th>
              <th class="py-3 px-3">KPI Score</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/50">
            ${filtered.map((emp, idx) => {
              const initials = emp.name.split(' ').map(n => n[0]).slice(0, 2).join('');
              return `
                <tr style="animation-delay: ${Math.min(idx * 25, 350)}ms" class="stagger-item hover:bg-white/80 transition">
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0" style="background:${emp.avatar}">${initials}</div>
                      <div>
                        <div class="font-extrabold text-[#2b3654]">${emp.name}</div>
                        <div class="text-[10px] text-[#8c97ac]">${emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3 font-semibold text-[#4f5d78]">${emp.role}</td>
                  <td class="py-3 px-3 text-[#5b6782]">${emp.dept}</td>
                  <td class="py-3 px-3 font-extrabold text-[#2b3654]">${emp.salary}</td>
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 rounded-full bg-[#e6eaf4] overflow-hidden">
                        <div class="h-full rounded-full bg-[#3168f8]" style="width:${emp.score}%"></div>
                      </div>
                      <span class="font-bold text-[#2b3654]">${emp.score}%</span>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      emp.status === 'Remote' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }">${emp.status}</span>
                  </td>
                  <td class="py-3 px-3 text-right">
                    <button onclick="showToast('Profile Inspected', '${emp.name} — ${emp.role}')" class="neu-pill px-2.5 py-1 text-[11px] font-bold text-[#3168f8]">View Slip</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// MENU: PAYROLL & FINANCE
function renderPayrollScreen() {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
      <div class="neu-card p-5">
        <div class="text-xs font-semibold text-[#7b879c]">Total Monthly Payroll (${state.selectedYear})</div>
        <div class="text-2xl font-extrabold text-[#2b3654] mt-1">$2,485,920</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-1">✓ 3,458 Slips Disbursed</div>
      </div>
      <div class="neu-card p-5">
        <div class="text-xs font-semibold text-[#7b879c]">Performance Bonuses Pool</div>
        <div class="text-2xl font-extrabold text-[#ff7e29] mt-1">$318,400</div>
        <div class="text-[11px] text-[#6c7a96] font-semibold mt-1">Distributed across 4 teams</div>
      </div>
      <div class="neu-card p-5">
        <div class="text-xs font-semibold text-[#7b879c]">Tax & BPJS Withholding</div>
        <div class="text-2xl font-extrabold text-[#3168f8] mt-1">$194,120</div>
        <div class="text-[11px] text-blue-600 font-bold mt-1">Auto-synced with e-Filing</div>
      </div>
    </div>

    <div class="neu-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-extrabold text-[#2b3654]">Payroll Disbursement Ledger (Scrollable Batch History)</h3>
        <button onclick="exportReport('Payroll Ledger PDF')" class="btn-create-notice text-white px-3.5 py-1.5 rounded-xl text-xs font-bold">Run Batch Payroll</button>
      </div>
      <div class="space-y-2.5">
        ${employeesList.slice(0, 16).map((e, idx) => `
          <div style="animation-delay: ${idx * 30}ms" class="stagger-item p-3.5 rounded-xl bg-white/85 border border-white flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xs font-extrabold text-[#7b879c]">#PAY-${20140 + idx}</span>
              <div>
                <div class="text-xs font-extrabold text-[#2b3654]">${e.name}</div>
                <div class="text-[10.5px] text-[#7b879c]">${e.dept} • ${e.role}</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-xs font-extrabold text-[#2b3654]">${e.salary}</div>
                <div class="text-[10px] text-emerald-600 font-bold">Paid via Direct Transfer</div>
              </div>
              <button onclick="exportReport('Salary Slip - ${e.name}')" class="neu-btn-icon w-8 h-8 flex items-center justify-center text-[#4f5d78]" title="Download PDF Slip">↓</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// MENU: DOCUMENTS & HOLIDAYS
function renderDocumentsScreen() {
  const holidays = [
    { date: 'Jan 01', name: 'New Year’s Day', day: 'Wednesday', type: 'National Holiday' },
    { date: 'Feb 14', name: 'Company Foundation Day', day: 'Friday', type: 'Company Special' },
    { date: 'Mar 31', name: 'Nyepi / Day of Silence', day: 'Monday', type: 'National Holiday' },
    { date: 'Apr 18', name: 'Good Friday', day: 'Friday', type: 'National Holiday' },
    { date: 'May 01', name: 'International Labor Day', day: 'Thursday', type: 'National Holiday' },
    { date: 'May 29', name: 'Ascension Day', day: 'Thursday', type: 'National Holiday' },
    { date: 'Jul 28', name: 'Eid al-Fitr Collective Leave', day: 'Monday - Tuesday', type: 'National Holiday' },
    { date: 'Aug 17', name: 'Indonesian Independence Day', day: 'Sunday', type: 'National Holiday' },
    { date: 'Oct 05', name: 'Eid al-Adha', day: 'Sunday', type: 'National Holiday' },
    { date: 'Dec 25', name: 'Christmas & Year-End Break', day: 'Thursday', type: 'National Holiday' }
  ];

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-7 neu-card p-6">
        <h3 class="text-sm font-extrabold text-[#2b3654] mb-1">10 Official Company Holidays (${state.selectedYear})</h3>
        <p class="text-xs text-[#7b879c] mb-4">Matches the "10 Holidays" KPI counter on the main Overview screen.</p>
        <div class="space-y-2.5">
          ${holidays.map((h, i) => `
            <div style="animation-delay: ${i * 40}ms" class="stagger-item p-3 rounded-xl bg-white/85 border border-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-11 rounded-xl bg-amber-100/80 text-amber-700 font-extrabold text-xs flex flex-col items-center justify-center leading-tight">
                  <span>${h.date.split(' ')[0]}</span>
                  <span class="text-sm">${h.date.split(' ')[1]}</span>
                </div>
                <div>
                  <div class="text-xs font-extrabold text-[#2b3654]">${h.name}</div>
                  <div class="text-[11px] text-[#7b879c]">${h.day}</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">${h.type}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="lg:col-span-5 neu-card p-6">
        <h3 class="text-sm font-extrabold text-[#2b3654] mb-1">HR Policy & Contract Documents</h3>
        <p class="text-xs text-[#7b879c] mb-4">Click any document to download verified PDF copy.</p>
        <div class="space-y-3">
          ${[
            ['Employee Handbook 2014-2017.pdf', '4.2 MB', 'Updated 2 days ago'],
            ['Remote & Hybrid Work Guidelines.pdf', '1.8 MB', 'Verified by Legal'],
            ['Health & Dental Insurance Coverage.pdf', '3.1 MB', 'All Full-time Staff'],
            ['Code of Conduct & Security SLA.pdf', '2.4 MB', 'Mandatory Sign-off'],
            ['Executive Stock Option Plan (ESOP).pdf', '1.5 MB', 'Senior Leads'],
            ['Reimbursement & Travel Expense SOP.pdf', '980 KB', 'Finance Dept']
          ].map(doc => `
            <div onclick="exportReport('${doc[0]}')" class="p-3.5 rounded-xl bg-white/80 hover:bg-white transition cursor-pointer flex items-center justify-between">
              <div>
                <div class="text-xs font-extrabold text-[#2b3654]">${doc[0]}</div>
                <div class="text-[10.5px] text-[#7b879c]">${doc[1]} • ${doc[2]}</div>
              </div>
              <span class="neu-btn-icon w-8 h-8 flex items-center justify-center text-[#3168f8] text-xs font-bold">↓</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// MENU: ANALYTICS & REPORTS
function renderAnalyticsScreen() {
  return `
    <div class="neu-card p-6 mb-5">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654]">3,488 Generated HR & Audit Reports</h3>
          <p class="text-xs text-[#7b879c]">Deep analytics across hiring velocity, diversity ratio, and departmental efficiency.</p>
        </div>
        <button onclick="exportReport('Master Executive Report ZIP')" class="btn-create-notice text-white px-4 py-2 rounded-xl text-xs font-bold">Download Master Pack</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div class="p-4 rounded-2xl bg-white/80">
          <div class="text-[11px] font-bold text-[#7b879c]">Gender Diversity Ratio</div>
          <div class="text-xl font-extrabold text-[#2b3654] mt-1">56% M / 44% F</div>
          <div class="text-[10.5px] text-emerald-600 font-semibold mt-1">+4% Female Leadership</div>
        </div>
        <div class="p-4 rounded-2xl bg-white/80">
          <div class="text-[11px] font-bold text-[#7b879c]">Promotion Velocity</div>
          <div class="text-xl font-extrabold text-[#3168f8] mt-1">18.2 Months</div>
          <div class="text-[10.5px] text-[#6c7a96] font-semibold mt-1">Median cycle across squads</div>
        </div>
        <div class="p-4 rounded-2xl bg-white/80">
          <div class="text-[11px] font-bold text-[#7b879c]">Training Completion</div>
          <div class="text-xl font-extrabold text-[#ff7e29] mt-1">92.4%</div>
          <div class="text-[10.5px] text-emerald-600 font-semibold mt-1">321 / 348 Completed</div>
        </div>
        <div class="p-4 rounded-2xl bg-white/80">
          <div class="text-[11px] font-bold text-[#7b879c]">Absenteeism Rate</div>
          <div class="text-xl font-extrabold text-purple-600 mt-1">1.4%</div>
          <div class="text-[10.5px] text-emerald-600 font-semibold mt-1">All-time low record</div>
        </div>
      </div>

      <div class="space-y-2.5">
        ${[
          ['REP-3488', 'Q4 Annual Compensation Benchmark Analysis', 'Payroll & Finance'],
          ['REP-3487', 'Engineering Squad Velocity & Burnout Index', 'Developer Team'],
          ['REP-3486', 'Design System Adoption & UI Consistency Audit', 'Design Team'],
          ['REP-3485', 'Onboarding 90-Day Retention Cohort Study', 'People Ops'],
          ['REP-3484', 'Tax & Statutory Compliance Verification', 'Legal & Finance'],
          ['REP-3483', 'Annual Employee Satisfaction Survey Raw Dataset', 'All Teams'],
          ['REP-3482', 'IT Hardware Depreciation & Refresh Forecast', 'Assets Team']
        ].map((rep, i) => `
          <div style="animation-delay:${i * 40}ms" class="stagger-item p-3.5 rounded-xl bg-white/85 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-[11px]">${rep[0]}</span>
              <div>
                <div class="text-xs font-extrabold text-[#2b3654]">${rep[1]}</div>
                <div class="text-[10.5px] text-[#7b879c]">${rep[2]}</div>
              </div>
            </div>
            <button onclick="exportReport('${rep[0]} - ${rep[1]}')" class="neu-pill px-3 py-1.5 text-xs font-bold text-[#3168f8]">Export PDF ↓</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// MENU: RECRUITMENT & JOBS
function renderRecruitmentScreen() {
  const stages = [
    { title: 'Applied (18)', color: '#3168f8', candidates: [['Bagas Adi', 'Sr. Frontend Eng', '92% Match'], ['Siti Nurhaliza', 'Product Designer', '89% Match'], ['Rio Dewanto', 'Data Analyst', '87% Match'], ['Anya Geraldine', 'Growth Marketer', '85% Match']] },
    { title: 'Technical Review (14)', color: '#ff7e29', candidates: [['Iqbaal Ramadhan', 'iOS Engineer', '95% Match'], ['Cinta Laura', 'Brand Director', '94% Match'], ['Jefri Nichol', 'DevOps Specialist', '88% Match'], ['Prilly Latuconsina', 'HR Generalist', '91% Match']] },
    { title: 'Final Offer (10)', color: '#5cd68d', candidates: [['Nicholas Saputra', 'Principal Architect', '99% Match'], ['Dian Sastro', 'VP of Product', '98% Match'], ['Afgan Syahreza', 'Lead Copywriter', '93% Match']] }
  ];
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
      ${stages.map((st, idx) => `
        <div style="animation-delay:${idx * 70}ms" class="stagger-item neu-card p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-extrabold text-[#2b3654]">${st.title}</span>
            <span class="w-2.5 h-2.5 rounded-full" style="background:${st.color}"></span>
          </div>
          <div class="space-y-3">
            ${st.candidates.map(c => `
              <div onclick="showToast('Candidate Profile', '${c[0]} — ${c[1]} (${c[2]})')" class="p-3.5 rounded-xl bg-white/85 hover:bg-white transition cursor-pointer shadow-sm">
                <div class="text-xs font-extrabold text-[#2b3654]">${c[0]}</div>
                <div class="text-[11px] text-[#6c7a96] mt-0.5">${c[1]}</div>
                <div class="mt-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#3168f8]">${c[2]}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// MENU: ASSETS & INVENTORY
function renderAssetsScreen() {
  return `
    <div class="neu-card p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654]">IT Hardware & Software License Register</h3>
          <p class="text-xs text-[#7b879c]">Assigned workstations, monitors, and SaaS seats across 348 employees.</p>
        </div>
        <button onclick="showToast('Asset Audit', 'All 348 workstations verified online')" class="neu-pill px-3.5 py-2 text-xs font-bold text-[#3168f8]">Verify Inventory</button>
      </div>
      <div class="space-y-2.5">
        ${employeesList.slice(0, 14).map((e, i) => `
          <div style="animation-delay:${i * 30}ms" class="stagger-item p-3.5 rounded-xl bg-white/85 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span class="font-extrabold text-[#2b3654]">MacBook Pro 16" M3 Max • #AST-${880 + i}</span>
              <div class="text-[11px] text-[#7b879c]">Assigned to: <strong class="text-[#4f5d78]">${e.name}</strong> (${e.dept})</div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10.5px]">Active & Encrypted</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// MENU: ATTENDANCE & SHIFT
function renderAttendanceScreen() {
  return `
    <div class="neu-card p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654]">Live Daily Attendance & Biometric Log</h3>
          <p class="text-xs text-[#7b879c]">Real-time check-in timestamps and shift adherence across offices.</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">97.4% On-Time Today</span>
      </div>
      <div class="space-y-2.5">
        ${employeesList.slice(0, 16).map((e, i) => `
          <div style="animation-delay:${i * 25}ms" class="stagger-item p-3 rounded-xl bg-white/85 flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div>
                <div class="font-extrabold text-[#2b3654]">${e.name}</div>
                <div class="text-[10.5px] text-[#7b879c]">${e.dept}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-[#2b3654]">Check-in: 08:${(15 + (i * 2) % 40).toString().padStart(2, '0')} AM</div>
              <div class="text-[10px] text-[#7b879c]">HQ Biometric Gate</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// MENU: SETTINGS (interactive transition engine & frame diagnostics)
function renderSettingsScreen() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="neu-card p-6">
        <h3 class="text-base font-extrabold text-[#2b3654] mb-1">Menu Transition Animation Engine</h3>
        <p class="text-xs text-[#7b879c] mb-4">Pilih gaya animasi saat berpindah menu atau sub-menu.</p>
        <div class="space-y-2.5">
          ${CONFIG.animations.map(opt => `
            <div
              onclick="changeTransitionStyle('${opt.id}')"
              class="p-3.5 rounded-xl cursor-pointer border transition flex items-center justify-between ${
                state.transitionClass === opt.id ? 'bg-white border-[#3168f8] shadow-sm' : 'bg-white/60 border-white hover:bg-white'
              }"
            >
              <div>
                <div class="text-xs font-extrabold text-[#2b3654]">${opt.title}</div>
                <div class="text-[11px] text-[#7b879c]">${opt.desc}</div>
              </div>
              <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                state.transitionClass === opt.id ? 'border-[#3168f8]' : 'border-slate-300'
              }">
                ${state.transitionClass === opt.id ? '<span class="w-2 h-2 rounded-full bg-[#3168f8]"></span>' : ''}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="neu-card p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-extrabold text-[#2b3654] mb-1">Uniform Frame & Scroll Diagnostics</h3>
          <p class="text-xs text-[#7b879c] mb-4">Arsitektur kontainer seragam menjaga ukuran luar setiap menu tetap presisi.</p>
          <div class="p-4 rounded-2xl neu-inset space-y-2 text-xs text-[#4f5d78]">
            <div class="flex justify-between"><span>Menu Frame Height:</span><strong class="text-[#2b3654]">calc(100vh - 156px) (Fixed)</strong></div>
            <div class="flex justify-between"><span>Internal Overflow Behaviour:</span><strong class="text-emerald-600">Smooth Auto-Scroll Y</strong></div>
            <div class="flex justify-between"><span>Total Active Sidebar Menus:</span><strong class="text-[#2b3654]">${menusConfig.length} Menus</strong></div>
            <div class="flex justify-between"><span>Active Dataset Year:</span><strong class="text-[#ff7e29]">${state.selectedYear}</strong></div>
          </div>
        </div>
        <button onclick="switchMenu('overview')" class="btn-create-notice text-white w-full py-2.5 rounded-xl text-xs font-bold mt-4">
          Return to Overview Dashboard
        </button>
      </div>
    </div>
  `;
}

// =========================================================================
// 5. MASTER RENDER & POST-RENDER SVG / COUNTER ANIMATIONS
// =========================================================================
const SCREEN_RENDERERS = {
  overview: renderOverviewScreen,
  departments: renderDepartmentsScreen,
  employees: renderEmployeesScreen,
  payroll: renderPayrollScreen,
  documents: renderDocumentsScreen,
  analytics: renderAnalyticsScreen,
  recruitment: renderRecruitmentScreen,
  assets: renderAssetsScreen,
  attendance: renderAttendanceScreen,
  settings: renderSettingsScreen
};

function renderActiveMenuContent() {
  const viewport = document.getElementById('menuViewport');
  const renderer = SCREEN_RENDERERS[state.activeMenu] || renderOverviewScreen;
  viewport.innerHTML = renderer();

  // Trigger animated counters, SVG rings, gauge arc, and bar heights right after DOM mount
  requestAnimationFrame(() => {
    animateNumbers();
    animateSvgRingsAndBars();
    updateScrollProgress(viewport);
  });
}

function animateNumbers() {
  const counters = document.querySelectorAll('.counter-num');
  counters.forEach(el => {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    const duration = 950;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  });
}

function animateSvgRingsAndBars() {
  // 1. Top 5 KPI Circular Progress Rings
  document.querySelectorAll('.kpi-ring-progress').forEach(circle => {
    const targetOffset = circle.getAttribute('data-target-offset');
    setTimeout(() => {
      circle.style.strokeDashoffset = targetOffset;
    }, 60);
  });

  // 2. Employee Satisfaction Semi-Circular Gauge Arc
  const gaugeArc = document.getElementById('satisfactionGaugeArc');
  if (gaugeArc) {
    const yData = yearlyData[state.selectedYear] || yearlyData[CONFIG.defaultYear];
    const maxDash = 305;
    const targetDash = maxDash - (yData.satisfaction / 100) * maxDash;
    setTimeout(() => {
      gaugeArc.style.strokeDashoffset = targetDash;
    }, 90);
  }

  // 3. Horizontal Performance Bars
  document.querySelectorAll('.perf-bar-fill').forEach(bar => {
    const w = bar.getAttribute('data-target-width');
    setTimeout(() => {
      bar.style.width = w;
    }, 80);
  });

  // 4. Vertical Capsule Bars (New Employees Chart)
  document.querySelectorAll('.emp-bar-fill').forEach((bar, i) => {
    const h = bar.getAttribute('data-target-height');
    setTimeout(() => {
      bar.style.height = h;
    }, 60 + i * 18);
  });
}

// =========================================================================
// 6. INTERACTIVE HANDLERS & MICRO-INTERACTIONS
// =========================================================================
function handleGlobalYearChange(year) {
  state.selectedYear = year;
  const selectEl = document.getElementById('globalYearSelect');
  if (selectEl && selectEl.value !== year) {
    selectEl.value = year;
  }
  renderActiveMenuContent();
  showToast(`Year Filter: ${year}`, `Updated KPI rings, salary curves, and employee metrics for ${year}.`);
}

function cycleGlobalYear() {
  const idx = years.indexOf(state.selectedYear);
  const nextYr = years[(idx + 1) % years.length];
  handleGlobalYearChange(nextYr);
}

function cycleSalaryMetric() {
  const modes = ['Salary Statistics', 'Bonus Distribution', 'Overtime Cost'];
  const idx = modes.indexOf(state.salaryMetricMode);
  state.salaryMetricMode = modes[(idx + 1) % modes.length];
  renderActiveMenuContent();
  showToast('Chart Metric Switched', `Now viewing ${state.salaryMetricMode}`);
}

function boostSatisfaction() {
  const yData = yearlyData[state.selectedYear];
  yData.satisfaction = yData.satisfaction >= 96 ? 74 : yData.satisfaction + 4;
  const textEl = document.getElementById('satisfactionValueText');
  if (textEl) textEl.textContent = `${yData.satisfaction}%`;
  animateSvgRingsAndBars();
  showToast('Team Morale Boosted! 👍', `Employee Satisfaction updated to ${yData.satisfaction}%`);
}

function handleKpiCardClick(idx) {
  const targetMenus = ['employees', 'recruitment', 'documents', 'payroll', 'analytics'];
  switchMenu(targetMenus[idx] || 'overview');
}

function handleGlobalSearch(val) {
  state.searchQuery = val.trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', !state.searchQuery);
  }
  if (state.searchQuery && state.activeMenu !== 'employees') {
    switchMenu('employees', 0);
  } else {
    renderActiveMenuContent();
  }
}

function clearGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  if (input) input.value = '';
  handleGlobalSearch('');
}

function toggleLanguage() {
  state.lang = state.lang === 'EN' ? 'ID' : 'EN';
  document.getElementById('langFlag').textContent = state.lang === 'EN' ? '🇺🇸' : '🇮🇩';
  document.getElementById('langLabel').textContent = state.lang === 'EN' ? 'English' : 'Indonesia';
  showToast(
    state.lang === 'EN' ? 'Language Switched' : 'Bahasa Diubah',
    state.lang === 'EN' ? 'Dashboard interface set to English.' : 'Antarmuka dashboard diatur ke Bahasa Indonesia.'
  );
}

function togglePopover(id) {
  ['msgPopover', 'notifPopover'].forEach(p => {
    if (p !== id) document.getElementById(p).classList.add('hidden');
  });
  document.getElementById(id).classList.toggle('hidden');
}

function openCreateNoticeModal() {
  document.getElementById('createNoticeModal').classList.remove('hidden');
}

function closeCreateNoticeModal() {
  document.getElementById('createNoticeModal').classList.add('hidden');
}

function submitNewNotice(e) {
  e.preventDefault();
  const title = document.getElementById('noticeTitleInput').value.trim();
  const dept = document.getElementById('noticeDeptInput').value;
  const priority = document.getElementById('noticePriorityInput').value;
  const body = document.getElementById('noticeBodyInput').value.trim();

  if (!title || !body) return;

  state.notices.unshift({
    id: Date.now(),
    title,
    dept,
    priority,
    date: 'Just now',
    body
  });

  closeCreateNoticeModal();
  e.target.reset();
  switchMenu('overview', 0);
  showToast('Notice Published!', `"${title}" broadcasted to ${dept}.`);
}

function exportReport(reportName) {
  showToast('Exporting Report...', `Generating "${reportName}" for year ${state.selectedYear}.`);
}

let toastTimeout = null;
function showToast(title, desc) {
  const banner = document.getElementById('toastBanner');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = desc;
  banner.classList.remove('opacity-0', 'translate-y-4');
  banner.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    banner.classList.remove('opacity-100', 'translate-y-0');
    banner.classList.add('opacity-0', 'translate-y-4');
  }, 2900);
}

// Close popovers when clicking outside
window.addEventListener('click', (e) => {
  if (!e.target.closest('#msgPopover') && !e.target.closest('[title="Messages"]')) {
    document.getElementById('msgPopover')?.classList.add('hidden');
  }
  if (!e.target.closest('#notifPopover') && !e.target.closest('[title="Notifications"]')) {
    document.getElementById('notifPopover')?.classList.add('hidden');
  }
});

window.addEventListener('resize', updateSidebarGliderPosition);

// =========================================================================
// 7. BRANDING & BOOTSTRAP
// =========================================================================

/** Inject brand identity from HRAD_CONFIG into the static shell markup. */
function applyBranding() {
  const brand = CONFIG.brand;
  document.title = `${brand.name} — ${brand.tagline}`;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set('brandWordmarkBase', brand.wordmark[0]);
  set('brandWordmarkAccent', brand.wordmark[1]);
  set('greetingText', brand.greeting);

  const subtitle = document.getElementById('greetingSubtitle');
  if (subtitle) {
    subtitle.innerHTML = brand.subtitle.join('<br class="hidden sm:inline"/>');
  }
}

/** Populate the header year selector from HRAD_CONFIG.years. */
function populateYearSelect() {
  const select = document.getElementById('globalYearSelect');
  if (!select) return;
  select.innerHTML = years.map(y => `
    <option value="${y}" ${y === state.selectedYear ? 'selected' : ''}>Year (${y})</option>
  `).join('');
}

/** Populate the header animation switcher from HRAD_CONFIG.animations. */
function populateAnimationSelect() {
  const select = document.getElementById('animStyleSelect');
  if (!select) return;
  select.innerHTML = CONFIG.animations.map(a => `
    <option value="${a.id}" ${a.id === state.transitionClass ? 'selected' : ''}>${a.label}</option>
  `).join('');
}

// Initialize Application on Load
window.onload = function () {
  applyBranding();
  populateYearSelect();
  populateAnimationSelect();
  renderSidebar();
  renderSubMenuTabs();
  renderActiveMenuContent();
};
