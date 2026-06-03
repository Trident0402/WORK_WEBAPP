// js/storage.js

const storage = {
  key: 'diaryAppData',

  _getData() {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return { version: 1, memos: [], settings: {} };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Parse error in storage", e);
      return { version: 1, memos: [], settings: {} };
    }
  },

  _saveData(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  getAllMemos() {
    const data = this._getData();
    // Sort descending by id (which is timestamp)
    return data.memos.sort((a, b) => b.id - a.id);
  },

  saveMemo(memoData) {
    const data = this._getData();
    const index = data.memos.findIndex(m => m.id === memoData.id);
    
    if (index >= 0) {
      // Update
      data.memos[index] = { ...data.memos[index], ...memoData, updatedAt: new Date().toISOString() };
    } else {
      // Insert
      data.memos.push({
        ...memoData,
        createdAt: memoData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this._saveData(data);
  },

  deleteMemo(id) {
    const data = this._getData();
    data.memos = data.memos.filter(m => m.id !== id);
    this._saveData(data);
  },

  getMemoById(id) {
    return this.getAllMemos().find(m => m.id === id);
  },

  appendMemoToDate(dateStr, newContent) {
    const data = this._getData();
    // Find the newest memo for this date
    const dateMemos = data.memos.filter(m => m.date === dateStr).sort((a, b) => b.id - a.id);
    
    if (dateMemos.length > 0) {
      const target = dateMemos[0]; // append to the latest one
      target.content = target.content ? `${target.content}\n${newContent}` : newContent;
      target.updatedAt = new Date().toISOString();
      this._saveData(data);
      return target;
    } else {
      // Create new
      const newMemo = {
        id: Date.now(),
        date: dateStr,
        content: newContent,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.memos.push(newMemo);
      this._saveData(data);
      return newMemo;
    }
  }
};
