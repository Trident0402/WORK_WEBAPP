// js/capture.js

const capture = {
  currentMemoId: null,

  openModal(memoId = null) {
    this.currentMemoId = memoId;
    const modal = document.getElementById('capture-modal');
    const textarea = document.getElementById('capture-textarea');
    const dateInput = document.getElementById('capture-date-input');
    const optionsBlock = document.getElementById('capture-options');
    const newCardCheck = document.getElementById('capture-new-card-checkbox');
    const deleteBtn = document.getElementById('capture-delete-container');

    // Auto-draft listener
    if (!this.draftBound) {
      textarea.addEventListener('input', () => {
        if (!this.currentMemoId) {
          localStorage.setItem('diaryDraft', textarea.value);
        }
      });
      this.draftBound = true;
    }

    if (memoId) {
      // Edit mode
      const memo = storage.getMemoById(memoId);
      if (memo) {
        textarea.value = memo.content || '';
        dateInput.value = memo.date;
        optionsBlock.style.display = 'none';
        deleteBtn.style.display = 'block';
      }
    } else {
      // Add mode - try to load draft
      const draft = localStorage.getItem('diaryDraft');
      textarea.value = draft || '';
      
      // Determine default date based on active section
      if (app.currentSection === 'tomorrow') {
        dateInput.value = utils.formatYYYYMMDD(utils.addDays(new Date(), 1));
      } else {
        // Use app.selectedDate for dashboard
        dateInput.value = utils.formatYYYYMMDD(app.selectedDate || new Date());
      }
      
      optionsBlock.style.display = 'block';
      newCardCheck.checked = false;
      deleteBtn.style.display = 'none';
    }

    modal.classList.add('open');
    setTimeout(() => textarea.focus(), 100);
  },

  closeModal() {
    const modal = document.getElementById('capture-modal');
    modal.classList.remove('open');
    this.currentMemoId = null;
  },

  save() {
    const textarea = document.getElementById('capture-textarea');
    const dateInput = document.getElementById('capture-date-input');
    const newCardCheck = document.getElementById('capture-new-card-checkbox');
    
    const content = textarea.value.trim();
    if (!content) {
      this.closeModal();
      return;
    }

    const targetDate = dateInput.value || utils.formatYYYYMMDD(new Date());

    if (this.currentMemoId) {
      // Edit
      storage.saveMemo({
        id: this.currentMemoId,
        date: targetDate,
        content: content
      });
    } else {
      // Add
      if (newCardCheck.checked) {
        storage.saveMemo({
          id: Date.now(),
          date: targetDate,
          content: content,
          images: []
        });
      } else {
        storage.appendMemoToDate(targetDate, content);
      }
      // Clear draft upon successful save
      localStorage.removeItem('diaryDraft');
    }

    this.closeModal();
    app.navigate(app.currentSection); // Refresh current view
  },

  deleteMemo() {
    if (confirm('確定要刪除這筆紀錄嗎？此動作無法復原。')) {
      storage.deleteMemo(this.currentMemoId);
      this.closeModal();
      app.navigate(app.currentSection);
    }
  },

  insertTodoTemplate() {
    const textarea = document.getElementById('capture-textarea');
    const cursor = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursor);
    const textAfter = textarea.value.substring(textarea.selectionEnd);
    
    const prefix = textBefore.length > 0 && !textBefore.endsWith('\n') ? '\n' : '';
    textarea.value = textBefore + prefix + '- [ ] ' + textAfter;
    textarea.selectionStart = textarea.selectionEnd = cursor + prefix.length + 6;
    textarea.focus();
    
    // Trigger auto-draft
    textarea.dispatchEvent(new Event('input'));
  },

  insertImage() {
    alert("圖片上傳功能即將推出！第一版暫不包含此功能。");
  }
};
