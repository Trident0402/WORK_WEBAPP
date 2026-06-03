// js/dashboard.js

const dashboard = {
  render() {
    this.renderCalendar();
    this.renderFeed();
  },

  renderCalendar() {
    const container = document.getElementById('dashboard-calendar');
    const date = app.selectedDate || new Date();
    
    // Header
    const monthYear = date.toLocaleString('zh-TW', { year: 'numeric', month: 'long' });
    let html = `
      <div class="calendar-header">
        <h2>${monthYear}</h2>
        <div>
          <button class="icon-btn" style="display:inline;" onclick="dashboard.changeMonth(-1)">◀</button>
          <button class="icon-btn" style="display:inline;" onclick="dashboard.changeMonth(1)">▶</button>
        </div>
      </div>
    `;

    html += `<div class="calendar-grid">`;
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach(d => {
      html += `<div class="calendar-day-name">${d}</div>`;
    });

    // Calculate days
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    const selectedStr = utils.formatYYYYMMDD(date);

    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const current = new Date(y, m, i);
      const currentStr = utils.formatYYYYMMDD(current);
      const isActive = currentStr === selectedStr ? 'active' : '';
      html += `
        <div class="calendar-day-node ${isActive}" onclick="dashboard.selectDate(${y}, ${m}, ${i})">
          ${i}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  changeMonth(diff) {
    const d = new Date(app.selectedDate);
    d.setMonth(d.getMonth() + diff);
    app.selectedDate = d;
    this.render();
  },

  selectDate(y, m, d) {
    app.selectedDate = new Date(y, m, d);
    this.render();
  },

  renderFeed() {
    const container = document.getElementById('dashboard-feed');
    const dateStr = utils.formatYYYYMMDD(app.selectedDate);
    const allMemos = storage.getAllMemos();
    const dayMemos = allMemos.filter(m => m.date === dateStr);

    if (dayMemos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
          <p>這天還沒有任何紀錄喔！<br/>點擊下方的 + 來新增一筆吧。</p>
        </div>
      `;
      return;
    }

    let html = '';
    dayMemos.forEach(memo => {
      const contentHtml = utils.parseMemoToHtml(memo);
      const timeStr = memo.createdAt ? new Date(memo.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute:'2-digit' }) : '';
      html += `
        <div class="memo-card" onclick="capture.openModal(${memo.id})">
          <div class="memo-header">
            <span class="memo-time">${timeStr}</span>
          </div>
          <div class="memo-body">${contentHtml}</div>
        </div>
      `;
    });
    
    // Check if we need reschedule banner for past dates
    const todayStr = utils.formatYYYYMMDD(new Date());
    if (dateStr < todayStr) {
      const hasUnfinished = dayMemos.some(m => m.content && m.content.includes('- [ ]'));
      if (hasUnfinished) {
        html = `
          <div class="banner-alert">
            <div class="banner-content">
              <span>此日期有未完成的事項</span>
            </div>
            <button class="banner-action-btn" onclick="tomorrow.openRescheduleModal('${dateStr}')">搬移</button>
          </div>
        ` + html;
      }
    }

    container.innerHTML = html;
  }
};
