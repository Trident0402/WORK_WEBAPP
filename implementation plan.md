# Diary WebApp v1.00.03 編輯點擊失效修正計畫

## User Review Required

> [!IMPORTANT]
> 關於你說的「修正(編輯)的部分有時候可以、有時候不行」，我已經完全抓出 Bug 的原因了！
> 
> **根本原因分析：**
> 1. 當你點擊「一般的文字」時，點擊事件會正常傳遞給卡片 (`.memo-card`)，成功打開編輯視窗。
> 2. 但是！我在 `utils.js` 產生 Checkbox 代辦事項的時候，不小心把「阻擋點擊事件 (`event.stopPropagation()`)」綁定到了**整行代辦事項的容器**上。
> 3. 這導致當你點擊代辦事項的文字時，點擊訊號被攔截了，傳不到外層的卡片，所以編輯視窗根本不會彈出來！這就是為什麼你會有「有時候點得開、有時候點不開」的感覺。
> 
> **本次的修正計畫如下，請確認是否同意：**
> 1. 我會把 `js/utils.js` 裡的阻擋點擊邏輯，嚴格限定只能綁定在 `<input type="checkbox">` 本身上。
> 2. 這樣一來，只有精準點擊「框框」才會切換打勾狀態；而點擊「文字」或其他空白處，都會順利打開編輯視窗讓你修改文字！
> 3. 再次更新 Service Worker 的快取版本至 `v5`，確保你的瀏覽器讀到最新的修正。
> 
> 請問同意執行這個修正計畫嗎？

## Proposed Changes

### [MODIFY] `js/utils.js`
- 找到 `parseMemoToHtml` 函數中的單行模板字串。
- 將 `<div class="todo-item" onclick="event.stopPropagation()">` 的 `onclick` 拔掉。
- 將 `onclick="event.stopPropagation()"` 屬性，移動到 `<input type="checkbox">` 標籤內。
- 這樣就只有勾選框會攔截事件，其他區域皆可觸發編輯視窗。

### [MODIFY] `service-worker.js`
- 將 `CACHE_NAME` 版本升級為 `v5`，強迫瀏覽器更新 JS 邏輯。

## Verification Plan
1. 修改後請你再次重新整理。
2. 嘗試點擊首頁或明日規劃中的「代辦事項的文字部分」，確認是否能成功跳出編輯表單。
3. 嘗試點擊「代辦事項的核取方塊」，確認是否能正常打勾，且不會跳出編輯表單。
