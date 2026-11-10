/* ==========================================================================
   HRAD Dashboard Template — Demo Data
   Placeholder datasets that drive the Overview charts and directory screens.
   Replace these with your real data (or fetch from an API) — the shape of
   each object is what app.js expects, so keep the keys identical.
   ========================================================================== */

window.HRAD_DATA = {

  /**
   * Yearly aggregates used by the Overview KPI cards, salary spline chart,
   * new-employees bar chart, satisfaction gauge, and performance bars.
   * Keys must match HRAD_CONFIG.years.
   */
  yearlyData: {
    '2010': {
      kpis: [260, 94, 8, 2810, 2790],
      salary: { mkt: 1820, des: 5420, dev: 5890, oth: 4920, yDot: 66, xPct: 7 },
      newEmp: { male: 182, female: 144, growth: 19, barIndex: 1 },
      satisfaction: 68,
      perf: [58, 76, 24, 14]
    },
    '2011': {
      kpis: [284, 102, 9, 2940, 2910],
      salary: { mkt: 1950, des: 6120, dev: 6340, oth: 5300, yDot: 86, xPct: 20 },
      newEmp: { male: 196, female: 158, growth: 21, barIndex: 4 },
      satisfaction: 70,
      perf: [60, 79, 25, 15]
    },
    '2012': {
      kpis: [310, 115, 10, 3120, 3150],
      salary: { mkt: 2180, des: 6890, dev: 7010, oth: 6420, yDot: 58, xPct: 34 },
      newEmp: { male: 215, female: 170, growth: 24, barIndex: 7 },
      satisfaction: 72,
      perf: [62, 81, 26, 15]
    },
    '2013': {
      kpis: [329, 120, 10, 3290, 3310],
      salary: { mkt: 2290, des: 7210, dev: 7340, oth: 7100, yDot: 74, xPct: 48 },
      newEmp: { male: 230, female: 182, growth: 26, barIndex: 10 },
      satisfaction: 73,
      perf: [64, 82, 27, 16]
    },
    '2014': {
      kpis: [348, 128, 10, 3458, 3488],
      salary: { mkt: 2437, des: 7689, dev: 7689, oth: 7689, yDot: 36, xPct: 61.5 },
      newEmp: { male: 248, female: 194, growth: 28, barIndex: 13 },
      satisfaction: 74,
      perf: [65, 84, 28, 16]
    },
    '2015': {
      kpis: [376, 142, 12, 3690, 3720],
      salary: { mkt: 2890, des: 8120, dev: 8450, oth: 7920, yDot: 72, xPct: 75 },
      newEmp: { male: 264, female: 218, growth: 32, barIndex: 16 },
      satisfaction: 79,
      perf: [71, 88, 34, 21]
    },
    '2016': {
      kpis: [412, 156, 12, 3980, 4050],
      salary: { mkt: 3150, des: 8640, dev: 9120, oth: 8340, yDot: 62, xPct: 88 },
      newEmp: { male: 289, female: 245, growth: 35, barIndex: 19 },
      satisfaction: 83,
      perf: [76, 91, 39, 24]
    },
    '2017': {
      kpis: [458, 174, 14, 4320, 4490],
      salary: { mkt: 3540, des: 9240, dev: 9680, oth: 8890, yDot: 48, xPct: 96 },
      newEmp: { male: 312, female: 276, growth: 39, barIndex: 21 },
      satisfaction: 87,
      perf: [82, 94, 45, 29]
    }
  },

  /**
   * Employee directory rows. `avatar` is any CSS color used for the initials
   * chip; `status` is one of 'Active' | 'Remote' | 'On Leave'.
   */
  employeesList: [
    { id: 'EMP-101', name: 'Nadia Putri Pratama', role: 'Lead Product Designer', dept: 'Design Team', salary: '$8,450', status: 'Active', score: 96, avatar: '#ff7a45' },
    { id: 'EMP-102', name: 'Rizky Ramadhan', role: 'Principal Backend Eng', dept: 'Developer Team', salary: '$9,200', status: 'Active', score: 94, avatar: '#3168f8' },
    { id: 'EMP-103', name: 'Elena Rostova', role: 'VP of Growth Marketing', dept: 'Marketing Team', salary: '$8,900', status: 'Active', score: 91, avatar: '#9e68f6' },
    { id: 'EMP-104', name: 'Marcus Vance', role: 'Engineering Manager', dept: 'Management Team', salary: '$10,400', status: 'Active', score: 98, avatar: '#5cd68d' },
    { id: 'EMP-105', name: 'Ayu Lestari', role: 'Senior UI Motion Specialist', dept: 'Design Team', salary: '$7,600', status: 'Active', score: 92, avatar: '#f4b952' },
    { id: 'EMP-106', name: 'Budi Santoso', role: 'DevOps & Cloud Architect', dept: 'Developer Team', salary: '$8,850', status: 'Active', score: 89, avatar: '#45c4e9' },
    { id: 'EMP-107', name: 'Clara Wijaya', role: 'HR People Partner', dept: 'Management Team', salary: '$6,700', status: 'On Leave', score: 88, avatar: '#ff7a45' },
    { id: 'EMP-108', name: 'Dimas Anggara', role: 'Fullstack TypeScript Dev', dept: 'Developer Team', salary: '$7,400', status: 'Active', score: 90, avatar: '#3168f8' },
    { id: 'EMP-109', name: 'Farhan Hakim', role: 'Performance Ads Strategist', dept: 'Marketing Team', salary: '$6,200', status: 'Active', score: 85, avatar: '#9e68f6' },
    { id: 'EMP-110', name: 'Gita Gutawa', role: 'Design Systems Architect', dept: 'Design Team', salary: '$8,100', status: 'Active', score: 95, avatar: '#5cd68d' },
    { id: 'EMP-111', name: 'Hendra Wijaya', role: 'QA Automation Lead', dept: 'Developer Team', salary: '$6,950', status: 'Active', score: 87, avatar: '#f4b952' },
    { id: 'EMP-112', name: 'Indah Permatasari', role: 'Brand Communications Lead', dept: 'Marketing Team', salary: '$7,150', status: 'Active', score: 91, avatar: '#45c4e9' },
    { id: 'EMP-113', name: 'Joko Anwar', role: 'Creative Director', dept: 'Design Team', salary: '$9,600', status: 'Active', score: 97, avatar: '#ff7a45' },
    { id: 'EMP-114', name: 'Kevin Sanjaya', role: 'iOS Swift Engineer', dept: 'Developer Team', salary: '$7,800', status: 'Remote', score: 93, avatar: '#3168f8' },
    { id: 'EMP-115', name: 'Larasati Dewi', role: 'Financial Controller', dept: 'Management Team', salary: '$8,300', status: 'Active', score: 92, avatar: '#9e68f6' },
    { id: 'EMP-116', name: 'Maudy Ayunda', role: 'Chief Strategy Officer', dept: 'Management Team', salary: '$11,500', status: 'Active', score: 99, avatar: '#5cd68d' },
    { id: 'EMP-117', name: 'Naufal Azhar', role: 'Security Operations Eng', dept: 'Developer Team', salary: '$8,400', status: 'Active', score: 90, avatar: '#f4b952' },
    { id: 'EMP-118', name: 'Olivia Jensen', role: 'UX Research Specialist', dept: 'Design Team', salary: '$7,100', status: 'Remote', score: 89, avatar: '#45c4e9' },
    { id: 'EMP-119', name: 'Putra Mahendra', role: 'Data Scientist', dept: 'Developer Team', salary: '$8,900', status: 'Active', score: 94, avatar: '#ff7a45' },
    { id: 'EMP-120', name: 'Qory Sandioriva', role: 'Content Marketing Manager', dept: 'Marketing Team', salary: '$6,400', status: 'Active', score: 86, avatar: '#3168f8' },
    { id: 'EMP-121', name: 'Reza Rahadian', role: 'VP of Engineering', dept: 'Developer Team', salary: '$12,200', status: 'Active', score: 98, avatar: '#9e68f6' },
    { id: 'EMP-122', name: 'Sherina Munaf', role: 'Product Operations Lead', dept: 'Management Team', salary: '$8,750', status: 'Active', score: 95, avatar: '#5cd68d' },
    { id: 'EMP-123', name: 'Tulus Rusydi', role: 'Employee Experience Lead', dept: 'Management Team', salary: '$7,500', status: 'Active', score: 93, avatar: '#f4b952' },
    { id: 'EMP-124', name: 'Vanesha Prescilla', role: 'Visual Illustrator', dept: 'Design Team', salary: '$6,500', status: 'On Leave', score: 88, avatar: '#45c4e9' }
  ],

  /**
   * Initial broadcast notices shown on the Overview notice board.
   * New notices created via the "Create Notice" modal are pushed here at runtime.
   */
  notices: [
    { id: 1, title: 'Q4 Performance Appraisal Window Open', dept: 'All Teams', priority: 'Important', date: 'Today, 09:30 AM', body: 'All team leads must submit KPI evaluations before Friday 17:00.' },
    { id: 2, title: 'New Hybrid Work Allowance Policy', dept: 'Developer Team', priority: 'Announcement', date: 'Yesterday', body: 'Monthly internet and ergonomic setup reimbursement updated for 2014/2015.' },
    { id: 3, title: 'Year-End Company Townhall & Awards', dept: 'Design Team', priority: 'Holiday', date: '3 days ago', body: 'Join us in the main auditorium for annual product milestones and awards.' },
    { id: 4, title: 'Payroll Cut-Off Schedule Adjustment', dept: 'Management Team', priority: 'Important', date: '5 days ago', body: 'Overtime claims and tax declarations close on the 22nd of this month.' }
  ]
};
