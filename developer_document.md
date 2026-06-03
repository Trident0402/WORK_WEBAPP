# Diary WebApp v1.00.03 - 開發者文檔 (Developer Document)

## 1. 系統概述 (System Overview)
目標是將原本基於 React/Vite 的 `diary_webapp` 改寫為純前端 (Vanilla HTML, CSS, JavaScript) 的 PWA 應用程式。架構與開發準則將完全參考 `charge_app` 的實作方式，達成極簡、無框架、無打包工具、離線可用的設計目標。

## 2. 核心技術棧 (Tech Stack)
- **HTML5**: 單頁式應用 (SPA) 結構，透過 DOM 操作切換顯示區塊。
- **CSS3 (純 CSS)**: 全域與各區塊樣式，不依賴 Tailwind 或預處理器，確保風格統一且檔案結構簡單。
- **Vanilla JavaScript (ES6+)**: 邏輯控制、DOM 操作、事件綁定。
- **localStorage**: 作為資料庫，負責本機資料持久化。
- **PWA (Progressive Web App)**: 透過 `manifest.json` 與 `service-worker.js` 提供安裝至主畫面與離線支援。

## 3. 功能模組 (Features)
1. **Dashboard (今天 & 日曆)**:
   - 顯示日曆 Widget 與選定日期的備忘錄 (Memos)。
   - 提供浮動的「快速新增 (Quick Capture)」按鈕。
   - **同日卡片合併 (Auto-Merge)**: 預設情況下，同日新增的紀錄(文字或清單)會自動接續附加於當天的第一張(或最新一張)卡片中。除非使用者在新增時明確選擇「建立新卡片」，才會產生獨立的新卡片。
   - **編輯與刪除**: 點擊任一備忘錄卡片可進入編輯狀態，可修改文字、增刪 Check list 項目，或刪除整筆備忘錄。
   - **彈性排程 (Reschedule)**: 若查看過去日期，系統偵測到有未完成的代辦事項，可一鍵將其「移至今日」或「移至指定日期」。

2. **Tomorrow Plan (明日規劃)**:
   - 預設顯示明日的備忘錄。
   - 偵測今日是否有未完成的代辦事項，並提供彈性排程按鈕，可將未完成事項移至「明日」或「任意指定日期」。
   - **編輯與刪除**: 同樣支援點擊卡片進行文字與清單的修改及刪除。

3. **Todo Hub (代辦中心)**:
   - 從所有日期的備忘錄中，透過正規表達式提取出含有 `- [ ]` 或 `- [x]` 的代辦事項。
   - 支援搜尋與狀態過濾 (全部、進行中、已完成)。
   - 支援直接在列表中切換代辦事項的完成狀態，並同步更新回原始備忘錄的內文中。
   - **編輯與刪除**: 點擊個別代辦事項可快速修改文字或刪除該事項 (同步修改對應的原始備忘錄)。

## 4. 檔案結構設計 (Directory Structure)
```text
diary_webapp_v1.00.03/
  index.html              # 主結構、導覽列、所有頁面的容器與表單 Modal
  manifest.json           # PWA 設定檔
  service-worker.js       # PWA 離線快取控制
  implementation plan.md  # 實作計畫書
  developer_document.md   # 開發者文檔
  
  assets/
    icon.svg              # 應用程式圖示
    
  css/
    style.css             # 集中管理所有樣式

  js/
    app.js                # App 主流程 (初始化、路由/分頁切換、底部導覽)
    storage.js            # localStorage 封裝 (讀取/儲存 Memos)
    dashboard.js          # 今天頁面與日曆邏輯
    tomorrow.js           # 明日規劃與彈性排程邏輯
    todohub.js            # 代辦中心萃取與過濾邏輯
    capture.js            # 處理備忘錄的新增、合併、修改與刪除 Modal 邏輯
    utils.js              # 共用工具 (日期格式化、正規表達式處理、DOM helper)
```

## 5. 資料模型 (Data Model)
所有的資料會存在 `localStorage` 的 `diaryAppData` key 中。
```javascript
{
  version: 1,
  memos: [
    {
      id: 1717345600000,           // Timestamp
      date: "2026-06-03",          // YYYY-MM-DD
      content: "開會討論\n- [ ] 準備簡報\n- [x] 確認會議時間", 
      images: [],                  // 圖片 Base64 或 URL (視實作而定)
      createdAt: "2026-06-03T12:00:00.000Z",
      updatedAt: "2026-06-03T12:00:00.000Z"
    }
  ],
  settings: {
    theme: "light"
  }
}
```

## 6. 架構原則 (Architectural Principles)
- **同日卡片整合**: 減少零碎的卡片數量，透過 `storage.js` 在儲存時判斷是否為「追加(Append)」模式。
- **所有資料皆可修改與刪除**: 比照 `charge_app`，卡片點擊後會進入修改/刪除表單，不會有無法修改的僵屍資料。
- **單一 CSS**: 所有樣式集中於 `css/style.css`，避免拆分過細。
- **單層 JS 目錄**: 業務邏輯按模組化分檔，不建立深層結構。
- **直接操作 DOM**: 不依賴虛擬 DOM，透過簡單的 HTML 字串拼接或 `document.createElement` 進行渲染。
- **離線優先**: `service-worker.js` 會預先快取所有的 HTML、CSS 與 JS 檔案。

## 7. 介面微調與修正紀錄 (UI Tweaks & Fixes)
- **Checkbox 間距調整**: 將 `.todo-item` 的 `margin-bottom` 縮減為 `4px`，`gap` 縮減為 `8px`，讓代辦清單更加緊湊。
