/**
 * House Hub - 4 Roommates Shared Management Application
 * Roommates: Vaishali, Kaviya, Elakiya, Swathi
 */

// Constant definitions
const ROOMMATES = ['Vaishali', 'Kaviya', 'Elakiya', 'Swathi'];
const STORAGE_KEY = 'roommate_hub_data_v1';

// Financial utility: Exact split in paise/cents to prevent floating point inaccuracy
function calculateExactSplits(totalAmount, splitUsers, paidBy) {
  const totalPaise = Math.round(Number(totalAmount) * 100);
  const n = splitUsers.length;
  if (n === 0) return [];

  const baseSharePaise = Math.floor(totalPaise / n);
  const remainderPaise = totalPaise % n;

  return splitUsers.map((user, idx) => {
    // Distribute remainder pennies to first remainder users
    const sharePaise = baseSharePaise + (idx < remainderPaise ? 1 : 0);
    const shareAmount = sharePaise / 100;
    const isPayer = (user === paidBy);
    return {
      user: user,
      shareAmount: Number(shareAmount.toFixed(2)),
      paid: isPayer // payer is already paid by default
    };
  });
}

// Universal date normalizer: extracts { year, month, day, ymd, ym, y } from any format
function parseDateParts(dateInput) {
  if (!dateInput) return null;
  const str = String(dateInput).split('T')[0].trim();
  // YYYY-MM-DD or YYYY/MM/DD
  let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    return {
      year: y,
      month: mo,
      day: d,
      ymd: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      ym: `${y}-${String(mo).padStart(2, '0')}`,
      y: String(y)
    };
  }
  // DD-MM-YYYY or DD/MM/YYYY
  m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    return {
      year: y,
      month: mo,
      day: d,
      ymd: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      ym: `${y}-${String(mo).padStart(2, '0')}`,
      y: String(y)
    };
  }
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const mo = dt.getMonth() + 1;
    const d = dt.getDate();
    return {
      year: y,
      month: mo,
      day: d,
      ymd: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      ym: `${y}-${String(mo).padStart(2, '0')}`,
      y: String(y)
    };
  }
  return null;
}

