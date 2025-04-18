// === script.js ===

let selectedMonth = new Date().getMonth() + 1;
let selectedYear = new Date().getFullYear();

let editingTransactionId = null;
let cashflowChartInstance;
let categoryChartInstance;

function populateMonthYearSelects() {
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  monthSelect.innerHTML = '';
  for (let m = 0; m < 12; m++) {
    const option = document.createElement('option');
    option.value = m + 1;
    option.textContent = monthNames[m];
    if ((m + 1) === selectedMonth) option.selected = true;
    monthSelect.appendChild(option);
  }

  yearSelect.innerHTML = '';
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    if (y === selectedYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

function changeMonth(offset) {
  selectedMonth += offset;
  if (selectedMonth > 12) {
    selectedMonth = 1;
    selectedYear++;
  } else if (selectedMonth < 1) {
    selectedMonth = 12;
    selectedYear--;
  }
  document.getElementById('monthSelect').value = selectedMonth;
  document.getElementById('yearSelect').value = selectedYear;
  loadTransactions();
}

function handleMonthYearChange() {
  selectedMonth = parseInt(document.getElementById('monthSelect').value);
  selectedYear = parseInt(document.getElementById('yearSelect').value);
  loadTransactions();
}

function showTransactionForm() {
  const form = document.getElementById('transactionFormContainer');
  form.style.display = 'block';

  // Cuộn lên đầu trang để đảm bảo form không bị khuất
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


function hideTransactionForm() {
  const form = document.getElementById('transactionFormContainer');
  form.style.display = 'none';
  document.getElementById('transactionForm').reset();
  editingTransactionId = null;
  document.getElementById('saveButton').textContent = 'Lưu';
}

function toggleTransactionForm(isEdit = false) {
  const form = document.getElementById('transactionFormContainer');
  if (form.style.display === 'none' || isEdit) {
    showTransactionForm();
  } else {
    hideTransactionForm();
  }
  if (!isEdit) {
    document.getElementById('transactionForm').reset();
    editingTransactionId = null;
    document.getElementById('saveButton').textContent = 'Lưu';
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const transaction = {
    userId: localStorage.getItem('userId') || 1,
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    note: document.getElementById('note').value
  };

  if (editingTransactionId) {
    await updateTransaction(editingTransactionId, transaction);
  } else {
    await addTransaction(transaction);
  }

  document.getElementById('transactionForm').reset();
  hideTransactionForm();
  await loadTransactions();
}

async function addTransaction(transaction) {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return await res.json();
  } catch (err) {
    console.error('Lỗi khi thêm:', err);
  }
}

async function updateTransaction(id, transaction) {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return await res.json();
  } catch (err) {
    console.error('Lỗi khi sửa:', err);
  }
}

async function deleteTransaction(id) {
  if (!confirm('Bạn có chắc muốn xoá giao dịch này?')) return;
  await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
  await loadTransactions();
}

async function loadTransactions() {
  const userId = localStorage.getItem('userId') || 1;
  const res = await fetch(`/api/transactions?userId=${userId}&month=${selectedMonth}&year=${selectedYear}`);
  const data = await res.json();

  renderTransactions(data);
  renderCharts(data);
  updateSummary(data);
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactionsContainer');
  container.innerHTML = '';
  if (!transactions.length) {
    container.innerHTML = `<div class="no-transactions">Không có giao dịch nào.</div>`;
    return;
  }
  for (const tx of transactions) {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <div>${luxon.DateTime.fromISO(tx.date).toFormat('dd/MM/yyyy')}</div>
      <div>${tx.category}</div>
      <div>${tx.note || '-'}</div>
      <div class="${tx.type === 'income' ? 'income' : 'expense'}">${tx.amount.toLocaleString()}₫</div>
      <div class="action-buttons">
        <button class="btn btn-edit" onclick='editTransaction(${JSON.stringify(tx)})'>Sửa</button>
        <button class="btn btn-delete" onclick="deleteTransaction(${tx.id})">Xoá</button>
      </div>
    `;
    container.appendChild(item);
  }
}

function editTransaction(tx) {
  document.getElementById('type').value = tx.type;
  document.getElementById('amount').value = tx.amount;
  document.getElementById('category').value = tx.category;
  document.getElementById('date').value = tx.date;
  document.getElementById('note').value = tx.note || '';

  editingTransactionId = tx.id;
  document.getElementById('saveButton').textContent = 'Cập nhật';
  showTransactionForm();
}

function updateSummary(transactions = []) {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }
  document.getElementById('totalIncome').textContent = totalIncome.toLocaleString() + '₫';
  document.getElementById('totalExpense').textContent = totalExpense.toLocaleString() + '₫';
  document.getElementById('currentBalance').textContent = (totalIncome - totalExpense).toLocaleString() + '₫';
}

function renderCharts(transactions) {
  if (cashflowChartInstance) cashflowChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }

  // Biểu đồ cột
  const ctx1 = document.getElementById('cashflowChart').getContext('2d');
  cashflowChartInstance = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Thu nhập', 'Chi tiêu'],
      datasets: [{
        label: 'Số tiền (VND)',
        data: [totalIncome, totalExpense],
        backgroundColor: ['#10b981', '#ef4444'],
        barThickness: 100, // Độ rộng cố định cho mỗi cột
        categoryPercentage: 0.5, // Phần trăm chiếm chỗ của nhóm cột
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Quan trọng: tắt tự động điều chỉnh tỷ lệ
      plugins: {
        title: {
          display: true,
          text: 'Biểu đồ Thu nhập & Chi tiêu',
          font: { size: 16 }
        },
        legend: {
          display: false // Ẩn legend vì đã có màu trên nhãn
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString() + '₫';
            }
          }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });


  // Biểu đồ danh mục chi tiêu (giữ nguyên kiểu cũ)
  const expenseByCategory = {};
  for (const tx of transactions) {
    if (tx.type === 'expense') {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  }

  const catLabels = Object.keys(expenseByCategory);
  const catData = Object.values(expenseByCategory);
  const catColors = catLabels.map((_, i) => ['#f87171', '#fb923c', '#34d399', '#60a5fa', '#a78bfa', '#facc15', '#ec4899'][i % 7]);

  const ctx2 = document.getElementById('categoryChart').getContext('2d');
  categoryChartInstance = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{
        data: catData,
        backgroundColor: catColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Tương tự cho biểu đồ tròn
      plugins: {
        title: {
          display: true,
          text: 'Biểu đồ Chi tiêu theo Danh mục',
          font: { size: 16 }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo dropdown tháng/năm và load giao dịch
  populateMonthYearSelects();
  loadTransactions();

  const loginLink = document.getElementById('loginLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const fullName = localStorage.getItem('fullName');

  if (fullName) {
    // Đã đăng nhập → hiện tên và nút Đăng xuất
    loginLink.textContent = fullName;
    loginLink.removeAttribute('href');          // nếu không cần click vào
    logoutBtn.style.display = 'inline-block';
  } else {
    // Chưa đăng nhập → hiện link Đăng nhập
    loginLink.textContent = 'Đăng nhập';
    loginLink.href = 'auth.html';
    logoutBtn.style.display = 'none';
  }

  // Bắt sự kiện Đăng xuất
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    window.location.reload();
  });
});
