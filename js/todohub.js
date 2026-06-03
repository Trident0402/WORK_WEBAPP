// js/todohub.js

const todohub = {
  activeFilter: 'all',
  eventsBound: false,

  render() {
    this.bindEvents();
    const container = document.getElementById('todohub-feed');
    const searchInput = document.getElementById('todo-search-input').value.toLowerCase();
    
    let todos = [];
    const memos = storage.getAllMemos();
    
    memos.forEach(memo => {
      if (!memo.content) return;
      let chkIndex = 0;
      memo.content.split('\n').forEach(line => {
        const match = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
        if (match) {
          todos.push({
            memoId: memo.id,
            memoDate: memo.date,
            index: chkIndex++,
            text: match[3],
            completed: match[2].toLowerCase() === 'x'
          });
        }
      });
    });

    if (this.activeFilter === 'pending') todos = todos.filter(t => !t.completed);
    if (this.activeFilter === 'completed') todos = todos.filter(t => t.completed);
    if (searchInput) todos = todos.filter(t => t.text.toLowerCase().includes(searchInput));

    if (todos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
          <p>沒有符合條件的代辦事項！</p>
        </div>
      `;
      return;
    }

    let html = '';
    todos.forEach(t => {
      html += `<div class="memo-card"><div class="memo-header"><span class="memo-time">${t.memoDate}</span></div><div class="todo-item" onclick="capture.openModal(${t.memoId})"><input type="checkbox" class="todo-checkbox" data-memo-id="${t.memoId}" data-todo-index="${t.index}" ${t.completed ? 'checked' : ''} onclick="event.stopPropagation()" onchange="todohub.toggleTodo(this)"><span class="todo-text">${utils.escapeHtml(t.text)}</span></div></div>`;
    });
    
    container.innerHTML = html;
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    document.getElementById('todo-search-input').addEventListener('input', () => this.render());
    
    document.querySelectorAll('#section-todohub .chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#section-todohub .chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.activeFilter = e.target.dataset.filter;
        this.render();
      });
    });
  },

  toggleTodo(checkbox) {
    const memoId = parseInt(checkbox.dataset.memoId);
    const targetIndex = parseInt(checkbox.dataset.todoIndex);
    const isChecked = checkbox.checked;

    const memo = storage.getMemoById(memoId);
    if (!memo) return;

    let currentIdx = 0;
    const lines = memo.content.split('\n');
    const updated = lines.map(line => {
      if (line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/)) {
        if (currentIdx === targetIndex) {
          currentIdx++;
          return line.replace(/-\s*\[([ xX])\]/, isChecked ? '- [x]' : '- [ ]');
        }
        currentIdx++;
      }
      return line;
    });

    storage.saveMemo({ ...memo, content: updated.join('\n') });
  }
};