// Format currency in Indian Rupee format
function formatMoney(amount) {
  const val = Number(amount || 0);
  if (isNaN(val)) return '₹0.00';
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatMoneyCompact(amount) {
  const val = Number(amount || 0);
  if (isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

// Format readable date
function formatDisplayDate(dateStr) {
  const norm = parseDateParts(dateStr);
  if (!norm) return String(dateStr || '');
  const d = new Date(norm.year, norm.month - 1, norm.day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

function formatDisplayDateWithYear(dateStr) {
  const norm = parseDateParts(dateStr);
  if (!norm) return String(dateStr || '');
  const d = new Date(norm.year, norm.month - 1, norm.day);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Category classifier
function getExpenseCategoryName(title = '', items = []) {
  const text = (String(title || '') + ' ' + (items || []).map(i => (typeof i === 'object' ? (i.name || '') : '')).join(' ')).toLowerCase();
  if (text.includes('grocery') || text.includes('vegetable') || text.includes('rice') || text.includes('dal') || text.includes('supermarket') || text.includes('curry') || text.includes('provision')) {
    return 'Groceries & Provisions';
  }
  if (text.includes('milk') || text.includes('dairy') || text.includes('curd') || text.includes('egg') || text.includes('butter') || text.includes('paneer')) {
    return 'Dairy & Daily Food';
  }
  if (text.includes('bill') || text.includes('electric') || text.includes('wifi') || text.includes('gas') || text.includes('water') || text.includes('cylinder') || text.includes('current')) {
    return 'Utilities & House Bills';
  }
  if (text.includes('food') || text.includes('dinner') || text.includes('lunch') || text.includes('swiggy') || text.includes('zomato') || text.includes('snack') || text.includes('tea') || text.includes('coffee')) {
    return 'Dining & Snacks';
  }
  if (text.includes('fuel') || text.includes('petrol') || text.includes('diesel') || text.includes('auto') || text.includes('cab') || text.includes('uber') || text.includes('ola')) {
    return 'Transport & Fuel';
  }
  if (text.includes('rent') || text.includes('house') || text.includes('maintenance') || text.includes('cleaning') || text.includes('maid') || text.includes('utensils')) {
    return 'Housing & Maintenance';
  }
  if (text.includes('shop') || text.includes('cloth') || text.includes('amazon') || text.includes('myntra') || text.includes('dress') || text.includes('flipkart')) {
    return 'Shopping';
  }
  if (text.includes('loan') || text.includes('emi') || text.includes('bike') || text.includes('car') || text.includes('service') || text.includes('repair')) {
    return 'Vehicle & EMI';
  }
  return 'Other Household';
}

// Icon detector matching screenshot UI
function getExpenseIcon(title = '', items = []) {
  const text = (title + ' ' + (items || []).map(i => i.name).join(' ')).toLowerCase();
  if (text.includes('fuel') || text.includes('petrol') || text.includes('diesel')) {
    return { icon: '⛽', bg: '#fee2e2' };
  }
  if (text.includes('grocery') || text.includes('vegetable') || text.includes('rice') || text.includes('dal') || text.includes('supermarket') || text.includes('curry')) {
    return { icon: '🥗', bg: '#dcfce7' };
  }
  if (text.includes('milk') || text.includes('dairy') || text.includes('curd') || text.includes('egg')) {
    return { icon: '🥛', bg: '#e0f2fe' };
  }
  if (text.includes('food') || text.includes('dinner') || text.includes('lunch') || text.includes('swiggy') || text.includes('zomato') || text.includes('snack') || text.includes('tea') || text.includes('coffee')) {
    return { icon: '🍽️', bg: '#ffedd5' };
  }
  if (text.includes('bill') || text.includes('electric') || text.includes('wifi') || text.includes('gas') || text.includes('water') || text.includes('cylinder')) {
    return { icon: '⚡', bg: '#fef3c7' };
  }
  if (text.includes('shop') || text.includes('cloth') || text.includes('amazon') || text.includes('myntra') || text.includes('dress')) {
    return { icon: '🛍️', bg: '#fce7f3' };
  }
  if (text.includes('rent') || text.includes('house') || text.includes('maintenance')) {
    return { icon: '🏠', bg: '#ede9fe' };
  }
  if (text.includes('invest') || text.includes('sip') || text.includes('savings') || text.includes('deposit') || text.includes('salary')) {
    return { icon: '💰', bg: '#fef08a' };
  }
  if (text.includes('loan') || text.includes('emi') || text.includes('bike') || text.includes('car') || text.includes('vehicle') || text.includes('service')) {
    return { icon: '🚗', bg: '#e0e7ff' };
  }
  return { icon: '🧾', bg: '#f1f5f9' };
}

// Date group header label (TODAY, YESTERDAY, 17 NOV, TUE)
function getDateGroupLabel(dateStr) {
  const today = getTodayDateStr();
  const todayObj = new Date();
  
  const yDate = new Date(todayObj);
  yDate.setDate(todayObj.getDate() - 1);
  const yStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;

  if (dateStr === today) return 'TODAY';
  if (dateStr === yStr) return 'YESTERDAY';

  try {
    const [year, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${d} ${monthName}, ${dayName}`;
  } catch (e) {
    return dateStr;
  }
}

function getTodayDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Initial Sample Seed Data matching user's prompt specifications
function getInitialData() {
  const today = getTodayDateStr();
  
  // Calculate yesterday and tomorrow strings
  const todayObj = new Date();
  const yDate = new Date(todayObj);
  yDate.setDate(todayObj.getDate() - 1);
  const yStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;

  const tDate = new Date(todayObj);
  tDate.setDate(todayObj.getDate() + 1);
  const tStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;

  return {
    activeUser: 'Swathi',
    expenses: [
      {
        id: 'exp-1',
        title: 'Supermarket Grocery Run',
        date: today,
        paidBy: 'Swathi',
        items: [
          { name: 'Rice (5kg bag)', amount: 800 },
          { name: 'Fresh Vegetables', amount: 250 },
          { name: 'Curry leaves & coriander', amount: 20 }
        ],
        total: 1070.00,
        splitUsers: ['Vaishali', 'Kaviya', 'Elakiya', 'Swathi'],
        splits: [
          { user: 'Vaishali', shareAmount: 267.50, paid: false },
          { user: 'Kaviya', shareAmount: 267.50, paid: true },
          { user: 'Elakiya', shareAmount: 267.50, paid: false },
          { user: 'Swathi', shareAmount: 267.50, paid: true }
        ]
      },
      {
        id: 'exp-2',
        title: 'Morning Dairy Supply',
        date: yStr,
        paidBy: 'Kaviya',
        items: [
          { name: 'Arokya Milk (2 packets)', amount: 60 }
        ],
        total: 60.00,
        splitUsers: ['Vaishali', 'Kaviya', 'Elakiya', 'Swathi'],
        splits: [
          { user: 'Vaishali', shareAmount: 15.00, paid: true },
          { user: 'Kaviya', shareAmount: 15.00, paid: true },
          { user: 'Elakiya', shareAmount: 15.00, paid: true },
          { user: 'Swathi', shareAmount: 15.00, paid: false }
        ]
      },
      {
        id: 'exp-3',
        title: 'House Cleaning & Toiletries',
        date: yStr,
        paidBy: 'Vaishali',
        items: [
          { name: 'Floor cleaner & Harpic', amount: 150 },
          { name: 'Dishwash bar & sponge', amount: 100 }
        ],
        total: 250.00,
        splitUsers: ['Vaishali', 'Kaviya', 'Elakiya', 'Swathi'],
        splits: [
          { user: 'Vaishali', shareAmount: 62.50, paid: true },
          { user: 'Kaviya', shareAmount: 62.50, paid: false },
          { user: 'Elakiya', shareAmount: 62.50, paid: false },
          { user: 'Swathi', shareAmount: 62.50, paid: false }
        ]
      }
    ],
    tasks: [
      {
        id: 'task-1',
        date: today,
        type: '🍳 Cooking',
        assignedTo: 'Swathi',
        time: 'Morning & Lunch',
        note: 'Sambar, Potato fry & Rice',
        repeat: 'daily',
        completed: false
      },
      {
        id: 'task-2',
        date: today,
        type: '🍽 Washing vessels',
        assignedTo: 'Kaviya',
        time: 'After lunch & dinner',
        note: '',
        repeat: 'daily',
        completed: true
      },
      {
        id: 'task-3',
        date: today,
        type: '🧹 Sweeping',
        assignedTo: 'Vaishali',
        time: 'Evening',
        note: 'Living room and bedrooms',
        repeat: 'none',
        completed: false
      },
      {
        id: 'task-4',
        date: today,
        type: '🗑 Taking garbage out',
        assignedTo: 'Elakiya',
        time: 'Night 9:00 PM',
        note: 'Wet and dry waste bins',
        repeat: 'daily',
        completed: false
      },
      {
        id: 'task-5',
        date: tStr,
        type: '🍳 Cooking',
        assignedTo: 'Kaviya',
        time: 'Dinner',
        note: 'Chapatis and Dal',
        repeat: 'none',
        completed: false
      },
      {
        id: 'task-6',
        date: tStr,
        type: '🚿 Bathroom cleaning',
        assignedTo: 'Elakiya',
        time: 'Morning',
        note: 'Common bathroom',
        repeat: 'weekly',
        completed: false
      }
    ],
    shopping: [
      { id: 'shop-1', name: 'Milk (1 Litre)', addedBy: 'Kaviya', date: today, purchased: false },
      { id: 'shop-2', name: 'Surf Excel Detergent', addedBy: 'Vaishali', date: today, purchased: false },
      { id: 'shop-3', name: 'Colgate Toothpaste', addedBy: 'Swathi', date: yStr, purchased: true },
      { id: 'shop-4', name: 'Bathing Soaps (Dettol/Dove)', addedBy: 'Elakiya', date: today, purchased: false },
      { id: 'shop-5', name: 'Garbage bags roll', addedBy: 'Swathi', date: today, purchased: false }
    ],
    notes: [
      {
        id: 'note-1',
        content: 'Electricity bill needs to be paid before 10th. Total is around ₹1,400.',
        category: '⚡ Bills & Utilities',
        author: 'Vaishali',
        time: 'Today, 10:15 AM'
      },
      {
        id: 'note-2',
        content: 'Gas cylinder is almost empty, please use the small burner carefully. I will book a refill today.',
        category: '📌 General',
        author: 'Swathi',
        time: 'Yesterday, 8:40 PM'
      },
      {
        id: 'note-3',
        content: "My college friend Ananya is visiting tomorrow evening for 2 hours.",
        category: '🎉 Event / Friends coming',
        author: 'Kaviya',
        time: 'Yesterday, 6:00 PM'
      }
    ]
  };
}

const TOKEN_KEY = 'house_hub_jwt_token';

// App State Management Class
class HouseHubApp {
  constructor() {
    this.data = this.loadData();
    this.currentPage = 'home';
    this.calendarView = 'day'; // 'day', 'week', 'month'
    this.selectedCalendarDate = getTodayDateStr();
    this.expenseFilter = 'all'; // 'all', 'unsettled', 'mine', 'i_owe'
    this.timePeriodFilter = 'all'; // 'all', 'daily', 'weekly', 'monthly', 'yearly'
    this.selectedExpenseMonth = getTodayDateStr().substring(0, 7); // e.g. '2026-11'
    this.notesTab = 'shopping'; // 'shopping', 'messages'
    this.activeExpenseId = null; // for detail modal
    this.dashWorkFilter = 'my'; // 'my', 'all'

    // Dashboard Time Filters state
    this.dashPeriod = 'month'; // 'all', 'day', 'month', 'year'
    this.dashDay = getTodayDateStr();
    this.dashMonth = getTodayDateStr().substring(0, 7);
    this.dashYear = String(new Date().getFullYear());

    // Dedicated Track Expenses Page state
    this.trackView = 'daily'; // 'daily', 'monthly', 'yearly'
    this.trackDate = getTodayDateStr();
    this.trackMonth = getTodayDateStr().substring(0, 7);
    this.trackYear = String(new Date().getFullYear());

    this.charts = {};

    this.init();
  }

  // LocalStorage Persistence
  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read localStorage, loading default data', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  saveData(dataToSave = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  // Toast Notification
  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ================= API BACKEND & AUTH SYNC =================
  async apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });
      if (res.status === 401) {
        this.logout();
        return null;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`API [${method} ${endpoint}] info:`, err.message);
      return null;
    }
  }

  async syncFromBackend() {
    const serverData = await this.apiRequest('/api/data');
    if (serverData && serverData.activeUser) {
      // Identity is determined strictly by the server's authenticated token
      this.data.activeUser = serverData.activeUser;
      this.data.expenses = serverData.expenses || [];
      this.data.tasks = serverData.tasks || [];
      this.data.shopping = serverData.shopping || [];
      this.data.notes = serverData.notes || [];
      this.saveData();
      this.renderAll();
      return true;
    }
    return false;
  }

  // ================= LOGIN & AUTH CONTROLS =================
  selectLoginUser(username) {
    const hiddenInput = document.getElementById('loginSelectedUser');
    if (hiddenInput) hiddenInput.value = username;

    document.querySelectorAll('.roommate-select-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-user') === username);
    });

    const promptUserEl = document.getElementById('loginPromptUserName');
    if (promptUserEl) promptUserEl.textContent = username;

    const errEl = document.getElementById('loginErrorMsg');
    if (errEl) errEl.classList.add('hidden');

    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('loginSelectedUser').value;
    const pinInput = document.getElementById('loginPinInput');
    const pin = pinInput ? pinInput.value.trim() : '';
    const errEl = document.getElementById('loginErrorMsg');

    if (errEl) errEl.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, pin: pin })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || 'Incorrect PIN. Default PIN is 1234.';
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.remove('hidden');
        } else {
          alert(msg);
        }
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
        return;
      }

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      this.data.activeUser = data.username;
      this.saveData();

      // Reveal main app and hide login screen
      const loginScreen = document.getElementById('loginScreen');
      const appEl = document.getElementById('app');
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appEl) appEl.style.display = 'flex';

      await this.syncFromBackend();
      this.navTo('home');
      this.showToast(`Good day, ${data.username}! ✨`);
    } catch (e) {
      console.error('Login error', e);
      if (errEl) {
        errEl.textContent = 'Server connection error. Please try again.';
        errEl.classList.remove('hidden');
      }
    }
  }

  // ================= FORGOT / RESET PASSWORD (OUTSIDE ON LOGIN SCREEN) =================
  openForgotPasswordModal() {
    const selectedUser = document.getElementById('loginSelectedUser')?.value || 'Vaishali';
    const selectEl = document.getElementById('resetRoommateSelect');
    if (selectEl) selectEl.value = selectedUser;

    const targetLabel = document.getElementById('resetTargetUsername');
    if (targetLabel) targetLabel.textContent = selectedUser;

    const newPinInput = document.getElementById('resetNewPinInput');
    const confirmPinInput = document.getElementById('resetConfirmPinInput');
    if (newPinInput) newPinInput.value = '';
    if (confirmPinInput) confirmPinInput.value = '';

    const errEl = document.getElementById('resetErrorMsg');
    if (errEl) errEl.classList.add('hidden');

    this.openModal('forgotPasswordModal');
  }

  onResetRoommateChange(userName) {
    const targetLabel = document.getElementById('resetTargetUsername');
    if (targetLabel) targetLabel.textContent = userName;
  }

  async quickResetToDefault() {
    const user = document.getElementById('resetRoommateSelect')?.value || document.getElementById('loginSelectedUser')?.value;
    if (!user) return;

    if (!confirm(`Reset security password for ${user} back to the default "1234"?`)) return;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, new_pin: '1234' })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Could not reset password. Please try again.');
        return;
      }

      this.closeModal('forgotPasswordModal');
      this.selectLoginUser(user);
      const pinInput = document.getElementById('loginPinInput');
      if (pinInput) {
        pinInput.value = '1234';
        pinInput.focus();
      }
      this.showToast(`Password for ${user} reset to 1234! You can now log in. ✨`);
    } catch (e) {
      console.error('Password reset error', e);
      alert('Network or server error resetting password.');
    }
  }

  async handleForgotPasswordReset(event) {
    event.preventDefault();
    const user = document.getElementById('resetRoommateSelect')?.value || 'Vaishali';
    const newPin = document.getElementById('resetNewPinInput')?.value.trim();
    const confirmPin = document.getElementById('resetConfirmPinInput')?.value.trim();
    const errEl = document.getElementById('resetErrorMsg');

    if (errEl) errEl.classList.add('hidden');

    if (!newPin || newPin.length < 4) {
      if (errEl) {
        errEl.textContent = 'Password must be at least 4 characters long.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (newPin !== confirmPin) {
      if (errEl) {
        errEl.textContent = 'Passwords do not match. Please re-enter.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, new_pin: newPin })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || 'Could not reset password.';
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.remove('hidden');
        }
        return;
      }

      this.closeModal('forgotPasswordModal');
      this.selectLoginUser(user);
      const pinInput = document.getElementById('loginPinInput');
      if (pinInput) {
        pinInput.value = newPin;
        pinInput.focus();
      }
      this.showToast(`Password updated for ${user}! Click Unlock to log in. ✨`);
    } catch (e) {
      console.error('Reset password error', e);
      if (errEl) {
        errEl.textContent = 'Server connection error. Please try again.';
        errEl.classList.remove('hidden');
      }
    }
  }

  openChangePinModal() {
    const userEl = document.getElementById('changePinUserName');
    if (userEl) userEl.textContent = this.data.activeUser || '';

    const currInput = document.getElementById('currPinInput');
    const newInput = document.getElementById('newPinInput');
    const confirmInput = document.getElementById('confirmPinInput');
    if (currInput) currInput.value = '';
    if (newInput) newInput.value = '';
    if (confirmInput) confirmInput.value = '';

    const errEl = document.getElementById('changePinErrorMsg');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }

    this.openModal('changePinModal');
    if (currInput) currInput.focus();
  }

  async handleChangePin(event) {
    event.preventDefault();
    const currInput = document.getElementById('currPinInput');
    const newInput = document.getElementById('newPinInput');
    const confirmInput = document.getElementById('confirmPinInput');
    const errEl = document.getElementById('changePinErrorMsg');

    const current_pin = currInput ? currInput.value.trim() : '';
    const new_pin = newInput ? newInput.value.trim() : '';
    const confirm_pin = confirmInput ? confirmInput.value.trim() : '';

    if (errEl) errEl.classList.add('hidden');

    if (!current_pin) {
      if (errEl) {
        errEl.textContent = 'Please enter your current password or PIN.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (!new_pin || new_pin.length < 4) {
      if (errEl) {
        errEl.textContent = 'New password/PIN must be at least 4 characters long.';
        errEl.classList.remove('hidden');
      }
      if (newInput) newInput.focus();
      return;
    }

    if (confirmInput && new_pin !== confirm_pin) {
      if (errEl) {
        errEl.textContent = 'New password and confirmation do not match.';
        errEl.classList.remove('hidden');
      }
      if (confirmInput) confirmInput.focus();
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ current_pin, new_pin })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || 'Could not update password. Please check your current password.';
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.remove('hidden');
        } else {
          alert(msg);
        }
        if (currInput) currInput.focus();
        return;
      }

      this.closeModal('changePinModal');
      this.showToast('Security password updated successfully! ✨');
    } catch (e) {
      console.error('Change password error', e);
      if (errEl) {
        errEl.textContent = 'Network or server error. Please try again.';
        errEl.classList.remove('hidden');
      }
    }
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.data.activeUser = null;

    const loginScreen = document.getElementById('loginScreen');
    const appEl = document.getElementById('app');
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      const pinInput = document.getElementById('loginPinInput');
      if (pinInput) pinInput.value = '';
      const errEl = document.getElementById('loginErrorMsg');
      if (errEl) errEl.classList.add('hidden');
    }
    if (appEl) appEl.style.display = 'none';

    this.showToast('Logged out.');
  }

  renderAll() {
    this.renderHeader();
    this.renderDashboard();
    this.renderTrackPage();
    this.renderExpensesPage();
    this.renderCalendarPage();
    this.renderNotesPage();
  }

  // Initialize App UI
  async init() {
    this.updateTodayLabels();

    const token = localStorage.getItem(TOKEN_KEY);
    const loginScreen = document.getElementById('loginScreen');
    const appEl = document.getElementById('app');

    if (token) {
      const ok = await this.syncFromBackend();
      if (ok && this.data.activeUser) {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appEl) appEl.style.display = 'flex';
        this.renderAll();
        return;
      }
    }

    // Not authenticated: Show dedicated login screen and hide main app
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appEl) appEl.style.display = 'none';
  }

  updateTodayLabels() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateFormatted = now.toLocaleDateString('en-IN', options);
    
    const dateElem = document.getElementById('dashDate');
    if (dateElem) dateElem.textContent = dateFormatted;
  }

  // ================= NAVIGATION =================
  navTo(pageName) {
    this.currentPage = pageName;
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSec = document.getElementById(`page-${pageName}`);
    if (targetSec) targetSec.classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (navBtn) navBtn.classList.add('active');

    // Trigger specific page renders
    if (pageName === 'home') this.renderDashboard();
    if (pageName === 'track') this.renderTrackPage();
    if (pageName === 'expenses') this.renderExpensesPage();
    if (pageName === 'calendar') this.renderCalendarPage();
    if (pageName === 'notes') this.renderNotesPage();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= HEADER PROFILE (NO SWITCHER) =================
  renderHeader() {
    const active = this.data.activeUser || '';
    const initial = active ? active.charAt(0) : '?';
    const avatarEl = document.getElementById('headerAvatar');
    const nameEl = document.getElementById('headerUserName');
    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = active;
  }

  // ================= MODAL CONTROLS =================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  openDataManagementModal() {
    this.openModal('dataModal');
  }

  setDashWorkFilter(filter) {
    this.dashWorkFilter = filter;
    this.renderDashboard();
  }

  // ================= UNIFIED FINANCIAL & ANALYTICAL CALCULATION ENGINE =================
  calculateAnalytics(expenses = this.data.expenses, activeUser = this.data.activeUser, period = 'all', refValue = null) {
    const todayYMD = getTodayDateStr();
    const currentYM = todayYMD.substring(0, 7);
    const currentY = todayYMD.substring(0, 4);

    let allTimeTotal = 0;
    let todayTotal = 0;
    let thisMonthTotal = 0;
    let thisYearTotal = 0;

    const filteredExpenses = [];
    const roommateStats = {
      Vaishali: { name: 'Vaishali', paid: 0, share: 0, net: 0, count: 0 },
      Kaviya: { name: 'Kaviya', paid: 0, share: 0, net: 0, count: 0 },
      Elakiya: { name: 'Elakiya', paid: 0, share: 0, net: 0, count: 0 },
      Swathi: { name: 'Swathi', paid: 0, share: 0, net: 0, count: 0 }
    };
    const categoryTotals = {};
    const debtMap = {}; // Pairwise unsettled debt: { 'debtor->payer': amount }

    // First pass: Calculate top 4 overall KPIs across entire database
    (expenses || []).forEach(exp => {
      const amt = parseFloat(exp.total) || 0;
      const norm = parseDateParts(exp.date);
      const eYMD = norm ? norm.ymd : String(exp.date || todayYMD).substring(0, 10);
      const eYM = norm ? norm.ym : eYMD.substring(0, 7);
      const eY = norm ? norm.y : eYMD.substring(0, 4);

      allTimeTotal += amt;
      if (eYMD === todayYMD) todayTotal += amt;
      if (eYM === currentYM) thisMonthTotal += amt;
      if (eY === currentY) thisYearTotal += amt;

      // Filter for requested period
      let includeInPeriod = false;
      if (period === 'day') {
        const targetDate = refValue || todayYMD;
        includeInPeriod = (eYMD === targetDate);
      } else if (period === 'month') {
        const targetMonth = refValue || currentYM;
        includeInPeriod = (eYM === targetMonth);
      } else if (period === 'year') {
        const targetYear = refValue || currentY;
        includeInPeriod = (eY === targetYear);
      } else {
        includeInPeriod = true; // 'all'
      }

      if (includeInPeriod) {
        filteredExpenses.push({
          ...exp,
          total: amt,
          normYMD: eYMD,
          normYM: eYM,
          normY: eY
        });

        // Roommate paid
        if (roommateStats[exp.paidBy]) {
          roommateStats[exp.paidBy].paid += amt;
          roommateStats[exp.paidBy].count += 1;
        }

        // Roommate fair share allocations
        if (Array.isArray(exp.splits)) {
          exp.splits.forEach(s => {
            const u = s.user;
            const sAmt = parseFloat(s.shareAmount) || 0;
            if (roommateStats[u]) {
              roommateStats[u].share += sAmt;
            }
          });
        }

        // Categories aggregation
        const cat = getExpenseCategoryName(exp.title, exp.items);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }

      // Unsettled split debts (pairwise settlements: who owes whom)
      if (Array.isArray(exp.splits)) {
        exp.splits.forEach(s => {
          if (!s.paid && s.user && s.user !== exp.paidBy) {
            const sAmt = parseFloat(s.shareAmount) || 0;
            if (sAmt > 0) {
              const pairKey = `${s.user}->${exp.paidBy}`;
              debtMap[pairKey] = (debtMap[pairKey] || 0) + sAmt;
            }
          }
        });
      }
    });

    // Finalize Roommate net balances: Net = Paid - Fair Share
    ROOMMATES.forEach(r => {
      roommateStats[r].paid = Math.round(roommateStats[r].paid * 100) / 100;
      roommateStats[r].share = Math.round(roommateStats[r].share * 100) / 100;
      roommateStats[r].net = Math.round((roommateStats[r].paid - roommateStats[r].share) * 100) / 100;
    });

    // Period total and transactions count
    const periodTotal = Math.round(filteredExpenses.reduce((sum, e) => sum + e.total, 0) * 100) / 100;

    // Highest categories list sorted descending
    const categoriesList = Object.entries(categoryTotals).map(([cat, total]) => ({
      category: cat,
      total: Math.round(total * 100) / 100,
      percentage: periodTotal > 0 ? Math.round((total / periodTotal) * 1000) / 10 : 0
    })).sort((a, b) => b.total - a.total);

    // Pending settlements list sorted descending
    const pendingSettlements = Object.entries(debtMap).map(([key, amt]) => {
      const [fromUser, toUser] = key.split('->');
      return {
        fromUser,
        toUser,
        amount: Math.round(amt * 100) / 100
      };
    }).sort((a, b) => b.amount - a.amount);

    // Build Chart Data & Table Rows matching 100%
    const chartData = this.buildTrendSeries(filteredExpenses, expenses, period, refValue);

    return {
      kpis: {
        totalExpenses: Math.round(allTimeTotal * 100) / 100,
        todayExpenses: Math.round(todayTotal * 100) / 100,
        thisMonthExpenses: Math.round(thisMonthTotal * 100) / 100,
        thisYearExpenses: Math.round(thisYearTotal * 100) / 100,
        periodTotal,
        transactionCount: filteredExpenses.length
      },
      filteredExpenses,
      roommateStats,
      categoriesList,
      pendingSettlements,
      chartData
    };
  }

  // Generate exact trend data points and matching table rows
  buildTrendSeries(filteredExpenses, allExpenses, period, refValue) {
    const todayYMD = getTodayDateStr();
    const currentYM = todayYMD.substring(0, 7);
    const currentY = todayYMD.substring(0, 4);

    const labels = [];
    const values = [];
    const tableRows = [];
    let tableTotal = 0;

    if (period === 'day') {
      // 7-day rolling window ending on target day
      const targetDateStr = refValue || todayYMD;
      const [tY, tM, tD] = targetDateStr.split('-').map(Number);
      const targetDate = new Date(tY, tM - 1, tD);

      const daySums = {};
      const dayCounts = {};

      for (let i = 6; i >= 0; i--) {
        const cur = new Date(targetDate);
        cur.setDate(targetDate.getDate() - i);
        const yStr = cur.getFullYear();
        const mStr = String(cur.getMonth() + 1).padStart(2, '0');
        const dStr = String(cur.getDate()).padStart(2, '0');
        const ymdKey = `${yStr}-${mStr}-${dStr}`;
        daySums[ymdKey] = 0;
        dayCounts[ymdKey] = 0;
      }

      (allExpenses || []).forEach(e => {
        const norm = parseDateParts(e.date);
        const ymd = norm ? norm.ymd : String(e.date || '').substring(0, 10);
        if (daySums.hasOwnProperty(ymd)) {
          daySums[ymd] += parseFloat(e.total) || 0;
          dayCounts[ymd] += 1;
        }
      });

      for (const [ymdKey, totalAmt] of Object.entries(daySums)) {
        const norm = parseDateParts(ymdKey);
        const dObj = new Date(norm.year, norm.month - 1, norm.day);
        const shortLabel = dObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        const roundedAmt = Math.round(totalAmt * 100) / 100;
        labels.push(shortLabel);
        values.push(roundedAmt);
        tableRows.push({
          key: ymdKey,
          label: `${shortLabel}${ymdKey === targetDateStr ? ' (Selected)' : ''}`,
          amount: roundedAmt,
          count: dayCounts[ymdKey] || 0,
          isTarget: (ymdKey === targetDateStr)
        });
        tableTotal += roundedAmt;
      }

    } else if (period === 'month') {
      // Group expenses by date within the selected month
      const targetMonth = refValue || currentYM;
      const [yNum, mNum] = targetMonth.split('-').map(Number);
      const daysInMonth = new Date(yNum, mNum, 0).getDate();

      const dayMap = {};
      const countMap = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dKey = `${targetMonth}-${String(d).padStart(2, '0')}`;
        dayMap[dKey] = 0;
        countMap[dKey] = 0;
      }

      filteredExpenses.forEach(e => {
        const ymd = e.normYMD || String(e.date || '').substring(0, 10);
        if (dayMap.hasOwnProperty(ymd)) {
          dayMap[ymd] += e.total;
          countMap[ymd] += 1;
        }
      });

      // Chart points for all days of the month
      for (let d = 1; d <= daysInMonth; d++) {
        const dKey = `${targetMonth}-${String(d).padStart(2, '0')}`;
        const amt = Math.round(dayMap[dKey] * 100) / 100;
        labels.push(`${d}`);
        values.push(amt);
      }

      // For the values table beside chart: List days that have recorded expenses (or all days if <= 7)
      for (let d = 1; d <= daysInMonth; d++) {
        const dKey = `${targetMonth}-${String(d).padStart(2, '0')}`;
        const amt = Math.round(dayMap[dKey] * 100) / 100;
        const cnt = countMap[dKey] || 0;
        if (amt > 0 || daysInMonth <= 7) {
          const norm = parseDateParts(dKey);
          const dObj = new Date(norm.year, norm.month - 1, norm.day);
          const formattedDate = dObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          tableRows.push({
            key: dKey,
            label: formattedDate,
            amount: amt,
            count: cnt
          });
        }
        tableTotal += amt;
      }

      if (tableRows.length === 0) {
        tableRows.push({
          key: targetMonth,
          label: 'No expenses recorded',
          amount: 0,
          count: 0
        });
      }

    } else if (period === 'year') {
      const targetYear = refValue || currentY;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthSums = new Array(12).fill(0);
      const monthCounts = new Array(12).fill(0);

      filteredExpenses.forEach(e => {
        const norm = parseDateParts(e.date);
        if (norm && norm.y === targetYear) {
          const mIdx = norm.month - 1;
          if (mIdx >= 0 && mIdx < 12) {
            monthSums[mIdx] += e.total;
            monthCounts[mIdx] += 1;
          }
        }
      });

      for (let i = 0; i < 12; i++) {
        const amt = Math.round(monthSums[i] * 100) / 100;
        const mLabel = `${monthNames[i]} ${targetYear}`;
        labels.push(monthNames[i]);
        values.push(amt);
        tableRows.push({
          key: `${targetYear}-${String(i + 1).padStart(2, '0')}`,
          label: mLabel,
          amount: amt,
          count: monthCounts[i]
        });
        tableTotal += amt;
      }

    } else {
      const allMonthsMap = {};
      const allCountsMap = {};

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ymKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        allMonthsMap[ymKey] = 0;
        allCountsMap[ymKey] = 0;
      }

      (allExpenses || []).forEach(e => {
        const norm = parseDateParts(e.date);
        const ym = norm ? norm.ym : String(e.date || '').substring(0, 7);
        allMonthsMap[ym] = (allMonthsMap[ym] || 0) + (parseFloat(e.total) || 0);
        allCountsMap[ym] = (allCountsMap[ym] || 0) + 1;
      });

      const sortedMonths = Object.keys(allMonthsMap).sort();
      sortedMonths.forEach(ymKey => {
        const [y, m] = ymKey.split('-').map(Number);
        const dObj = new Date(y, m - 1, 1);
        const mLabel = dObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        const amt = Math.round(allMonthsMap[ymKey] * 100) / 100;
        labels.push(mLabel);
        values.push(amt);
        tableRows.push({
          key: ymKey,
          label: mLabel,
          amount: amt,
          count: allCountsMap[ymKey] || 0
        });
        tableTotal += amt;
      });
    }

    return {
      labels,
      values,
      tableRows,
      tableTotal: Math.round(tableTotal * 100) / 100
    };
  }

  // ================= INTERACTIVE LINE CHART RENDERER (CHART.JS + SVG FALLBACK) =================
  renderLineChart(canvasId, labels, dataPoints, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.charts[canvasId]) {
      try {
        this.charts[canvasId].destroy();
      } catch (err) {
        console.warn('Error clearing existing chart:', err);
      }
      delete this.charts[canvasId];
    }

    if (typeof window.Chart !== 'undefined') {
      try {
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.32)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

        this.charts[canvasId] = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: options.datasetLabel || 'Spending',
              data: dataPoints,
              borderColor: '#4f46e5',
              backgroundColor: gradient,
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#4f46e5',
              pointBorderWidth: 2,
              pointRadius: 4.5,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: '#4f46e5',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#38bdf8',
                titleFont: { size: 12, family: 'Plus Jakarta Sans', weight: '700' },
                bodyFont: { size: 13, family: 'Plus Jakarta Sans', weight: '700' },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    const val = context.parsed.y || 0;
                    return ' Spending: ' + formatMoney(val);
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: { size: 11, family: 'Plus Jakarta Sans', weight: '600' },
                  color: '#64748b',
                  maxRotation: 45
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(226, 232, 240, 0.7)'
                },
                ticks: {
                  font: { size: 11, family: 'Plus Jakarta Sans', weight: '600' },
                  color: '#64748b',
                  callback: function(value) {
                    return '₹' + Number(value).toLocaleString('en-IN');
                  }
                }
              }
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Chart.js render exception, falling back to SVG:', e);
      }
    }

    this.renderFallbackSvgChart(canvasId, labels, dataPoints);
  }

  renderFallbackSvgChart(canvasId, labels, dataPoints) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let svgEl = parent.querySelector('.fallback-svg-chart');
    if (!svgEl) {
      svgEl = document.createElement('div');
      svgEl.className = 'fallback-svg-chart';
      parent.appendChild(svgEl);
    }

    canvas.style.display = 'none';
    svgEl.style.display = 'block';

    const w = 480;
    const h = 200;
    const padL = 50;
    const padR = 20;
    const padT = 20;
    const padB = 40;

    const maxVal = Math.max(...dataPoints, 100);
    const n = Math.max(labels.length, 1);
    const xStep = (w - padL - padR) / (n > 1 ? n - 1 : 1);

    const points = dataPoints.map((v, i) => {
      const x = padL + i * xStep;
      const y = h - padB - (v / maxVal) * (h - padT - padB);
      return { x, y, v, lbl: labels[i] };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h - padB} L ${points[0].x.toFixed(1)} ${h - padB} Z`;

    const dotsHTML = points.map(p => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#ffffff" stroke="#4f46e5" stroke-width="2.5">
        <title>${p.lbl}: ${formatMoney(p.v)}</title>
      </circle>
    `).join('');

    const xLabelsHTML = points.filter((_, i) => (n <= 10 || i % Math.ceil(n / 8) === 0 || i === n - 1)).map(p => `
      <text x="${p.x.toFixed(1)}" y="${h - 15}" font-size="10" font-family="Plus Jakarta Sans" fill="#64748b" text-anchor="middle">${p.lbl}</text>
    `).join('');

    svgEl.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
        <defs>
          <linearGradient id="svgGrad_${canvasId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="#cbd5e1" stroke-width="1"/>
        <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3,3"/>
        <path d="${areaD}" fill="url(#svgGrad_${canvasId})"/>
        <path d="${pathD}" fill="none" stroke="#4f46e5" stroke-width="2.5"/>
        ${dotsHTML}
        ${xLabelsHTML}
        <text x="${padL - 6}" y="${padT + 8}" font-size="9" font-family="Plus Jakarta Sans" fill="#94a3b8" text-anchor="end">₹${Math.round(maxVal)}</text>
        <text x="${padL - 6}" y="${h - padB}" font-size="9" font-family="Plus Jakarta Sans" fill="#94a3b8" text-anchor="end">₹0</text>
      </svg>
    `;
  }

  // ================= 1. HOME DASHBOARD RENDERING =================
  renderDashboard() {
    const user = this.data.activeUser;
    const today = getTodayDateStr();

    // 1. User Greeting & Personal Settlement Banner
    const greetingEl = document.getElementById('dashGreeting');
    if (greetingEl) greetingEl.textContent = `Good day, ${user}! ✨`;

    const balances = this.calculateBalances(user);
    const netBalance = balances.othersOweMe - balances.iNeedToPay;
    const netBalEl = document.getElementById('dashNetBalance');
    const netSubEl = document.getElementById('dashNetBalanceSub');

    if (netBalEl) {
      if (netBalance > 0) {
        netBalEl.textContent = `+${formatMoney(netBalance)}`;
        netBalEl.style.color = '#10b981';
        if (netSubEl) netSubEl.textContent = '(Others owe you net)';
      } else if (netBalance < 0) {
        netBalEl.textContent = `-${formatMoney(Math.abs(netBalance))}`;
        netBalEl.style.color = '#ef4444';
        if (netSubEl) netSubEl.textContent = '(You owe the house net)';
      } else {
        netBalEl.textContent = '₹0.00';
        netBalEl.style.color = '#3b82f6';
        if (netSubEl) netSubEl.textContent = '(All settled up)';
      }
    }

    const oweEl = document.getElementById('dashOweAmount');
    const recEl = document.getElementById('dashReceiveAmount');
    if (oweEl) oweEl.textContent = formatMoney(balances.iNeedToPay);
    if (recEl) recEl.textContent = formatMoney(balances.othersOweMe);

    // 2. Compute Analytics for active Dashboard Period
    const period = this.dashPeriod || 'month';
    let refVal = null;
    if (period === 'day') refVal = this.dashDay;
    else if (period === 'month') refVal = this.dashMonth;
    else if (period === 'year') refVal = this.dashYear;

    const analytics = this.calculateAnalytics(this.data.expenses, user, period, refVal);

    // 3. Populate 4 Top KPI Cards (Dynamic From Database)
    const kpiTotalEl = document.getElementById('kpiTotalExpenses');
    const kpiTodayEl = document.getElementById('kpiTodayExpenses');
    const kpiMonthEl = document.getElementById('kpiMonthExpenses');
    const kpiYearEl = document.getElementById('kpiYearExpenses');

    if (kpiTotalEl) kpiTotalEl.textContent = formatMoney(analytics.kpis.totalExpenses);
    if (kpiTodayEl) kpiTodayEl.textContent = formatMoney(analytics.kpis.todayExpenses);
    if (kpiMonthEl) kpiMonthEl.textContent = formatMoney(analytics.kpis.thisMonthExpenses);
    if (kpiYearEl) kpiYearEl.textContent = formatMoney(analytics.kpis.thisYearExpenses);

    const curMonthObj = new Date();
    const curMonthName = curMonthObj.toLocaleDateString('en-IN', { month: 'short' });
    const curYearName = curMonthObj.getFullYear();
    const monthBadge = document.getElementById('kpiMonthBadge');
    if (monthBadge) monthBadge.textContent = `${curMonthName}`;
    const yearBadge = document.getElementById('kpiYearBadge');
    if (yearBadge) yearBadge.textContent = `${curYearName}`;

    // 4. Update Filter Pills & Filter Input Pickers
    document.querySelectorAll('.dash-period-filter-pills .period-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-dash-period') === period);
    });

    const dayGroup = document.getElementById('groupDashDayPicker');
    const monthGroup = document.getElementById('groupDashMonthPicker');
    const yearGroup = document.getElementById('groupDashYearPicker');

    if (dayGroup) dayGroup.style.display = (period === 'day') ? 'flex' : 'none';
    if (monthGroup) monthGroup.style.display = (period === 'month') ? 'flex' : 'none';
    if (yearGroup) yearGroup.style.display = (period === 'year') ? 'flex' : 'none';

    const dayInput = document.getElementById('dashDayInput');
    if (dayInput) dayInput.value = this.dashDay;

    const monthInput = document.getElementById('dashMonthInput');
    if (monthInput) monthInput.value = this.dashMonth;

    const yearSelect = document.getElementById('dashYearSelect');
    if (yearSelect) {
      const availYears = this.getAvailableExpenseYears();
      yearSelect.innerHTML = availYears.map(y => `<option value="${y}" ${y === this.dashYear ? 'selected' : ''}>${y}</option>`).join('');
    }

    // 5. Update Overview Subtitle & Period Summary Badges
    const overviewSub = document.getElementById('dashOverviewSub');
    if (overviewSub) {
      if (period === 'day') overviewSub.textContent = `Daily View • ${formatDisplayDate(this.dashDay)}`;
      else if (period === 'month') overviewSub.textContent = `Monthly View • ${this.formatMonthLabel(this.dashMonth)}`;
      else if (period === 'year') overviewSub.textContent = `Yearly View • Year ${this.dashYear}`;
      else overviewSub.textContent = `All-Time Overview • Entire expense history`;
    }

    const filterTotalVal = document.getElementById('dashFilterTotalVal');
    const filterTransCount = document.getElementById('dashFilterTransCount');
    if (filterTotalVal) filterTotalVal.textContent = formatMoney(analytics.kpis.periodTotal);
    if (filterTransCount) filterTransCount.textContent = `${analytics.kpis.transactionCount}`;

    // 6. Render Spending Overview Line Chart
    const chartLabel = document.getElementById('dashChartLabel');
    if (chartLabel) {
      if (period === 'day') chartLabel.textContent = `7-Day Daily Trend (${formatDisplayDate(this.dashDay)})`;
      else if (period === 'month') chartLabel.textContent = `Daily Spending in ${this.formatMonthLabel(this.dashMonth)}`;
      else if (period === 'year') chartLabel.textContent = `Monthly Spending in ${this.dashYear}`;
      else chartLabel.textContent = `All-Time Spending History`;
    }

    this.renderLineChart('dashSpendingChart', analytics.chartData.labels, analytics.chartData.values, {
      datasetLabel: 'Expense (₹)'
    });

    // 7. Render Companion Values Table (Beside Chart) - 100% Matching!
    const tableBody = document.getElementById('dashValuesTableBody');
    const tableTotal = document.getElementById('dashValuesTableTotal');
    const tableCountBadge = document.getElementById('dashValuesCountBadge');
    const tableColDate = document.getElementById('dashTableColDate');

    if (tableColDate) {
      tableColDate.textContent = (period === 'year' || period === 'all') ? 'Month' : 'Date';
    }

    if (tableCountBadge) {
      tableCountBadge.textContent = `${analytics.chartData.tableRows.length} ${analytics.chartData.tableRows.length === 1 ? 'entry' : 'entries'}`;
    }

    if (tableBody) {
      if (analytics.chartData.tableRows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#94a3b8; padding:18px;">No expenses recorded</td></tr>`;
      } else {
        tableBody.innerHTML = analytics.chartData.tableRows.map(r => `
          <tr class="${r.isTarget ? 'is-target-row' : ''}">
            <td style="font-weight:600;">${r.label}</td>
            <td style="text-align:right; font-weight:700; color:var(--text-main);">${formatMoney(r.amount)}</td>
          </tr>
        `).join('');
      }
    }

    if (tableTotal) {
      tableTotal.textContent = formatMoney(analytics.chartData.tableTotal);
    }

    // 8. Roommate Spending Summary Cards
    const rmGrid = document.getElementById('dashRoommateCardsGrid');
    if (rmGrid) {
      rmGrid.innerHTML = ROOMMATES.map(r => {
        const stats = analytics.roommateStats[r] || { paid: 0, share: 0, net: 0 };
        const isMe = (r === user);
        let netColorClass = 'settled';
        let netSign = '';
        if (stats.net > 0) {
          netColorClass = 'ahead';
          netSign = '+';
        } else if (stats.net < 0) {
          netColorClass = 'owes';
          netSign = '-';
        }

        return `
          <div class="roommate-summary-card ${r.toLowerCase()} ${isMe ? 'is-active-user' : ''}">
            <div class="rm-card-header">
              <div class="rm-avatar ${r}">${r.charAt(0)}</div>
              <div class="rm-meta">
                <strong>${r}${isMe ? ' (You)' : ''}</strong>
                <span class="rm-tag">${stats.count || 0} bills paid</span>
              </div>
            </div>
            <div class="rm-stat-lines">
              <div class="rm-stat-line">
                <span>Total Paid:</span>
                <strong style="color:#0f172a;">${formatMoney(stats.paid)}</strong>
              </div>
              <div class="rm-stat-line">
                <span>Fair Share:</span>
                <strong style="color:#64748b;">${formatMoney(stats.share)}</strong>
              </div>
              <div class="rm-stat-line net-line ${netColorClass}">
                <span>Net Balance:</span>
                <strong>${netSign}${formatMoney(Math.abs(stats.net))}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 9. Highest Spending Categories
    const catListEl = document.getElementById('dashCategoriesList');
    if (catListEl) {
      if (analytics.categoriesList.length === 0) {
        catListEl.innerHTML = `<p class="empty-hint">No expenses recorded for this period.</p>`;
      } else {
        catListEl.innerHTML = analytics.categoriesList.slice(0, 5).map(c => `
          <div class="category-row">
            <div class="cat-label-row">
              <span class="cat-name">${c.category}</span>
              <span class="cat-amt"><strong>${formatMoney(c.total)}</strong> <small>(${c.percentage}%)</small></span>
            </div>
            <div class="cat-progress-track">
              <div class="cat-progress-fill" style="width: ${Math.min(c.percentage, 100)}%;"></div>
            </div>
          </div>
        `).join('');
      }
    }

    // 10. Pending Settlements
    const settlementsEl = document.getElementById('dashSettlementsCard');
    const settlementsBadge = document.getElementById('dashSettlementsBadge');
    if (settlementsEl) {
      if (analytics.pendingSettlements.length === 0) {
        settlementsEl.innerHTML = `<div class="settled-notice">🎉 All roommate shares are fully settled! No pending dues.</div>`;
        if (settlementsBadge) settlementsBadge.textContent = 'All Settled';
      } else {
        if (settlementsBadge) settlementsBadge.textContent = `${analytics.pendingSettlements.length} pending`;
        settlementsEl.innerHTML = analytics.pendingSettlements.map(s => `
          <div class="settlement-row">
            <div class="settlement-info">
              <span class="settle-from"><strong>${s.fromUser}</strong></span>
              <span class="settle-arrow">owes →</span>
              <span class="settle-to"><strong>${s.toUser}</strong></span>
            </div>
            <strong class="settle-amt">${formatMoney(s.amount)}</strong>
          </div>
        `).join('');
      }
    }

    // 11. Recent Expenses
    const recentEl = document.getElementById('dashRecentExpensesList');
    const recentBadge = document.getElementById('dashRecentBadge');
    const recentExpenses = (this.data.expenses || []).slice(0, 5);

    if (recentBadge) recentBadge.textContent = `${this.data.expenses ? this.data.expenses.length : 0}`;
    if (recentEl) {
      if (recentExpenses.length === 0) {
        recentEl.innerHTML = `<div class="empty-state"><p>No expenses added yet.</p></div>`;
      } else {
        recentEl.innerHTML = recentExpenses.map(exp => {
          const iconInfo = getExpenseIcon(exp.title, exp.items);
          const isPayer = (exp.paidBy === user);
          const mySplit = (exp.splits || []).find(s => s.user === user);
          const statusText = isPayer ? 'You paid' : (mySplit?.paid ? '✓ Settled' : 'Pending');
          const statusColor = (isPayer || mySplit?.paid) ? '#059669' : '#dc2626';

          return `
            <div class="card recent-exp-card" style="cursor:pointer;" onclick="app.openExpenseDetail('${exp.id}')">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:22px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:${iconInfo.bg};">${iconInfo.icon}</span>
                  <div>
                    <strong style="font-size:14px; color:#0f172a;">${exp.title}</strong>
                    <div style="font-size:12px; color:#64748b;">${formatDisplayDate(exp.date)} • Paid by ${exp.paidBy}</div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <strong style="font-size:15px; color:#0f172a;">${formatMoney(exp.total)}</strong>
                  <div style="font-size:11px; font-weight:700; color:${statusColor};">${statusText}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 12. Household Work & Shopping Previews
    const isMyOnly = (this.dashWorkFilter !== 'all');
    const filteredTasks = isMyOnly
      ? (this.data.tasks || []).filter(t => t.date === today && t.assignedTo === user)
      : (this.data.tasks || []).filter(t => t.date === today);

    const countEl = document.getElementById('todayWorkCount');
    if (countEl) countEl.textContent = filteredTasks.length;

    const headingEl = document.getElementById('workSectionHeading');
    if (headingEl) headingEl.textContent = isMyOnly ? "My Tasks Today" : "All House Tasks Today";

    const btnMy = document.getElementById('btnFilterMyTasks');
    const btnAll = document.getElementById('btnFilterAllTasks');
    if (btnMy) btnMy.classList.toggle('active', isMyOnly);
    if (btnAll) btnAll.classList.toggle('active', !isMyOnly);

    const workListEl = document.getElementById('dashWorkList');
    if (workListEl) {
      if (filteredTasks.length === 0) {
        workListEl.innerHTML = `<div class="empty-state"><span class="empty-icon">☕</span><p>No household tasks scheduled for today.</p></div>`;
      } else {
        workListEl.innerHTML = filteredTasks.map(t => this.renderWorkItemHTML(t)).join('');
      }
    }

    const unpurchasedShop = (this.data.shopping || []).filter(s => !s.purchased);
    const shopBadge = document.getElementById('dashPendingShopCount');
    if (shopBadge) shopBadge.textContent = unpurchasedShop.length;

    const shopPrevEl = document.getElementById('dashShoppingPreview');
    if (shopPrevEl) {
      if (unpurchasedShop.length === 0) {
        shopPrevEl.innerHTML = `<p style="font-size:13px; color:var(--text-muted); text-align:center;">All shopping items are purchased! 🛒</p>`;
      } else {
        shopPrevEl.innerHTML = unpurchasedShop.slice(0, 3).map(item => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-light);">
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" style="width:18px;height:18px;accent-color:var(--primary);" onchange="app.toggleShoppingPurchased('${item.id}')">
              <span style="font-size:13px; font-weight:600;">${item.name}</span>
            </div>
            <span style="font-size:11px; color:var(--text-muted);">${item.addedBy}</span>
          </div>
        `).join('');
      }
    }

    const notesPrevEl = document.getElementById('dashNotesPreview');
    if (notesPrevEl) {
      if (!this.data.notes || this.data.notes.length === 0) {
        notesPrevEl.innerHTML = `<p style="font-size:13px; color:var(--text-muted); text-align:center;">No shared notes posted.</p>`;
      } else {
        const topNote = this.data.notes[0];
        notesPrevEl.innerHTML = `
          <div style="font-size:11px; font-weight:700; color:var(--primary); margin-bottom:4px;">${topNote.category}</div>
          <p style="font-size:13px; margin-bottom:8px;">${topNote.content}</p>
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>By <strong>${topNote.author}</strong></span>
            <span>${topNote.time}</span>
          </div>
        `;
      }
    }
  }

  // ================= 2. TRACK EXPENSES (DEDICATED PAGE) =================
  renderTrackPage() {
    const user = this.data.activeUser;
    const view = this.trackView || 'daily';

    // 1. Tab Bar Active States
    const tabDaily = document.getElementById('tabTrackDaily');
    const tabMonthly = document.getElementById('tabTrackMonthly');
    const tabYearly = document.getElementById('tabTrackYearly');
    if (tabDaily) tabDaily.classList.toggle('active', view === 'daily');
    if (tabMonthly) tabMonthly.classList.toggle('active', view === 'monthly');
    if (tabYearly) tabYearly.classList.toggle('active', view === 'yearly');

    // 2. Show/Hide Picker Controls
    const ctrlDaily = document.getElementById('trackControlsDaily');
    const ctrlMonthly = document.getElementById('trackControlsMonthly');
    const ctrlYearly = document.getElementById('trackControlsYearly');
    if (ctrlDaily) ctrlDaily.style.display = (view === 'daily') ? 'block' : 'none';
    if (ctrlMonthly) ctrlMonthly.style.display = (view === 'monthly') ? 'block' : 'none';
    if (ctrlYearly) ctrlYearly.style.display = (view === 'yearly') ? 'block' : 'none';

    const dateInput = document.getElementById('trackDateInput');
    if (dateInput) dateInput.value = this.trackDate;

    const monthInput = document.getElementById('trackMonthInput');
    if (monthInput) monthInput.value = this.trackMonth;

    const yearSelect = document.getElementById('trackYearSelect');
    if (yearSelect) {
      const availYears = this.getAvailableExpenseYears();
      yearSelect.innerHTML = availYears.map(y => `<option value="${y}" ${y === this.trackYear ? 'selected' : ''}>${y}</option>`).join('');
    }

    // 3. Compute Analytics for active Track View
    let periodType = 'day';
    let refTarget = this.trackDate;
    if (view === 'monthly') {
      periodType = 'month';
      refTarget = this.trackMonth;
    } else if (view === 'yearly') {
      periodType = 'year';
      refTarget = this.trackYear;
    }

    const analytics = this.calculateAnalytics(this.data.expenses, user, periodType, refTarget);

    // 4. Update Summary KPI Cards
    const totalValEl = document.getElementById('trackSumTotalVal');
    const countValEl = document.getElementById('trackSumCountVal');
    const avgValEl = document.getElementById('trackSumAvgVal');
    const periodLabelEl = document.getElementById('trackSumPeriodLabel');
    const periodSubEl = document.getElementById('trackSumPeriodSub');

    if (totalValEl) totalValEl.textContent = formatMoney(analytics.kpis.periodTotal);
    if (countValEl) countValEl.textContent = `${analytics.kpis.transactionCount}`;
    if (avgValEl) {
      const avg = analytics.kpis.transactionCount > 0 ? (analytics.kpis.periodTotal / analytics.kpis.transactionCount) : 0;
      avgValEl.textContent = formatMoney(avg);
    }

    if (periodLabelEl) {
      if (view === 'daily') periodLabelEl.textContent = 'Daily Total';
      else if (view === 'monthly') periodLabelEl.textContent = 'Monthly Total';
      else periodLabelEl.textContent = 'Yearly Total';
    }

    if (periodSubEl) {
      if (view === 'daily') periodSubEl.textContent = formatDisplayDateWithYear(this.trackDate);
      else if (view === 'monthly') periodSubEl.textContent = this.formatMonthLabel(this.trackMonth);
      else periodSubEl.textContent = `Year ${this.trackYear}`;
    }

    // 5. Update Chart Headers
    const chartTitle = document.getElementById('trackChartTitle');
    const chartSub = document.getElementById('trackChartSub');
    const chartBadge = document.getElementById('trackChartTotalBadge');
    if (chartTitle) {
      if (view === 'daily') chartTitle.textContent = `Daily Spending Trajectory`;
      else if (view === 'monthly') chartTitle.textContent = `Daily Breakdown for ${this.formatMonthLabel(this.trackMonth)}`;
      else chartTitle.textContent = `Monthly Breakdown for ${this.trackYear}`;
    }
    if (chartSub) {
      if (view === 'daily') chartSub.textContent = `Expenses surrounding ${formatDisplayDateWithYear(this.trackDate)}`;
      else if (view === 'monthly') chartSub.textContent = `Every day in ${this.formatMonthLabel(this.trackMonth)}`;
      else chartSub.textContent = `12 months of ${this.trackYear}`;
    }
    if (chartBadge) chartBadge.textContent = `${formatMoney(analytics.kpis.periodTotal)} Total`;

    // 6. Render Track Line Chart
    this.renderLineChart('trackSpendingChart', analytics.chartData.labels, analytics.chartData.values, {
      datasetLabel: 'Amount (₹)'
    });

    // 7. Render Companion Values Table
    const tableBody = document.getElementById('trackValuesTableBody');
    const tableTotal = document.getElementById('trackValuesTableTotal');
    const tableBadge = document.getElementById('trackTableBadge');
    const tableCol = document.getElementById('trackTableColHeader');

    if (tableCol) {
      tableCol.textContent = (view === 'yearly') ? 'Month' : 'Date';
    }
    if (tableBadge) {
      tableBadge.textContent = `${analytics.chartData.tableRows.length} ${analytics.chartData.tableRows.length === 1 ? 'row' : 'rows'}`;
    }

    if (tableBody) {
      if (analytics.chartData.tableRows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#94a3b8; padding:18px;">No expenses found</td></tr>`;
      } else {
        tableBody.innerHTML = analytics.chartData.tableRows.map(r => `
          <tr class="${r.isTarget ? 'is-target-row' : ''}">
            <td style="font-weight:600;">${r.label}</td>
            <td style="text-align:right; font-weight:700; color:var(--text-main);">${formatMoney(r.amount)}</td>
          </tr>
        `).join('');
      }
    }

    if (tableTotal) {
      tableTotal.textContent = formatMoney(analytics.chartData.tableTotal);
    }

    // 8. Render Itemized Expenses List for this period
    const expListEl = document.getElementById('trackExpensesList');
    const expBadge = document.getElementById('trackExpensesCountBadge');
    const expTitle = document.getElementById('trackExpensesListTitle');

    if (expTitle) {
      if (view === 'daily') expTitle.textContent = `Expenses on ${formatDisplayDateWithYear(this.trackDate)}`;
      else if (view === 'monthly') expTitle.textContent = `Expenses in ${this.formatMonthLabel(this.trackMonth)}`;
      else expTitle.textContent = `Expenses in Year ${this.trackYear}`;
    }

    if (expBadge) {
      expBadge.textContent = `${analytics.filteredExpenses.length} ${analytics.filteredExpenses.length === 1 ? 'item' : 'items'}`;
    }

    if (expListEl) {
      if (analytics.filteredExpenses.length === 0) {
        expListEl.innerHTML = `
          <div class="empty-state" style="padding:28px 16px;">
            <span class="empty-icon">🧾</span>
            <p>No transactions recorded for this period.</p>
          </div>
        `;
      } else {
        expListEl.innerHTML = analytics.filteredExpenses.map(exp => {
          const iconInfo = getExpenseIcon(exp.title, exp.items);
          const isPayer = (exp.paidBy === user);
          const mySplit = (exp.splits || []).find(s => s.user === user);
          const statusText = isPayer ? 'You paid' : (mySplit?.paid ? '✓ Settled' : 'Pending');
          const statusColor = (isPayer || mySplit?.paid) ? '#059669' : '#dc2626';

          return `
            <div class="card recent-exp-card" style="cursor:pointer; margin-bottom:8px;" onclick="app.openExpenseDetail('${exp.id}')">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:22px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:${iconInfo.bg};">${iconInfo.icon}</span>
                  <div>
                    <strong style="font-size:14px; color:#0f172a;">${exp.title}</strong>
                    <div style="font-size:12px; color:#64748b;">${formatDisplayDate(exp.date)} • Paid by <strong>${exp.paidBy}</strong></div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <strong style="font-size:15px; color:#0f172a;">${formatMoney(exp.total)}</strong>
                  <div style="font-size:11px; font-weight:700; color:${statusColor};">${statusText}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // ================= DASHBOARD & TRACK FILTER EVENT HANDLERS =================
  setDashPeriod(period) {
    this.dashPeriod = period;
    this.renderDashboard();
  }

  onDashDayChange(val) {
    if (val) {
      this.dashDay = val;
      this.renderDashboard();
    }
  }

  onDashMonthChange(val) {
    if (val) {
      this.dashMonth = val;
      this.renderDashboard();
    }
  }

  onDashYearChange(val) {
    if (val) {
      this.dashYear = val;
      this.renderDashboard();
    }
  }

  setDashDayToday() {
    this.dashDay = getTodayDateStr();
    const el = document.getElementById('dashDayInput');
    if (el) el.value = this.dashDay;
    this.renderDashboard();
  }

  setDashMonthCurrent() {
    this.dashMonth = getTodayDateStr().substring(0, 7);
    const el = document.getElementById('dashMonthInput');
    if (el) el.value = this.dashMonth;
    this.renderDashboard();
  }

  setDashYearCurrent() {
    this.dashYear = String(new Date().getFullYear());
    const el = document.getElementById('dashYearSelect');
    if (el) el.value = this.dashYear;
    this.renderDashboard();
  }

  setTrackView(view) {
    this.trackView = view;
    this.renderTrackPage();
  }

  onTrackDateChange(val) {
    if (val) {
      this.trackDate = val;
      this.renderTrackPage();
    }
  }

  onTrackMonthChange(val) {
    if (val) {
      this.trackMonth = val;
      this.renderTrackPage();
    }
  }

  onTrackYearChange(val) {
    if (val) {
      this.trackYear = val;
      this.renderTrackPage();
    }
  }

  shiftTrackDate(delta) {
    const [y, m, d] = this.trackDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    this.trackDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    this.renderTrackPage();
  }

  shiftTrackMonth(delta) {
    const [y, m] = this.trackMonth.split('-').map(Number);
    const dt = new Date(y, m - 1 + delta, 1);
    this.trackMonth = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    this.renderTrackPage();
  }

  shiftTrackYear(delta) {
    this.trackYear = String(parseInt(this.trackYear, 10) + delta);
    this.renderTrackPage();
  }

  resetTrackDateToday() {
    this.trackDate = getTodayDateStr();
    this.renderTrackPage();
  }

  resetTrackMonthCurrent() {
    this.trackMonth = getTodayDateStr().substring(0, 7);
    this.renderTrackPage();
  }

  resetTrackYearCurrent() {
    this.trackYear = String(new Date().getFullYear());
    this.renderTrackPage();
  }

  getAvailableExpenseYears() {
    const yearsSet = new Set();
    const curYear = String(new Date().getFullYear());
    yearsSet.add(curYear);

    (this.data.expenses || []).forEach(exp => {
      const norm = parseDateParts(exp.date);
      if (norm && norm.y) {
        yearsSet.add(norm.y);
      }
    });

    return Array.from(yearsSet).sort().reverse();
  }

  // ================= BALANCE CALCULATIONS =================
  calculateBalances(userName) {
    let moneyPaid = 0;
    let iNeedToPay = 0;
    let othersOweMe = 0;

    const breakdownOwe = {}; // Who I owe: { Vaishali: 150, Kaviya: 200 }
    const breakdownOwed = {}; // Who owes me: { Kaviya: 300, Elakiya: 450 }

    ROOMMATES.forEach(r => {
      if (r !== userName) {
        breakdownOwe[r] = 0;
        breakdownOwed[r] = 0;
      }
    });

    this.data.expenses.forEach(exp => {
      // 1. Total money I physically paid at the store
      if (exp.paidBy === userName) {
        moneyPaid += exp.total;
      }

      // Check each split
      exp.splits.forEach(split => {
        // If I am in the split, haven't paid, and someone else paid:
        if (split.user === userName && !split.paid && exp.paidBy !== userName) {
          iNeedToPay += split.shareAmount;
          breakdownOwe[exp.paidBy] = (breakdownOwe[exp.paidBy] || 0) + split.shareAmount;
        }

        // If I paid, and someone else has not paid their share to me:
        if (exp.paidBy === userName && split.user !== userName && !split.paid) {
          othersOweMe += split.shareAmount;
          breakdownOwed[split.user] = (breakdownOwed[split.user] || 0) + split.shareAmount;
        }
      });
    });

    return {
      moneyPaid: Number(moneyPaid.toFixed(2)),
      iNeedToPay: Number(iNeedToPay.toFixed(2)),
      othersOweMe: Number(othersOweMe.toFixed(2)),
      breakdownOwe,
      breakdownOwed
    };
  }

  // ================= MONTHLY EXPENSE TRACKER HELPERS =================
  onDashMonthChange(monthStr) {
    this.selectedExpenseMonth = monthStr;
    this.renderDashMonthCard();
    const expSelect = document.getElementById('expenseMonthSelect');
    if (expSelect) expSelect.value = monthStr;
  }

  onExpenseMonthChange(monthStr) {
    this.selectedExpenseMonth = monthStr;
    this.renderMonthlyTracker();
    this.renderExpensesList();
    const dashSelect = document.getElementById('dashMonthSelect');
    if (dashSelect) dashSelect.value = monthStr;
  }

  renderDashMonthCard() {
    const selectEl = document.getElementById('dashMonthSelect');
    if (!selectEl) return;

    const availableMonths = this.getAvailableExpenseMonths();
    if (!this.selectedExpenseMonth) {
      this.selectedExpenseMonth = availableMonths[0];
    }

    const optionsHTML = availableMonths.map(m => {
      const lbl = this.formatMonthLabel(m);
      return `<option value="${m}" ${m === this.selectedExpenseMonth ? 'selected' : ''}>${lbl}</option>`;
    }).join('') + `<option value="all" ${this.selectedExpenseMonth === 'all' ? 'selected' : ''}>All Time (Entire History)</option>`;

    selectEl.innerHTML = optionsHTML;

    const metrics = this.calculateMonthlyMetrics(this.selectedExpenseMonth);
    const user = this.data.activeUser;

    const weSpentEl = document.getElementById('dashTotalWeSpent');
    const iSpentEl = document.getElementById('dashTotalISpent');
    const shareEl = document.getElementById('dashMyFairShare');
    const netEl = document.getElementById('dashMonthNetBalance');
    const netSubEl = document.getElementById('dashMonthNetSub');

    if (weSpentEl) weSpentEl.textContent = formatMoney(metrics.totalHouseSpent);
    if (iSpentEl) iSpentEl.textContent = formatMoney(metrics.totalPaidByMe);
    if (shareEl) shareEl.textContent = formatMoney(metrics.myShare);

    if (netEl) {
      if (metrics.netPosition > 0) {
        netEl.textContent = `+${formatMoney(metrics.netPosition)}`;
        netEl.style.color = 'var(--success-dark)';
        if (netSubEl) netSubEl.textContent = 'You are ahead / owed';
      } else if (metrics.netPosition < 0) {
        netEl.textContent = `-${formatMoney(Math.abs(metrics.netPosition))}`;
        netEl.style.color = 'var(--danger-dark)';
        if (netSubEl) netSubEl.textContent = 'You owe the house';
      } else {
        netEl.textContent = '₹0.00';
        netEl.style.color = '#0369a1';
        if (netSubEl) netSubEl.textContent = 'Even / Settled';
      }
    }

    const activeLabelEl = document.getElementById('dashMonthActiveLabel');
    const countEl = document.getElementById('dashMonthExpenseCount');
    const roomTitleEl = document.getElementById('dashRoommateMonthTitle');

    if (activeLabelEl) {
      activeLabelEl.textContent = this.formatMonthLabel(this.selectedExpenseMonth).replace(' (Current)', '').replace(' (Entire History)', 'All Time');
    }
    if (countEl) {
      countEl.textContent = `${metrics.count} house expense${metrics.count === 1 ? '' : 's'} recorded`;
    }
    if (roomTitleEl) {
      roomTitleEl.textContent = this.formatMonthLabel(this.selectedExpenseMonth).replace(' (Current)', '').replace(' (Entire History)', 'All Time');
    }

    // Roommate progress bar & list
    const progressBarEl = document.getElementById('dashSpendProgressBar');
    const listEl = document.getElementById('dashRoommateSpendList');

    if (progressBarEl) {
      if (metrics.totalHouseSpent === 0) {
        progressBarEl.innerHTML = `<div class="spend-bar-seg" style="width:100%; background:#e2e8f0;"></div>`;
      } else {
        progressBarEl.innerHTML = ROOMMATES.map(r => {
          const amt = metrics.roommatePaid[r] || 0;
          const pct = Math.round((amt / metrics.totalHouseSpent) * 100);
          return pct > 0 ? `<div class="spend-bar-seg ${r}" style="width:${pct}%;" title="${r}: ${formatMoney(amt)} (${pct}%)"></div>` : '';
        }).join('');
      }
    }

    if (listEl) {
      listEl.innerHTML = ROOMMATES.map(r => {
        const amt = metrics.roommatePaid[r] || 0;
        const pct = metrics.totalHouseSpent > 0 ? Math.round((amt / metrics.totalHouseSpent) * 100) : 0;
        const isMe = (r === user);
        return `
          <div class="rm-spend-pill ${isMe ? 'is-me' : ''}">
            <div class="rm-spend-name">
              <span class="rm-dot ${r}"></span>
              <span>${r}${isMe ? ' (You)' : ''}</span>
            </div>
            <strong class="rm-spend-amt">${formatMoney(amt)}</strong>
            <span class="rm-spend-pct">${pct}% of total</span>
          </div>
        `;
      }).join('');
    }
  }

  getAvailableExpenseMonths() {
    const monthsSet = new Set();
    const curMonth = getTodayDateStr().substring(0, 7);
    monthsSet.add(curMonth);

    if (this.data && this.data.expenses) {
      this.data.expenses.forEach(exp => {
        if (exp.date && exp.date.length >= 7) {
          monthsSet.add(exp.date.substring(0, 7));
        }
      });
    }

    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }

  formatMonthLabel(monthStr) {
    if (!monthStr || monthStr === 'all') return 'All Time (Entire History)';
    try {
      const [year, m] = monthStr.split('-').map(Number);
      const d = new Date(year, m - 1, 1);
      const now = new Date();
      const isCurrent = (now.getFullYear() === year && (now.getMonth() + 1) === m);
      const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      return isCurrent ? `${label} (Current)` : label;
    } catch (e) {
      return monthStr;
    }
  }

  calculateMonthlyMetrics(monthStr = this.selectedExpenseMonth) {
    const user = this.data.activeUser;
    let totalHouseSpent = 0;
    let totalPaidByMe = 0;
    let myShare = 0;
    const roommatePaid = { Vaishali: 0, Kaviya: 0, Elakiya: 0, Swathi: 0 };

    const expenses = (monthStr && monthStr !== 'all')
      ? this.data.expenses.filter(e => e.date && e.date.startsWith(monthStr))
      : this.data.expenses;

    expenses.forEach(exp => {
      totalHouseSpent += exp.total;
      if (roommatePaid.hasOwnProperty(exp.paidBy)) {
        roommatePaid[exp.paidBy] += exp.total;
      } else {
        roommatePaid[exp.paidBy] = (roommatePaid[exp.paidBy] || 0) + exp.total;
      }

      if (exp.paidBy === user) {
        totalPaidByMe += exp.total;
      }

      if (exp.splits) {
        exp.splits.forEach(s => {
          if (s.user === user) {
            myShare += s.shareAmount;
          }
        });
      }
    });

    totalHouseSpent = Math.round(totalHouseSpent * 100) / 100;
    totalPaidByMe = Math.round(totalPaidByMe * 100) / 100;
    myShare = Math.round(myShare * 100) / 100;
    const netPosition = Math.round((totalPaidByMe - myShare) * 100) / 100;

    return {
      totalHouseSpent,
      totalPaidByMe,
      myShare,
      netPosition,
      roommatePaid,
      count: expenses.length
    };
  }

  renderMonthlyTracker() {
    const selectEl = document.getElementById('expenseMonthSelect');
    if (!selectEl) return;

    const availableMonths = this.getAvailableExpenseMonths();

    // If current selected month is not valid, fallback to first available
    if (!this.selectedExpenseMonth) {
      this.selectedExpenseMonth = availableMonths[0];
    }

    // Populate dropdown options
    const optionsHTML = availableMonths.map(m => {
      const lbl = this.formatMonthLabel(m);
      return `<option value="${m}" ${m === this.selectedExpenseMonth ? 'selected' : ''}>${lbl}</option>`;
    }).join('') + `<option value="all" ${this.selectedExpenseMonth === 'all' ? 'selected' : ''}>All Time (Entire History)</option>`;

    selectEl.innerHTML = optionsHTML;

    // Calculate metrics
    const metrics = this.calculateMonthlyMetrics(this.selectedExpenseMonth);
    const user = this.data.activeUser;

    const houseEl = document.getElementById('monthTotalHouse');
    const meEl = document.getElementById('monthTotalPaidByMe');
    const shareEl = document.getElementById('monthMyShare');
    const netEl = document.getElementById('monthNetPosition');
    const netSubEl = document.getElementById('monthNetPositionSub');

    if (houseEl) houseEl.textContent = formatMoney(metrics.totalHouseSpent);
    if (meEl) meEl.textContent = formatMoney(metrics.totalPaidByMe);
    if (shareEl) shareEl.textContent = formatMoney(metrics.myShare);

    if (netEl) {
      if (metrics.netPosition > 0) {
        netEl.textContent = `+${formatMoney(metrics.netPosition)}`;
        netEl.style.color = 'var(--success-dark)';
        if (netSubEl) netSubEl.textContent = 'You are ahead / owed';
      } else if (metrics.netPosition < 0) {
        netEl.textContent = `-${formatMoney(Math.abs(metrics.netPosition))}`;
        netEl.style.color = 'var(--danger-dark)';
        if (netSubEl) netSubEl.textContent = 'You owe the house';
      } else {
        netEl.textContent = '₹0.00';
        netEl.style.color = '#0369a1';
        if (netSubEl) netSubEl.textContent = 'Even / Settled';
      }
    }

    // Label heading
    const monthNameEl = document.getElementById('mbreakdownMonthName');
    const expCountEl = document.getElementById('mbreakdownExpCount');
    if (monthNameEl) {
      monthNameEl.textContent = this.formatMonthLabel(this.selectedExpenseMonth).replace(' (Current)', '').replace(' (Entire History)', 'All Time');
    }
    if (expCountEl) {
      expCountEl.textContent = `${metrics.count} expense${metrics.count === 1 ? '' : 's'}`;
    }

    // Progress bar and Roommate cards
    const progressBarEl = document.getElementById('monthSpendProgressBar');
    const listEl = document.getElementById('monthRoommateList');

    if (progressBarEl) {
      if (metrics.totalHouseSpent === 0) {
        progressBarEl.innerHTML = `<div class="spend-bar-seg" style="width:100%; background:#e2e8f0;"></div>`;
      } else {
        progressBarEl.innerHTML = ROOMMATES.map(r => {
          const amt = metrics.roommatePaid[r] || 0;
          const pct = Math.round((amt / metrics.totalHouseSpent) * 100);
          return pct > 0 ? `<div class="spend-bar-seg ${r}" style="width:${pct}%;" title="${r}: ${formatMoney(amt)} (${pct}%)"></div>` : '';
        }).join('');
      }
    }

    if (listEl) {
      listEl.innerHTML = ROOMMATES.map(r => {
        const amt = metrics.roommatePaid[r] || 0;
        const pct = metrics.totalHouseSpent > 0 ? Math.round((amt / metrics.totalHouseSpent) * 100) : 0;
        const isMe = (r === user);
        return `
          <div class="rm-spend-pill ${isMe ? 'is-me' : ''}">
            <div class="rm-spend-name">
              <span class="rm-dot ${r}"></span>
              <span>${r}${isMe ? ' (You)' : ''}</span>
            </div>
            <strong class="rm-spend-amt">${formatMoney(amt)}</strong>
            <span class="rm-spend-pct">${pct}% of total</span>
          </div>
        `;
      }).join('');
    }
  }

  // ================= EXPENSES PAGE =================
  renderExpensesPage() {
    const user = this.data.activeUser;
    const balances = this.calculateBalances(user);

    // Render Monthly Tracker
    this.renderMonthlyTracker();

    // Active user labels
    const pbalUser = document.getElementById('pbalUser');
    if (pbalUser) pbalUser.textContent = user;

    const pbalPaid = document.getElementById('pbalPaid');
    const pbalOwe = document.getElementById('pbalOwe');
    const pbalOwed = document.getElementById('pbalOwed');
    if (pbalPaid) pbalPaid.textContent = formatMoney(balances.moneyPaid);
    if (pbalOwe) pbalOwe.textContent = formatMoney(balances.iNeedToPay);
    if (pbalOwed) pbalOwed.textContent = formatMoney(balances.othersOweMe);

    // Dues breakdown box (Who I owe & Who owes me)
    const breakdownBox = document.getElementById('duesBreakdownBox');
    if (breakdownBox) {
      let html = '';

      // Things I need to pay to others
      const iOweList = Object.entries(balances.breakdownOwe).filter(([_, amt]) => amt > 0);
      if (iOweList.length > 0) {
        html += `<strong style="font-size:11px; text-transform:uppercase; color:var(--danger-dark);">I Need To Pay:</strong>`;
        html += iOweList.map(([person, amt]) => `
          <div class="due-row i-owe">
            <span>Pay <strong>${person}</strong></span>
            <strong style="color:var(--danger);">${formatMoney(amt)}</strong>
          </div>
        `).join('');
      }

      // Things others owe to me
      const owedToList = Object.entries(balances.breakdownOwed).filter(([_, amt]) => amt > 0);
      if (owedToList.length > 0) {
        html += `<strong style="font-size:11px; text-transform:uppercase; color:var(--success-dark); margin-top:4px;">Others Need To Pay Me:</strong>`;
        html += owedToList.map(([person, amt]) => `
          <div class="due-row owe-me">
            <span><strong>${person}</strong> owes you</span>
            <strong style="color:var(--success-dark);">${formatMoney(amt)}</strong>
          </div>
        `).join('');
      }

      if (iOweList.length === 0 && owedToList.length === 0) {
        html = `<div style="text-align:center; color:var(--text-muted); font-size:12px;">All balances are fully settled! 🎉</div>`;
      }

      breakdownBox.innerHTML = html;
    }

    // Filter expenses list
    this.renderExpensesList();
  }

  setTimePeriodFilter(period) {
    this.timePeriodFilter = period;
    document.querySelectorAll('.period-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-period') === period);
    });
    this.renderExpensesList();
  }

  setExpenseFilter(filterName) {
    this.expenseFilter = filterName;
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-exp-filter') === filterName);
    });
    this.renderExpensesList();
  }

  renderExpensesList() {
    const listEl = document.getElementById('expensesList');
    if (!listEl) return;
    const user = this.data.activeUser;
    const filter = this.expenseFilter;
    const period = this.timePeriodFilter || 'all';
    const monthFilter = this.selectedExpenseMonth;

    let filtered = [...this.data.expenses];
    const today = getTodayDateStr();
    const now = new Date();

    // 1. Time-Period filter (matching screenshot: All, Daily, Weekly, Monthly, Yearly)
    if (period === 'daily') {
      filtered = filtered.filter(exp => {
        const norm = parseDateParts(exp.date);
        return norm ? norm.ymd === today : String(exp.date || '').startsWith(today);
      });
    } else if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      const sY = sevenDaysAgo.getFullYear();
      const sM = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
      const sD = String(sevenDaysAgo.getDate()).padStart(2, '0');
      const sevenDaysAgoStr = `${sY}-${sM}-${sD}`;
      filtered = filtered.filter(exp => {
        const norm = parseDateParts(exp.date);
        const ymd = norm ? norm.ymd : String(exp.date || '').substring(0, 10);
        return ymd >= sevenDaysAgoStr && ymd <= today;
      });
    } else if (period === 'monthly') {
      const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const mPrefix = (monthFilter && monthFilter !== 'all') ? monthFilter : curYM;
      filtered = filtered.filter(exp => {
        const norm = parseDateParts(exp.date);
        return norm ? norm.ym === mPrefix : String(exp.date || '').startsWith(mPrefix);
      });
    } else if (period === 'yearly') {
      const yPrefix = `${now.getFullYear()}`;
      filtered = filtered.filter(exp => {
        const norm = parseDateParts(exp.date);
        return norm ? norm.y === yPrefix : String(exp.date || '').startsWith(yPrefix);
      });
    }
    // Note: If period === 'all', all transactions are shown without month restriction

    // 2. Status / User filter (All, Pending, Paid by Me, I Need To Pay)
    if (filter === 'unsettled') {
      filtered = filtered.filter(exp => exp.splits.some(s => !s.paid));
    } else if (filter === 'mine') {
      filtered = filtered.filter(exp => exp.paidBy === user);
    } else if (filter === 'i_owe') {
      filtered = filtered.filter(exp => {
        if (exp.paidBy === user) return false;
        const mySplit = exp.splits.find(s => s.user === user);
        return mySplit && !mySplit.paid;
      });
    }

    // Sort descending by date
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    // Update count badge
    const badgeEl = document.getElementById('timelineCountBadge');
    if (badgeEl) {
      badgeEl.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="padding:36px 16px;">
          <span class="empty-icon">🧾</span>
          <p>No transactions found for this view.</p>
          <button type="button" class="btn btn-secondary btn-compact" style="margin-top:8px;" onclick="app.setTimePeriodFilter('all'); app.setExpenseFilter('all'); app.onExpenseMonthChange('all');">Reset Filters</button>
        </div>
      `;
      return;
    }

    // 3. Group by Date (matching screenshot structure)
    const grouped = {};
    filtered.forEach(exp => {
      const d = exp.date || 'Other';
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(exp);
    });

    let html = '';
    for (const [dateStr, items] of Object.entries(grouped)) {
      const groupLabel = getDateGroupLabel(dateStr);
      const groupTotal = items.reduce((sum, item) => sum + item.total, 0);

      html += `
        <div class="timeline-date-group">
          <div class="timeline-date-header">
            <span class="timeline-date-label">${groupLabel}</span>
            <span class="timeline-date-total">-₹${groupTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="timeline-group-items">
      `;

      items.forEach(exp => {
        const iconInfo = getExpenseIcon(exp.title, exp.items);
        const pendingSplits = exp.splits.filter(s => !s.paid);
        const isSettled = pendingSplits.length === 0;

        const subtitle = exp.items && exp.items.length > 0
          ? exp.items.map(it => it.name).join(', ')
          : (exp.title || 'Expense');

        const isPayer = (exp.paidBy === user);
        const payerTag = isPayer ? 'You paid' : `Paid by ${exp.paidBy}`;
        const statusText = isSettled ? '✓ Settled' : `${pendingSplits.length} pending`;

        html += `
          <div class="timeline-item-row" onclick="app.openExpenseDetail('${exp.id}')">
            <div class="timeline-item-left">
              <div class="timeline-icon-circle" style="background:${iconInfo.bg};">
                ${iconInfo.icon}
              </div>
              <div class="timeline-item-details">
                <div class="timeline-item-title">${exp.title}</div>
                <div class="timeline-item-subtitle">${subtitle} • <strong style="color:#475569;">${payerTag}</strong></div>
              </div>
            </div>
            <div class="timeline-item-right">
              <div class="timeline-item-amt">-₹${exp.total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
              <div class="timeline-item-meta">${statusText}</div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    listEl.innerHTML = html;
  }

  // ================= ADD / EDIT EXPENSE FORM =================
  openAddExpenseModal(expenseToEdit = null) {
    const modalTitle = document.getElementById('expenseModalTitle');
    const expIdInput = document.getElementById('expId');
    const expDateInput = document.getElementById('expDate');
    const expPaidBy = document.getElementById('expPaidBy');
    const expTitleInput = document.getElementById('expTitle');
    const itemsContainer = document.getElementById('expenseItemsContainer');
    const checkboxesContainer = document.getElementById('expSplitCheckboxes');

    const currentUser = this.data.activeUser;

    if (expenseToEdit) {
      modalTitle.textContent = 'Edit Expense';
      expIdInput.value = expenseToEdit.id;
      expDateInput.value = expenseToEdit.date;
      if (expPaidBy) expPaidBy.value = expenseToEdit.paidBy || currentUser;
      expTitleInput.value = expenseToEdit.title;

      // Populate Items
      itemsContainer.innerHTML = '';
      if (expenseToEdit.items && expenseToEdit.items.length > 0) {
        expenseToEdit.items.forEach(it => this.addExpenseItemRow(it.name, it.amount));
      } else {
        this.addExpenseItemRow('', expenseToEdit.total);
      }

      // Populate Checkboxes
      const splitUsers = expenseToEdit.splitUsers || expenseToEdit.splits.map(s => s.user);
      checkboxesContainer.innerHTML = ROOMMATES.map(r => `
        <label class="split-check-card">
          <input type="checkbox" value="${r}" ${splitUsers.includes(r) ? 'checked' : ''} onchange="app.recalculateFormSplits()">
          <span>${r}</span>
        </label>
      `).join('');
    } else {
      modalTitle.textContent = 'Add Expense';
      expIdInput.value = '';
      expDateInput.value = getTodayDateStr();
      if (expPaidBy) expPaidBy.value = currentUser || 'Swathi';
      expTitleInput.value = '';

      // Default with 2 blank item rows
      itemsContainer.innerHTML = '';
      this.addExpenseItemRow('Rice', 800);
      this.addExpenseItemRow('Vegetables', 250);
      this.addExpenseItemRow('Curry leaves', 20);

      // Default all 4 checked
      checkboxesContainer.innerHTML = ROOMMATES.map(r => `
        <label class="split-check-card">
          <input type="checkbox" value="${r}" checked onchange="app.recalculateFormSplits()">
          <span>${r}</span>
        </label>
      `).join('');
    }

    this.recalculateFormSplits();
    this.openModal('expenseModal');
  }

  addExpenseItemRow(name = '', amount = '') {
    const container = document.getElementById('expenseItemsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="item-name-input" placeholder="Item name (e.g. Milk)" value="${name}" required>
      <div class="item-amount-wrapper">
        <span class="currency-sym">₹</span>
        <input type="number" class="item-amt-input" step="0.01" min="0" placeholder="0.00" value="${amount}" oninput="app.recalculateFormSplits()" required>
      </div>
      <button type="button" class="btn-remove-row" onclick="this.closest('.item-row').remove(); app.recalculateFormSplits();" title="Remove item">✕</button>
    `;
    container.appendChild(row);
    this.recalculateFormSplits();
  }

  recalculateFormSplits() {
    const itemRows = document.querySelectorAll('#expenseItemsContainer .item-row');
    let total = 0;

    itemRows.forEach(row => {
      const amtInput = row.querySelector('.item-amt-input');
      const val = parseFloat(amtInput?.value) || 0;
      total += val;
    });

    total = Math.round(total * 100) / 100;
    const totalDisplay = document.getElementById('expCalculatedTotal');
    if (totalDisplay) totalDisplay.textContent = formatMoney(total);

    // Get selected roommates for split
    const checkedBoxes = document.querySelectorAll('#expSplitCheckboxes input[type="checkbox"]:checked');
    const selectedPeople = Array.from(checkedBoxes).map(cb => cb.value);

    const preview = document.getElementById('expSplitPreview');
    if (selectedPeople.length === 0) {
      if (preview) preview.innerHTML = `<span style="color:var(--danger)">Please select at least 1 person to split!</span>`;
      return;
    }

    const perPerson = total > 0 ? (total / selectedPeople.length) : 0;
    const paidByEl = document.getElementById('expPaidBy');
    const paidBy = (paidByEl && paidByEl.value) ? paidByEl.value : this.data.activeUser;

    if (preview) {
      preview.innerHTML = `Split between ${selectedPeople.length} people: <strong>${formatMoney(perPerson)} each</strong> (Paid by: <strong>${paidBy}</strong>)`;
    }
  }

  handleSaveExpense(event) {
    event.preventDefault();

    const id = document.getElementById('expId').value;
    const date = document.getElementById('expDate').value;
    const paidByEl = document.getElementById('expPaidBy');
    const paidBy = (paidByEl && paidByEl.value) ? paidByEl.value : this.data.activeUser;
    const titleInput = document.getElementById('expTitle').value.trim();

    // Read items
    const itemRows = document.querySelectorAll('#expenseItemsContainer .item-row');
    const items = [];
    let total = 0;

    itemRows.forEach(row => {
      const name = row.querySelector('.item-name-input').value.trim();
      const amt = parseFloat(row.querySelector('.item-amt-input').value) || 0;
      if (name && amt > 0) {
        items.push({ name, amount: amt });
        total += amt;
      }
    });

    if (items.length === 0) {
      alert('Please enter at least one item with a valid amount!');
      return;
    }

    total = Math.round(total * 100) / 100;
    const title = titleInput || (items.length === 1 ? items[0].name : `${items[0].name} + ${items.length - 1} more`);

    // Split people
    const checkedBoxes = document.querySelectorAll('#expSplitCheckboxes input[type="checkbox"]:checked');
    const splitUsers = Array.from(checkedBoxes).map(cb => cb.value);

    if (splitUsers.length === 0) {
      alert('Please select at least one roommate to split with!');
      return;
    }

    // Exact financial split
    const splits = calculateExactSplits(total, splitUsers, paidBy);

    // If editing existing expense, preserve already paid status if user was already in previous split
    if (id) {
      const existing = this.data.expenses.find(e => e.id === id);
      if (existing) {
        splits.forEach(s => {
          const oldSplit = existing.splits.find(os => os.user === s.user);
          if (oldSplit && s.user !== paidBy) {
            s.paid = oldSplit.paid;
          }
        });
      }
    }

    const expenseRecord = {
      id: id || `exp-${Date.now()}`,
      title,
      date,
      paidBy,
      items,
      total,
      splitUsers,
      splits
    };

    if (id) {
      const idx = this.data.expenses.findIndex(e => e.id === id);
      if (idx !== -1) this.data.expenses[idx] = expenseRecord;
    } else {
      this.data.expenses.unshift(expenseRecord);
    }

    this.saveData();
    this.apiRequest('/api/expenses', 'POST', expenseRecord);
    this.closeModal('expenseModal');
    this.showToast(id ? 'Expense updated successfully!' : 'Expense added and split calculated!');

    this.renderExpensesPage();
    this.renderDashboard();

    // Immediately open detail modal of the saved expense as required by prompt!
    this.openExpenseDetail(expenseRecord.id);
  }

  // ================= VIEW EXPENSE DETAIL & PAYMENT STATUS =================
  openExpenseDetail(expenseId) {
    const expense = this.data.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    this.activeExpenseId = expenseId;

    document.getElementById('detailExpTitle').textContent = expense.title;
    document.getElementById('detailExpDate').textContent = `${formatDisplayDate(expense.date)} (${expense.date})`;
    document.getElementById('detailExpTotal').textContent = formatMoney(expense.total);
    document.getElementById('detailExpPayer').textContent = expense.paidBy;

    // Line items list
    const itemsListEl = document.getElementById('detailItemsList');
    if (itemsListEl) {
      itemsListEl.innerHTML = expense.items.map(it => `
        <div class="detail-item-row">
          <span>${it.name}</span>
          <strong>${formatMoney(it.amount)}</strong>
        </div>
      `).join('');
    }

    // Split & Payment Status
    this.renderExpenseDetailSplits(expense);

    // Setup Edit & Delete buttons: ONLY the person who paid can edit or delete!
    const isPayer = (this.data.activeUser === expense.paidBy);
    const creatorActionsEl = document.getElementById('detailCreatorActions');
    const nonCreatorNoticeEl = document.getElementById('detailNonCreatorNotice');
    const noticePayerNameEl = document.getElementById('noticePayerName');

    if (creatorActionsEl) {
      creatorActionsEl.style.display = isPayer ? 'flex' : 'none';
    }
    if (nonCreatorNoticeEl) {
      nonCreatorNoticeEl.classList.toggle('hidden', isPayer);
      if (noticePayerNameEl) noticePayerNameEl.textContent = expense.paidBy;
    }

    const btnEdit = document.getElementById('btnEditExpense');
    const btnDelete = document.getElementById('btnDeleteExpense');

    if (btnEdit) {
      btnEdit.onclick = () => {
        this.closeModal('expenseDetailModal');
        this.openAddExpenseModal(expense);
      };
    }

    if (btnDelete) {
      btnDelete.onclick = () => {
        if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
          this.data.expenses = this.data.expenses.filter(e => e.id !== expense.id);
          this.saveData();
          this.apiRequest('/api/expenses/' + expense.id, 'DELETE');
          this.closeModal('expenseDetailModal');
          this.showToast('Expense deleted.');
          this.renderExpensesPage();
          this.renderDashboard();
        }
      };
    }

    this.openModal('expenseDetailModal');
  }

  renderExpenseDetailSplits(expense) {
    const splitListEl = document.getElementById('detailSplitList');
    const badgeEl = document.getElementById('detailPendingBadge');
    if (!splitListEl) return;

    const pendingCount = expense.splits.filter(s => !s.paid).length;
    if (badgeEl) {
      badgeEl.textContent = pendingCount === 0 ? 'All Settled' : `${pendingCount} Pending`;
      badgeEl.className = pendingCount === 0 ? 'status-indicator paid' : 'status-indicator pending';
    }

    const activeUser = this.data.activeUser;
    const isPayer = (activeUser === expense.paidBy);

    splitListEl.innerHTML = expense.splits.map(split => {
      const isPersonPayer = (split.user === expense.paidBy);
      const isPaid = split.paid;
      const isMe = (split.user === activeUser);

      let actionHTML = '';
      if (isPersonPayer) {
        actionHTML = `<span class="status-indicator paid">✓ Paid Entire Bill</span>`;
      } else {
        // Strict Rule: Each roommate can ONLY mark THEIR OWN share as paid!
        const canToggle = isMe;

        if (canToggle) {
          actionHTML = `
            <button class="btn-toggle-paid" onclick="app.toggleExpensePaidStatus('${expense.id}', '${split.user}')">
              ${isPaid ? '☑ Paid (Undo)' : 'Mark as Paid'}
            </button>
          `;
        } else {
          // Other roommates only see the status badge
          actionHTML = `
            <span class="status-indicator ${isPaid ? 'paid' : 'pending'}">
              ${isPaid ? '☑ Paid' : '☐ Pending'}
            </span>
          `;
        }
      }

      return `
        <div class="split-person-card ${isMe && !isPaid ? 'highlight-due' : ''}">
          <div class="split-person-info">
            <span class="mini-avatar ${isPaid ? 'paid' : ''}">${split.user.charAt(0)}</span>
            <div>
              <div class="split-person-name">
                ${split.user} ${isPersonPayer ? '(Paid entire bill)' : ''} ${isMe ? '<span class="accent-name" style="font-size:11px;">(You)</span>' : ''}
              </div>
              <div class="split-person-share">Share: <strong>${formatMoney(split.shareAmount)}</strong></div>
            </div>
          </div>
          <div class="split-person-action">
            ${actionHTML}
          </div>
        </div>
      `;
    }).join('');
  }

  async toggleExpensePaidStatus(expenseId, userName) {
    // Security: Only allow the logged-in user to mark their own share
    if (userName !== this.data.activeUser) {
      alert("You can only mark your own share as paid.");
      return;
    }

    const expense = this.data.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    // Optimistic local update
    const split = expense.splits.find(s => s.user === userName);
    if (split) split.paid = !split.paid;
    this.saveData();

    this.renderExpenseDetailSplits(expense);
    this.renderExpensesPage();
    this.renderDashboard();

    const isPaid = split ? split.paid : false;
    this.showToast(`Your share marked as ${isPaid ? 'Paid' : 'Pending'}.`);

    // Call backend endpoint - server identifies user strictly from JWT session
    const res = await this.apiRequest('/api/expenses/' + expenseId + '/toggle-my-split', 'PATCH');
    if (res && res.splits) {
      expense.splits = res.splits;
      this.saveData();
      this.renderExpenseDetailSplits(expense);
      this.renderExpensesPage();
      this.renderDashboard();
    }
  }

  quickMarkPaid(expenseId, userName) {
    if (userName !== this.data.activeUser) return;
    this.toggleExpensePaidStatus(expenseId, userName);
  }

  // ================= 3. CALENDAR & WORK SCHEDULE =================
  renderCalendarPage() {
    this.renderCalendarNavLabel();
    this.renderWeekStrip();

    const area = document.getElementById('calendarContentArea');
    if (!area) return;

    if (this.calendarView === 'day') {
      this.renderDayView(area);
    } else if (this.calendarView === 'week') {
      this.renderWeekView(area);
    } else if (this.calendarView === 'month') {
      this.renderMonthView(area);
    }

    this.renderRoommateRoster();
  }

  setCalendarView(viewName) {
    this.calendarView = viewName;
    document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
    const tabBtn = document.getElementById(`tab${viewName.charAt(0).toUpperCase() + viewName.slice(1)}View`);
    if (tabBtn) tabBtn.classList.add('active');

    this.renderCalendarPage();
  }

  shiftCalendarDate(delta) {
    const [y, m, d] = this.selectedCalendarDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    if (this.calendarView === 'day') {
      dateObj.setDate(dateObj.getDate() + delta);
    } else if (this.calendarView === 'week') {
      dateObj.setDate(dateObj.getDate() + (delta * 7));
    } else if (this.calendarView === 'month') {
      dateObj.setMonth(dateObj.getMonth() + delta);
    }

    this.selectedCalendarDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    this.renderCalendarPage();
  }

  resetCalendarToToday() {
    this.selectedCalendarDate = getTodayDateStr();
    this.renderCalendarPage();
  }

  promptDatePick() {
    const chosen = prompt('Enter date (YYYY-MM-DD):', this.selectedCalendarDate);
    if (chosen && /^\d{4}-\d{2}-\d{2}$/.test(chosen)) {
      this.selectedCalendarDate = chosen;
      this.renderCalendarPage();
    }
  }

  renderCalendarNavLabel() {
    const lbl = document.getElementById('calDateLabel');
    if (!lbl) return;

    const [y, m, d] = this.selectedCalendarDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const today = getTodayDateStr();

    if (this.calendarView === 'month') {
      lbl.textContent = dt.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } else if (this.selectedCalendarDate === today) {
      lbl.textContent = 'Today, ' + dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } else {
      lbl.textContent = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }

  renderWeekStrip() {
    const strip = document.getElementById('weekStrip');
    if (!strip) return;

    const [y, m, d] = this.selectedCalendarDate.split('-').map(Number);
    const centerDate = new Date(y, m - 1, d);
    
    // Find Monday of this week
    const dayOfWeek = centerDate.getDay(); // 0 is Sun, 1 is Mon
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(centerDate);
    monday.setDate(centerDate.getDate() + diffToMon);

    const pills = [];
    const today = getTodayDateStr();

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      
      const isSelected = curStr === this.selectedCalendarDate;
      const isToday = curStr === today;
      const hasWork = this.data.tasks.some(t => t.date === curStr);
      const dayShort = cur.toLocaleDateString('en-IN', { weekday: 'narrow' });
      const dayNum = cur.getDate();

      pills.push(`
        <div class="day-pill ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''} ${hasWork ? 'has-work' : ''}" onclick="app.selectCalendarDate('${curStr}')">
          <span class="day-name">${dayShort}</span>
          <span class="day-num">${dayNum}</span>
          <span class="day-dot"></span>
        </div>
      `);
    }

    strip.innerHTML = pills.join('');
  }

  selectCalendarDate(dateStr) {
    this.selectedCalendarDate = dateStr;
    this.renderCalendarPage();
  }

  // --- DAY VIEW ---
  renderDayView(container) {
    const tasks = this.data.tasks.filter(t => t.date === this.selectedCalendarDate);

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="card empty-state">
          <span class="empty-icon">🧹</span>
          <p>No household work scheduled for this day.</p>
          <button class="btn btn-secondary btn-compact" style="margin-top:10px;" onclick="app.openAddWorkModal('${this.selectedCalendarDate}')">+ Schedule Work</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card" style="padding:12px;">
        <div style="font-size:13px; font-weight:700; margin-bottom:10px; color:var(--text-muted);">
          Scheduled Activities (${tasks.length})
        </div>
        ${tasks.map(t => this.renderWorkItemHTML(t)).join('')}
      </div>
    `;
  }

  // --- WEEK VIEW ---
  renderWeekView(container) {
    const [y, m, d] = this.selectedCalendarDate.split('-').map(Number);
    const centerDate = new Date(y, m - 1, d);
    const dayOfWeek = centerDate.getDay();
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(centerDate);
    monday.setDate(centerDate.getDate() + diffToMon);

    let html = '<div style="display:flex; flex-direction:column; gap:10px;">';

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      const dayTasks = this.data.tasks.filter(t => t.date === curStr);
      const dayLabel = cur.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

      html += `
        <div class="card" style="padding:12px; cursor:pointer;" onclick="app.selectCalendarDate('${curStr}')">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:${dayTasks.length > 0 ? '8px' : '0'};">
            <strong style="font-size:13px; color: ${curStr === getTodayDateStr() ? 'var(--primary)' : 'var(--text-main)'};">${dayLabel}</strong>
            <span class="badge ${dayTasks.length > 0 ? '' : 'hidden'}">${dayTasks.length} tasks</span>
          </div>
          ${dayTasks.length > 0 ? dayTasks.map(t => this.renderWorkItemHTML(t)).join('') : '<span style="font-size:11px; color:var(--text-muted);">No tasks scheduled</span>'}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  // --- MONTH VIEW ---
  renderMonthView(container) {
    const [y, m, d] = this.selectedCalendarDate.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startDayIndex = firstDay.getDay(); // 0 is Sun

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let gridHTML = '<div class="month-calendar-grid">';

    // Headers
    weekdays.forEach(wd => {
      gridHTML += `<div class="month-weekday-header">${wd}</div>`;
    });

    // Empty cells before start day
    for (let i = 0; i < startDayIndex; i++) {
      gridHTML += `<div class="month-cell other-month"></div>`;
    }

    const todayStr = getTodayDateStr();

    for (let day = 1; day <= daysInMonth; day++) {
      const curStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = this.data.tasks.filter(t => t.date === curStr);
      const isSelected = curStr === this.selectedCalendarDate;
      const isToday = curStr === todayStr;

      let dotsHTML = '';
      if (dayTasks.length > 0) {
        dotsHTML = `<div class="month-cell-work-dots">${dayTasks.slice(0, 3).map(() => '<span class="work-mini-dot"></span>').join('')}</div>`;
      }

      gridHTML += `
        <div class="month-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" onclick="app.selectCalendarDate('${curStr}')">
          <span>${day}</span>
          ${dotsHTML}
        </div>
      `;
    }

    gridHTML += '</div>';

    // Below month grid, also show tasks for the selected day!
    const dayTasks = this.data.tasks.filter(t => t.date === this.selectedCalendarDate);
    gridHTML += `
      <div style="margin-top:14px;">
        <div style="font-size:13px; font-weight:700; margin-bottom:8px;">
          Work for ${formatDisplayDate(this.selectedCalendarDate)}:
        </div>
        ${dayTasks.length > 0 ? dayTasks.map(t => this.renderWorkItemHTML(t)).join('') : '<div class="card empty-state" style="padding:16px;"><p>No tasks on this day.</p></div>'}
      </div>
    `;

    container.innerHTML = gridHTML;
  }

  // Common HTML generator for a work task
  renderWorkItemHTML(task) {
    const isMine = task.assignedTo === this.data.activeUser;
    const workName = task.type === 'CUSTOM' ? (task.customType || 'Custom Work') : task.type;

    return `
      <div class="work-item ${task.completed ? 'completed' : ''}">
        <div class="work-left">
          <button class="check-circle-btn" onclick="app.toggleTaskCompleted('${task.id}')" title="Toggle completed">✓</button>
          <div class="work-info">
            <span class="work-name">${workName}</span>
            <div class="work-meta">
              <span class="work-assignee-pill ${isMine ? 'mine' : ''}">
                ${isMine ? '★ ' : ''}${task.assignedTo}
              </span>
              ${task.time ? `<span>• ${task.time}</span>` : ''}
              ${task.note ? `<span title="${task.note}">• 💬 ${task.note}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="work-actions">
          <button class="icon-action-btn" onclick="app.openEditWorkModal('${task.id}')" title="Edit schedule">✏️</button>
          <button class="icon-action-btn" onclick="app.deleteTask('${task.id}')" title="Delete work">🗑</button>
        </div>
      </div>
    `;
  }

  toggleTaskCompleted(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    this.saveData();
    this.apiRequest('/api/tasks/' + taskId + '/toggle', 'PATCH');

    this.renderCalendarPage();
    this.renderDashboard();
    this.showToast(task.completed ? 'Work marked as completed! 👏' : 'Work moved back to pending.');
  }

  renderRoommateRoster() {
    const rosterGrid = document.getElementById('rosterGrid');
    const rosterPeriod = document.getElementById('rosterPeriod');
    if (!rosterGrid) return;

    if (rosterPeriod) rosterPeriod.textContent = formatDisplayDate(this.selectedCalendarDate);

    const counts = {};
    ROOMMATES.forEach(r => counts[r] = 0);

    // Count tasks for this selected date
    this.data.tasks.filter(t => t.date === this.selectedCalendarDate).forEach(t => {
      if (counts[t.assignedTo] !== undefined) {
        counts[t.assignedTo]++;
      }
    });

    rosterGrid.innerHTML = ROOMMATES.map(roommate => `
      <div class="roster-item ${roommate === this.data.activeUser ? 'active-user-roster' : ''}">
        <span class="mini-avatar">${roommate.charAt(0)}</span>
        <span class="roster-name">${roommate}</span>
        <span class="roster-count">${counts[roommate]} tasks</span>
      </div>
    `).join('');
  }

  // --- WORK MODAL (ADD / EDIT) ---
  openAddWorkModal(dateToPreset = null) {
    const modalTitle = document.getElementById('workModalTitle');
    const workIdInput = document.getElementById('workId');
    const workDateInput = document.getElementById('workDate');
    const workAssignedSelect = document.getElementById('workAssignedTo');
    const workTypeSelect = document.getElementById('workTypeSelect');
    const customGroup = document.getElementById('customWorkGroup');
    const customInput = document.getElementById('customWorkInput');
    const workTime = document.getElementById('workTime');
    const workNote = document.getElementById('workNote');
    const workRepeat = document.getElementById('workRepeat');

    modalTitle.textContent = 'Add Household Work';
    workIdInput.value = '';
    workDateInput.value = dateToPreset || this.selectedCalendarDate || getTodayDateStr();

    // Populate roommates dropdown
    workAssignedSelect.innerHTML = ROOMMATES.map(r => `
      <option value="${r}">${r}</option>
    `).join('');
    workAssignedSelect.value = this.data.activeUser;

    workTypeSelect.value = '🍳 Cooking';
    customGroup.classList.add('hidden');
    customInput.value = '';
    workTime.value = '';
    workNote.value = '';
    workRepeat.value = 'none';

    this.openModal('workModal');
  }

  openEditWorkModal(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modalTitle = document.getElementById('workModalTitle');
    const workIdInput = document.getElementById('workId');
    const workDateInput = document.getElementById('workDate');
    const workAssignedSelect = document.getElementById('workAssignedTo');
    const workTypeSelect = document.getElementById('workTypeSelect');
    const customGroup = document.getElementById('customWorkGroup');
    const customInput = document.getElementById('customWorkInput');
    const workTime = document.getElementById('workTime');
    const workNote = document.getElementById('workNote');
    const workRepeat = document.getElementById('workRepeat');

    modalTitle.textContent = 'Edit Household Work';
    workIdInput.value = task.id;
    workDateInput.value = task.date;

    workAssignedSelect.innerHTML = ROOMMATES.map(r => `
      <option value="${r}">${r}</option>
    `).join('');
    workAssignedSelect.value = task.assignedTo;

    if (task.type === 'CUSTOM') {
      workTypeSelect.value = 'CUSTOM';
      customGroup.classList.remove('hidden');
      customInput.value = task.customType || '';
    } else {
      workTypeSelect.value = task.type;
      customGroup.classList.add('hidden');
    }

    workTime.value = task.time || '';
    workNote.value = task.note || '';
    workRepeat.value = task.repeat || 'none';

    this.openModal('workModal');
  }

  onWorkTypeChange(val) {
    const customGroup = document.getElementById('customWorkGroup');
    if (val === 'CUSTOM') {
      customGroup.classList.remove('hidden');
      document.getElementById('customWorkInput').focus();
    } else {
      customGroup.classList.add('hidden');
    }
  }

  handleSaveWork(event) {
    event.preventDefault();

    const id = document.getElementById('workId').value;
    const date = document.getElementById('workDate').value;
    const assignedTo = document.getElementById('workAssignedTo').value;
    const typeSelect = document.getElementById('workTypeSelect').value;
    const customType = document.getElementById('customWorkInput').value.trim();
    const time = document.getElementById('workTime').value.trim();
    const note = document.getElementById('workNote').value.trim();
    const repeat = document.getElementById('workRepeat').value;

    const taskType = typeSelect === 'CUSTOM' ? (customType ? `📌 ${customType}` : '📌 Other') : typeSelect;

    const taskRecord = {
      id: id || `task-${Date.now()}`,
      date,
      type: taskType,
      customType,
      assignedTo,
      time,
      note,
      repeat,
      completed: false
    };

    if (id) {
      const idx = this.data.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        taskRecord.completed = this.data.tasks[idx].completed;
        this.data.tasks[idx] = taskRecord;
      }
    } else {
      this.data.tasks.push(taskRecord);
    }

    this.saveData();
    this.apiRequest('/api/tasks', 'POST', taskRecord);
    this.closeModal('workModal');
    this.showToast(id ? 'Work schedule updated!' : 'Household work scheduled!');

    this.selectedCalendarDate = date;
    this.renderCalendarPage();
    this.renderDashboard();
  }

  deleteTask(taskId) {
    if (confirm('Delete this scheduled work?')) {
      this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
      this.saveData();
      this.apiRequest('/api/tasks/' + taskId, 'DELETE');
      this.renderCalendarPage();
      this.renderDashboard();
      this.showToast('Work removed from schedule.');
    }
  }

  // ================= 4. NOTES & SHOPPING LIST =================
  renderNotesPage() {
    this.renderShoppingList();
    this.renderSharedNotes();
  }

  setNotesTab(tabName) {
    this.notesTab = tabName;
    document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sub-tab-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pill`);
    const panel = document.getElementById(`sub-${tabName}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  // Shopping List
  renderShoppingList() {
    const listEl = document.getElementById('shoppingList');
    const badgeEl = document.getElementById('notesShopBadge');
    const statsEl = document.getElementById('shoppingStats');
    if (!listEl) return;

    const unpurchasedCount = this.data.shopping.filter(s => !s.purchased).length;
    if (badgeEl) badgeEl.textContent = unpurchasedCount;
    if (statsEl) statsEl.textContent = `${unpurchasedCount} pending • ${this.data.shopping.length} total`;

    if (this.data.shopping.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🛒</span>
          <p>Shopping list is empty. Add grocery or house items above!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.data.shopping.map(item => `
      <div class="shop-item ${item.purchased ? 'purchased' : ''}">
        <div class="shop-left">
          <input type="checkbox" style="width:20px; height:20px; accent-color:var(--primary); cursor:pointer;" 
            ${item.purchased ? 'checked' : ''} onchange="app.toggleShoppingPurchased('${item.id}')">
          <div class="shop-text-group">
            <span class="shop-text">${item.name}</span>
            <span class="shop-meta">Added by <strong>${item.addedBy}</strong>${item.date ? ` • ${formatDisplayDate(item.date)}` : ''}</span>
          </div>
        </div>
        <button class="icon-action-btn" onclick="app.deleteShoppingItem('${item.id}')" title="Delete item">🗑</button>
      </div>
    `).join('');
  }

  handleQuickAddShopping(event) {
    event.preventDefault();
    const input = document.getElementById('quickShopInput');
    const text = input.value.trim();
    if (!text) return;

    const newItem = {
      id: `shop-${Date.now()}`,
      name: text,
      addedBy: this.data.activeUser,
      date: getTodayDateStr(),
      purchased: false
    };

    this.data.shopping.unshift(newItem);
    this.saveData();
    this.apiRequest('/api/shopping', 'POST', { name: text });
    input.value = '';

    this.renderShoppingList();
    this.renderDashboard();
    this.showToast(`"${text}" added to shopping list!`);
  }

  toggleShoppingPurchased(itemId) {
    const item = this.data.shopping.find(s => s.id === itemId);
    if (!item) return;

    item.purchased = !item.purchased;
    this.saveData();
    this.apiRequest('/api/shopping/' + itemId + '/toggle', 'PATCH');

    this.renderShoppingList();
    this.renderDashboard();
  }

  deleteShoppingItem(itemId) {
    this.data.shopping = this.data.shopping.filter(s => s.id !== itemId);
    this.saveData();
    this.apiRequest('/api/shopping/' + itemId, 'DELETE');
    this.renderShoppingList();
    this.renderDashboard();
    this.showToast('Item deleted from shopping list.');
  }

  clearCompletedShopping() {
    const completed = this.data.shopping.filter(s => s.purchased);
    if (completed.length === 0) {
      this.showToast('No completed items to clear.');
      return;
    }
    if (confirm(`Clear all ${completed.length} purchased items?`)) {
      this.data.shopping = this.data.shopping.filter(s => !s.purchased);
      this.saveData();
      this.apiRequest('/api/shopping/clear-completed', 'POST');
      this.renderShoppingList();
      this.renderDashboard();
      this.showToast('Completed items cleared.');
    }
  }

  // Shared Notes
  renderSharedNotes() {
    const grid = document.getElementById('sharedNotesGrid');
    const badgeEl = document.getElementById('notesMsgBadge');
    if (!grid) return;

    if (badgeEl) badgeEl.textContent = this.data.notes.length;

    if (this.data.notes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>No shared notes yet. Post reminders, announcements or utility notices for everyone!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.data.notes.map(note => `
      <div class="note-card">
        <div class="note-header">
          <span class="note-tag">${note.category}</span>
          <div style="display:flex; gap:4px;">
            <button class="icon-action-btn" onclick="app.openEditNoteModal('${note.id}')" title="Edit note">✏️</button>
            <button class="icon-action-btn" onclick="app.deleteNote('${note.id}')" title="Delete note">🗑</button>
          </div>
        </div>
        <div class="note-content">${note.content}</div>
        <div class="note-footer">
          <span class="note-author">
            <span class="mini-avatar">${note.author.charAt(0)}</span>
            ${note.author}
          </span>
          <span>${note.time}</span>
        </div>
      </div>
    `).join('');
  }

  openAddNoteModal() {
    document.getElementById('noteModalTitle').textContent = 'Post a House Note';
    document.getElementById('noteId').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteCategory').value = '📌 General';
    this.openModal('noteModal');
  }

  openEditNoteModal(noteId) {
    const note = this.data.notes.find(n => n.id === noteId);
    if (!note) return;

    document.getElementById('noteModalTitle').textContent = 'Edit House Note';
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category || '📌 General';
    this.openModal('noteModal');
  }

  handleSaveNote(event) {
    event.preventDefault();

    const id = document.getElementById('noteId').value;
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value;

    if (!content) return;

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (id) {
      const idx = this.data.notes.findIndex(n => n.id === id);
      if (idx !== -1) {
        this.data.notes[idx].content = content;
        this.data.notes[idx].category = category;
      }
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        content,
        category,
        author: this.data.activeUser,
        time: timeFormatted
      };
      this.data.notes.unshift(newNote);
    }

    this.saveData();
    this.apiRequest('/api/notes', 'POST', { id, content, category });
    this.closeModal('noteModal');
    this.showToast(id ? 'Note updated.' : 'Note posted for roommates!');
    this.renderSharedNotes();
    this.renderDashboard();
  }

  deleteNote(noteId) {
    if (confirm('Delete this note?')) {
      this.data.notes = this.data.notes.filter(n => n.id !== noteId);
      this.saveData();
      this.apiRequest('/api/notes/' + noteId, 'DELETE');
      this.renderSharedNotes();
      this.renderDashboard();
      this.showToast('Note deleted.');
    }
  }

  async resetToBlank() {
    const confirmed = confirm(
      "Start fresh with an empty house?\n\nThis will permanently delete all shared household data from the database, including expenses, payment statuses, tasks, shopping items, and notes.\n\nAll 4 roommate accounts will be preserved.\n\nAre you sure you want to proceed?"
    );
    if (!confirmed) return;

    const res = await this.apiRequest('/api/reset/blank', 'POST');
    if (res) {
      this.data.expenses = [];
      this.data.tasks = [];
      this.data.shopping = [];
      this.data.notes = [];
      this.saveData();
      await this.syncFromBackend();
      this.closeModal('dataModal');
      this.renderAll();
      this.showToast('Started fresh! Shared database data cleared.');
    } else {
      this.showToast('Failed to clear database data. Please try again.');
    }
  }

  async resetToDemo() {
    const confirmed = confirm(
      "Reload sample demo data into the database?\n\nThis will replace the current shared household data in the database with standard demo records."
    );
    if (!confirmed) return;

    const res = await this.apiRequest('/api/reset/demo', 'POST');
    if (res) {
      await this.syncFromBackend();
      this.closeModal('dataModal');
      this.renderAll();
      this.showToast('Demo data reloaded into database.');
    } else {
      this.showToast('Failed to load demo data. Please try again.');
    }
  }
}

// Global instance attached to window for inline onclick handlers
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new HouseHubApp();
  window.app = app;
});
