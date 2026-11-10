/* ==========================================================================
   HRAD Dashboard Template — Configuration
   The single place to rebrand the template and reshape its navigation.
   Demo datasets live in data.js; rendering logic lives in app.js.
   ========================================================================== */

window.HRAD_CONFIG = {

  /**
   * Branding — shown in the browser tab, sidebar wordmark, and header.
   * `wordmark` is a two-tone split: [base color part, accent color part].
   */
  brand: {
    name: 'hrad.',
    tagline: 'Interactive HR Admin Dashboard',
    wordmark: ['hr', 'ad.'],
    greeting: 'Hello Admin!',
    subtitle: [
      'Measure How Fast You\'re Growing Monthly Recurring',
      'performance management.'
    ]
  },

  /** Year dataset keys. The demo charts assume 8 yearly columns (grid-cols-8). */
  defaultYear: '2014',
  years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'],

  /** Menu transition styles offered in the header switcher and Settings page. */
  animations: [
    { id: 'anim-slide-fade',  label: 'Slide + Blur',      title: 'Smooth Slide + Blur Fade (Default)', desc: 'Transisi halus vertikal dengan efek soft blur' },
    { id: 'anim-elastic',     label: 'Elastic Spring',    title: 'Elastic Spring Bounce',              desc: 'Efek pegas dinamis saat kartu menu muncul' },
    { id: 'anim-3d-flip',     label: '3D Flip Card',      title: '3D Perspective Card Flip',           desc: 'Rotasi perspektif 3D pada kontainer menu' },
    { id: 'anim-slide-right', label: 'Horizontal Glide',  title: 'Horizontal Glide',                   desc: 'Geser mulus secara horizontal antar halaman' }
  ],

  /**
   * Sidebar navigation. Each menu needs a unique `id`, a `title`, optional
   * `badge`, an inline SVG `icon`, and any number of `subMenus` tab labels.
   * NOTE: the screen content per menu id is rendered by a matching
   * `renderXxxScreen()` function in app.js — add one there when adding a menu.
   */
  menus: [
    {
      id: 'overview',
      title: 'Overview',
      badge: true,
      subMenus: ['Main Dashboard', 'Live Notices & Activity', 'Quarterly OKRs', 'Executive Summary'],
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 17l6-6 4 4 8-8"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 7h4v4"/></svg>`
    },
    {
      id: 'departments',
      title: 'Departments',
      badge: false,
      subMenus: ['All Departments (12)', 'Org Hierarchy & Leads', 'Budget Allocation'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/></svg>`
    },
    {
      id: 'employees',
      title: 'Employees Directory',
      badge: false,
      subMenus: ['All Employees (348)', 'Onboarding Queue', 'Leave & Time-Off', 'Top Performers'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>`
    },
    {
      id: 'payroll',
      title: 'Payroll & Compensation',
      badge: false,
      subMenus: ['Monthly Ledger (3,458)', 'Salary Slips & Tax', 'Bonuses & Overtime'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>`
    },
    {
      id: 'documents',
      title: 'Holidays & Documents',
      badge: false,
      subMenus: ['Company Holidays (10)', 'HR Policy Repository', 'Employee Contracts'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>`
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      badge: false,
      subMenus: ['Executive Reports (3,488)', 'Retention & Turnover', 'Diversity & Inclusion'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>`
    },
    {
      id: 'recruitment',
      title: 'Recruitment Pipeline',
      badge: false,
      subMenus: ['Candidate Pipeline (42)', 'Active Job Openings', 'Interview Schedule'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`
    },
    {
      id: 'assets',
      title: 'IT Assets & Inventory',
      badge: false,
      subMenus: ['Hardware Register', 'Software Licenses', 'Equipment Requests'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/></svg>`
    },
    {
      id: 'attendance',
      title: 'Attendance & Shifts',
      badge: false,
      subMenus: ['Daily Time Log', 'Overtime Tracker', 'Shift Roster'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>`
    },
    {
      id: 'settings',
      title: 'Workspace Settings',
      badge: false,
      subMenus: ['Animation & UI Engine', 'Company Profile', 'Roles & Permissions'],
      icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`
    }
  ]
};
