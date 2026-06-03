// js/tomorrow.js

const tomorrow = {
  rescheduleSourceDate: null,

  render() {
    this.renderCalendar();
    this.renderBanner();
    this.renderFeed();
  },

  renderCalendar() {
    const container = document.getElementById('tomorrow-calendar');
    const tomorrowDate = utils.addDays(new Date(), 1);
    const y = tomorrowDate.getFullYear();
    const m = tomorrowDate.getMonth();
    const d = tomorrowDate.getDate();
    const monthYear = tomorrowDate.toLocaleString('zh-TW', { year: 'numeric', month: 'long' });
    
    let html = `
      <div class="calendar-header">
        <h2>${monthYear}</h2>
      </div>
      <div class="calendar-grid">
    `;
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach(day => html += `<div class="calendar-day-name">${day}</div>`);
    
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isActive = (i === d) ? 'active' : '';
      html += `<div class="calendar-day-node ${isActive}">${i}</div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
  },

  renderBanner() {
    const container = document.getElementById('tomorrow-banner-container');
    const todayStr = utils.formatYYYYMMDD(new Date());
    const allMemos = storage.getAllMemos();
    const todayMemos = allMemos.filter(m => m.date === todayStr);
    const hasUnfinished = todayMemos.some(m => m.content && m.content.includes('- [ ]'));

    if (hasUnfinished) {
      container.innerHTML = `
        <div class="banner-alert">
          <div class="banner-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>今日還有未完成的代辦事項！</span>
          </div>
          <button class="banner-action-btn" onclick="tomorrow.openRescheduleModal('${todayStr}')">
            搬移未完成
          </button>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }
  },

  renderFeed() {
    const container = document.getElementById('tomorrow-feed');
    const tomorrowStr = utils.formatYYYYMMDD(utils.addDays(new Date(), 1));
    const allMemos = storage.getAllMemos();
    const dayMemos = allMemos.filter(m => m.date === tomorrowStr);

    if (dayMemos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
          <p>明天還沒有任何規劃喔！</p>
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
    
    container.innerHTML = html;
  },

  openRescheduleModal(sourceDate) {
    this.rescheduleSourceDate = sourceDate;
    const modal = document.getElementById('reschedule-modal');
    const input = document.getElementById('reschedule-date-input');
    
    const todayStr = utils.formatYYYYMMDD(new Date());
    if (sourceDate < todayStr) {
      input.value = todayStr;
    } else {
      input.value = utils.formatYYYYMMDD(utils.addDays(new Date(), 1));
    }
    
    modal.classList.add('open');
  },

  closeRescheduleModal() {
    const modal = document.getElementById('reschedule-modal');
    modal.classList.remove('open');
    this.rescheduleSourceDate = null;
  },

  confirmReschedule() {
    const targetDate = document.getElementById('reschedule-date-input').value;
    if (!targetDate || !this.rescheduleSourceDate) return;

    const allMemos = storage.getAllMemos();
    const sourceMemos = allMemos.filter(m => m.date === this.rescheduleSourceDate);

    for (let memo of sourceMemos) {
      if (memo.content && memo.content.includes('- [ ]')) {
        const lines = memo.content.split('\n');
        const unfinishedLines = lines.filter(l => l.match(/^(\s*)-\s*\[ \]\s*(.*)$/));
        
        if (unfinishedLines.length > 0) {
          const movedContent = `*由 ${this.rescheduleSourceDate} 移入：*\n` + unfinishedLines.join('\n');
          storage.appendMemoToDate(targetDate, movedContent);
          
          const updatedLines = lines.map(l => {
            if (l.match(/^(\s*)-\s*\[ \]\s*(.*)$/)) {
              return l.replace('- [ ]', '- [x]') + ` *(已移至 ${targetDate})*`;
            }
            return l;
          });
          
          storage.saveMemo({ ...memo, content: updatedLines.join('\n') });
        }
      }
    }

    this.closeRescheduleModal();
    app.navigate(app.currentSection);
  }
};
