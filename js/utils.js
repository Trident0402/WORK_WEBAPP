// js/utils.js

const utils = {
  formatYYYYMMDD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  addDays(dateObj, days) {
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  },

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  parseMemoToHtml(memo) {
    if (!memo.content) return '';
    const lines = memo.content.split('\n');
    let html = '';
    let todoIndex = 0;

    lines.forEach(line => {
      // Check for markdown check list `- [ ] ` or `- [x] `
      const match = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
      if (match) {
        const indent = match[1].replace(/ /g, '&nbsp;');
        const checked = match[2].toLowerCase() === 'x';
        const text = this.escapeHtml(match[3]);
        
        html += `<div class="todo-item" onclick="event.stopPropagation()">${indent}<input type="checkbox" class="todo-checkbox" data-memo-id="${memo.id}" data-todo-index="${todoIndex}" ${checked ? 'checked' : ''} onchange="todohub.toggleTodo(this)"><span class="todo-text">${text}</span></div>`;
        todoIndex++;
      } else {
        // Normal text
        html += `<div>${this.escapeHtml(line)}</div>`;
      }
    });

    return html;
  }
};
