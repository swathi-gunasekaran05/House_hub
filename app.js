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

// Format currency in Indian Rupee format
function formatMoney(amount) {
  const val = Number(amount || 0);
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Format readable date
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
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
    this.notesTab = 'shopping'; // 'shopping', 'messages'
    this.activeExpenseId = null; // for detail modal
    this.dashWorkFilter = 'my'; // 'my', 'all'

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

  // ================= DASHBOARD / HOME =================
  renderDashboard() {
    const user = this.data.activeUser;
    const today = getTodayDateStr();

    // Greeting
    const greetingEl = document.getElementById('dashGreeting');
    if (greetingEl) greetingEl.textContent = `Good day, ${user}! ✨`;

    // Calculate Dues and Net Balance for active user
    const balances = this.calculateBalances(user);
    const netBalance = balances.othersOweMe - balances.iNeedToPay;
    const netBalEl = document.getElementById('dashNetBalance');
    const netSubEl = document.getElementById('dashNetBalanceSub');
    if (netBalEl) {
      if (netBalance > 0) {
        netBalEl.textContent = `+${formatMoney(netBalance)}`;
        netBalEl.style.color = '#86efac';
        if (netSubEl) netSubEl.textContent = '(Others owe you net)';
      } else if (netBalance < 0) {
        netBalEl.textContent = `-${formatMoney(Math.abs(netBalance))}`;
        netBalEl.style.color = '#fca5a5';
        if (netSubEl) netSubEl.textContent = '(You owe net)';
      } else {
        netBalEl.textContent = '₹0.00';
        netBalEl.style.color = '#c7d2fe';
        if (netSubEl) netSubEl.textContent = '(All settled up)';
      }
    }

    const oweEl = document.getElementById('dashOweAmount');
    const recEl = document.getElementById('dashReceiveAmount');
    if (oweEl) oweEl.textContent = formatMoney(balances.iNeedToPay);
    if (recEl) recEl.textContent = formatMoney(balances.othersOweMe);

    // Household Work (Filtered to My Tasks or All House Tasks)
    const isMyOnly = (this.dashWorkFilter !== 'all');
    const filteredTasks = isMyOnly
      ? this.data.tasks.filter(t => t.date === today && t.assignedTo === user)
      : this.data.tasks.filter(t => t.date === today);

    const countEl = document.getElementById('todayWorkCount');
    if (countEl) countEl.textContent = filteredTasks.length;

    const headingEl = document.getElementById('workSectionHeading');
    if (headingEl) {
      headingEl.textContent = isMyOnly ? "My Tasks Today" : "All House Tasks Today";
    }

    const btnMy = document.getElementById('btnFilterMyTasks');
    const btnAll = document.getElementById('btnFilterAllTasks');
    if (btnMy) btnMy.classList.toggle('active', isMyOnly);
    if (btnAll) btnAll.classList.toggle('active', !isMyOnly);

    const workListEl = document.getElementById('dashWorkList');
    if (workListEl) {
      if (filteredTasks.length === 0) {
        workListEl.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">☕</span>
            <p>${isMyOnly ? 'No household tasks assigned to you today. Enjoy!' : 'No household tasks scheduled for today. Enjoy!'}</p>
          </div>
        `;
      } else {
        workListEl.innerHTML = filteredTasks.map(t => this.renderWorkItemHTML(t)).join('');
      }
    }

    // Today's / Recent Expenses Alert
    const expenseAlertsEl = document.getElementById('dashExpenseAlerts');
    if (expenseAlertsEl) {
      // Show pending expenses where current user owes money
      const pendingForMe = this.data.expenses.filter(exp => {
        if (exp.paidBy === user) return false;
        const mySplit = exp.splits.find(s => s.user === user);
        return mySplit && !mySplit.paid;
      });

      if (pendingForMe.length > 0) {
        expenseAlertsEl.innerHTML = pendingForMe.slice(0, 2).map(exp => {
          const myShare = exp.splits.find(s => s.user === user)?.shareAmount || 0;
          return `
            <div class="card" style="margin-bottom:8px; border-left: 4px solid var(--danger);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="font-size:14px;">${exp.title}</strong>
                  <div style="font-size:12px; color:var(--text-muted);">Paid by ${exp.paidBy} • Your share: <strong style="color:var(--danger);">${formatMoney(myShare)}</strong></div>
                </div>
                <button class="btn-toggle-paid" onclick="app.quickMarkPaid('${exp.id}', '${user}')">Mark Paid</button>
              </div>
            </div>
          `;
        }).join('');
      } else {
        // Just show latest expense
        const latestExp = this.data.expenses[0];
        if (latestExp) {
          const mySplit = latestExp.splits.find(s => s.user === user);
          const isPayer = latestExp.paidBy === user;
          const statusText = isPayer ? 'You paid this' : (mySplit?.paid ? '✓ Paid' : 'Pending');

          expenseAlertsEl.innerHTML = `
            <div class="card" style="cursor:pointer;" onclick="app.openExpenseDetail('${latestExp.id}')">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <strong style="font-size:14px;">${latestExp.title}</strong>
                  <div style="font-size:12px; color:var(--text-muted);">${formatDisplayDate(latestExp.date)} • Paid by ${latestExp.paidBy}</div>
                </div>
                <div style="text-align:right;">
                  <strong style="font-size:15px;">${formatMoney(latestExp.total)}</strong>
                  <div style="font-size:11px; font-weight:700; color: ${isPayer || mySplit?.paid ? 'var(--success-dark)' : 'var(--danger)'};">${statusText}</div>
                </div>
              </div>
            </div>
          `;
        } else {
          expenseAlertsEl.innerHTML = `<div class="card empty-state"><p>No expenses added yet.</p></div>`;
        }
      }
    }

    // Shopping List Preview
    const unpurchasedShop = this.data.shopping.filter(s => !s.purchased);
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

    // Notes Preview
    const notesPrevEl = document.getElementById('dashNotesPreview');
    if (notesPrevEl) {
      if (this.data.notes.length === 0) {
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

  // ================= EXPENSES PAGE =================
  renderExpensesPage() {
    const user = this.data.activeUser;
    const balances = this.calculateBalances(user);

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

    let filtered = [...this.data.expenses];

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

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🧾</span>
          <p>No expenses found under this view.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(exp => {
      const isPayer = exp.paidBy === user;
      const mySplit = exp.splits.find(s => s.user === user);
      const pendingSplits = exp.splits.filter(s => !s.paid);
      const isAllSettled = pendingSplits.length === 0;

      // Status indicator text
      let badgeHTML = '';
      if (isAllSettled) {
        badgeHTML = `<span class="status-badge all-settled">✓ Settled</span>`;
      } else {
        badgeHTML = `<span class="status-badge pending">${pendingSplits.length} Pending</span>`;
      }

      // Line items preview string
      const itemsString = exp.items && exp.items.length > 0
        ? exp.items.map(it => `${it.name} (${formatMoney(it.amount)})`).join(' • ')
        : 'Multiple items';

      // Split avatars
      const avatarsHTML = exp.splits.map(s => `
        <span class="mini-avatar ${s.paid ? 'paid' : ''}" title="${s.user}: ${s.paid ? 'Paid' : 'Pending'}">
          ${s.user.charAt(0)}
        </span>
      `).join('');

      return `
        <div class="expense-card" onclick="app.openExpenseDetail('${exp.id}')">
          <div class="expense-top">
            <div class="expense-meta-left">
              <div class="expense-icon-badge">🛒</div>
              <div class="expense-title-group">
                <h4>${exp.title}</h4>
                <div class="expense-date-payer">${formatDisplayDate(exp.date)} • Paid by <strong>${exp.paidBy}</strong></div>
              </div>
            </div>
            <div class="expense-amount-group">
              <div class="expense-total">${formatMoney(exp.total)}</div>
              ${badgeHTML}
            </div>
          </div>

          <div class="expense-items-preview">
            ${itemsString}
          </div>

          <div class="expense-footer">
            <div class="split-pill-group">
              <span style="font-size:11px; color:var(--text-muted); margin-right:4px;">Split:</span>
              ${avatarsHTML}
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--primary);">
              Details & Payment →
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ================= ADD / EDIT EXPENSE FORM =================
  openAddExpenseModal(expenseToEdit = null) {
    const modalTitle = document.getElementById('expenseModalTitle');
    const expIdInput = document.getElementById('expId');
    const expDateInput = document.getElementById('expDate');
    const expPaidBy = document.getElementById('expPaidBy');
    const expPaidByDisplay = document.getElementById('expPaidByDisplay');
    const expTitleInput = document.getElementById('expTitle');
    const itemsContainer = document.getElementById('expenseItemsContainer');
    const checkboxesContainer = document.getElementById('expSplitCheckboxes');

    const currentUser = this.data.activeUser;

    if (expenseToEdit) {
      if (expenseToEdit.paidBy !== currentUser) {
        alert(`Only ${expenseToEdit.paidBy}, who paid this amount, can edit this expense.`);
        return;
      }
      modalTitle.textContent = 'Edit Expense';
      expIdInput.value = expenseToEdit.id;
      expDateInput.value = expenseToEdit.date;
      if (expPaidBy) expPaidBy.value = expenseToEdit.paidBy;
      if (expPaidByDisplay) expPaidByDisplay.value = `${expenseToEdit.paidBy} (You)`;
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
      if (expPaidBy) expPaidBy.value = currentUser;
      if (expPaidByDisplay) expPaidByDisplay.value = `${currentUser} (You)`;
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
    if (preview) {
      preview.innerHTML = `Split between ${selectedPeople.length} people: <strong>${formatMoney(perPerson)} each</strong>`;
    }
  }

  handleSaveExpense(event) {
    event.preventDefault();

    const id = document.getElementById('expId').value;
    const date = document.getElementById('expDate').value;
    const paidBy = this.data.activeUser; // Strictly the authenticated logged-in user
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
        if (this.data.activeUser !== expense.paidBy) {
          alert(`Only ${expense.paidBy}, who paid this expense, can edit it.`);
          return;
        }
        this.closeModal('expenseDetailModal');
        this.openAddExpenseModal(expense);
      };
    }

    if (btnDelete) {
      btnDelete.onclick = () => {
        if (this.data.activeUser !== expense.paidBy) {
          alert(`Only ${expense.paidBy}, who paid this expense, can delete it.`);
          return;
        }
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
