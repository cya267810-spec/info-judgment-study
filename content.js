/* =====================================================================
   content.js：所有呈現給受試者的文字、題目、設定都在這個檔。
   改文字只要改這裡，不必動 app.js。
   六版文本（VERSIONS）與判斷題題池（POOL）由 tools/build_content.py
   從《第三章_研究方法_v6》表 3-2 與《附錄_v1》附錄三逐字帶入，請勿手改；
   要改請改原始檔後重新執行 build_content.py。
   2026-10-18：依第三章 v11（Downloads\第三章_研究方法.docx）與附錄更新研究二流程與題項
   （Krell 認知負荷量表兩次施測、T0/T1/T1b/T2 理解自評、達成標準頁、身分與行業題、解釋滿意度量表 7 題）。
   六版文本與判斷題題池已和第三章 v11 表 3-3、附錄三核對，內容未變。
   2026-10-18：真實訊息 G01、G03、G04、G05、G06、G08、G09、G11 依研究者決定替換為證券商官方網頁原文（同步改附錄三，本檔直接修改 POOL）。
   2026-10-18：詐騙訊息 F02、F03、F04、F05、F07、F08、F10 與真實訊息 G02 依研究者決定替換為可逐字查證之原文（證交所反詐騙聯防專區通報、法院判決、凱基證券網頁）。
   2026-10-18：為使題目資訊足以判斷並縮小兩類長度差距，G01、G03、G05、G06、G08、G09、G10 改為同來源較完整之連續原文，F09、F11、F12 改為判決所載較長原文；F03、F04 改為 PTT 使用者張貼之詐騙群組截圖圖片文字。
   ===================================================================== */
window.CONTENT = {

  /* ---------- 研究者設定（上線前要填） ---------- */
  CONFIG: {
    DATA_ENDPOINT: "https://script.google.com/macros/s/AKfycbyKC1KDTy-IBkfIUqMwTgHj2zT7wlbv2J7jRaAMFE1P-7rMm5JHghUYyiN4Sb3pLaxm5A/exec",      // 作答資料 Apps Script 網址（Code.gs，2026-10-19 部署）
    CONTACT_ENDPOINT: "https://script.google.com/macros/s/AKfycbzrDGDZaNDTCyT5YFW4ozYcce-jH6sVIzuYfjvDnQ8u-0DRvaJ3P2VMToYOOZbgRyRR/exec",   // 聯絡資料 Apps Script 網址（Contact.gs，2026-10-19 部署）
    SHARED_SECRET: "l7F6luw7Q4IvCCqoec5a5jT8FbW28rSw", // 兩支 Apps Script 也要填同一組
    JUDGMENT_ORDER: "random",  // 依 Kubilay et al. (2023)：訊息順序於受試者層次隨機排列
    FINAL_ITEMS: [],           // 【待提供】前測項目分析後保留的 20 題題號，例如 ["F01","G03",...]；空白時研究一、二暫用題池前 10＋前 10
    // 指導語與預估題的題數＝實際題數（Moore & Healy, 2008：預估範圍 0 到實際題數）
    N_IN_INSTRUCTIONS: { pretest: 24, s1: 20, s2: 20 },
    STANDARD_K: null,          // 【待提供】判斷任務達成標準：前測參與者在保留之 20 則正式題上的答對題數中位數（表 3-4）；研究一、二上線前必填

    // 回上一頁：每頁都有按鈕，回去時已選的答案會保留。列在這裡的頁面不能再回去修改（例如 ["T1","T1b","P13","P8"]）；空白＝全部可回
    BACK_BLOCKED: [],

    BRACKET_DISPLAY: "gray",   // ［ ］為版面標示（附錄三），以灰色文字原樣顯示，表示原訊息附有圖片或表格
    AI_NAME: "AI 助理",        // 研究者決定（中性名稱，不用真實品牌）
    INSTITUTION: "國立臺中科技大學企業管理系碩士班",   // 校名用「臺」，依該校 115 學年度學位名稱公告
    RESEARCHER_NAME: "黃晨語",
    RESEARCHER_EMAIL: "cya267810@gmail.com",
    ADVISOR: "",               // 【待提供】指導教授姓名與聯絡方式，例如「○○○ 教授（Email）」；成大人類研究倫理審查委員會範例：學位論文須加填指導教授姓名及聯絡方式
    ANSWER_URL: "【待提供：公布答案的網址】",
    ANSWER_QR_IMG: "qr.png"    // 【待提供】由 ANSWER_URL 產生的 QR code 圖檔（放在本資料夾）
  },

  MODES: {
    pretest: { label: "前測", time: "約 45 分鐘" },
    s1: { label: "研究一", time: "約 25 至 30 分鐘" },
    s2: { label: "研究二", time: "約 35 至 40 分鐘" }
  },

  /* ---------- P1 知情同意（網頁摘要；紙本已簽署） ---------- */
  CONSENT: {
    title: "資訊理解與判斷研究",
    // 2026-10-18 重寫。事項依第三章第四節（人體研究法第 14 條、APA 8.02）；先列關鍵資訊（Common Rule 45 CFR 46.116(a)(5)：
    // 自願、目的、時間與程序、風險、益處），再列其餘事項。
    // 「部分細節結束後說明、可撤回資料」依 APA 8.07 與 Texas A&M HRPP (2023) 未完整揭露的範例用語改寫；
    // 不寫須說明詐騙如何運作（第三章第四節，Rozenblit & Keil, 2002），不寫研究假設與操弄。
    // {INST}{NAME}{EMAIL} 取自 CONFIG；倫理中心聯絡方式取自 rrec.cmu.edu.tw（2026-10-18 查）。正式施測前須與 REC 核准版一致。
    summaryHTML:
      "<p>你已在紙本同意書上簽名。以下是同意書的重點，請再看一次：</p><ul>" +
      "<li><b>自願參與</b>：參與完全自願。你可以隨時退出，不需要說明理由，也不會受到任何不利影響。</li>" +
      "<li><b>研究內容</b>：這是一項關於資訊理解與判斷的研究。你會在電腦上閱讀一段情境與一段由生成式AI產生的文字，判斷一組投資相關訊息，並回答數個問題，包括選擇題與簡短的文字作答。全程{TIME}。</li>" +
      "<li><b>結束後的說明</b>：為了不影響作答，有些研究細節會在你作答結束後才完整說明。屆時如果你不希望使用你的資料，可以要求撤回。</li>" +
      // 不寫「詐騙」以免作答前的提示效果（Lain et al., 2025 釣魚研究：研究說明不提及會接觸釣魚訊息，為此類研究常見做法）；
      // 仍如實說明可能的不適，不寫不實內容（Duke 研究倫理政策：同意書不得含欺瞞）；哪些訊息為詐騙於解說頁說明（Greene & Murphy, 2023）
      "<li><b>可能的不適</b>：你會讀到一些投資相關訊息，部分內容可能使你感到些許不安。本研究不涉及任何真實的金錢往來；若感到不適，可隨時停止。</li>" +
      "<li><b>益處</b>：參與本研究不會為你帶來直接的利益。</li>" +
      "<li><b>酬勞</b>：凡到場參與者均致贈 7-ELEVEN 禮券新臺幣 100 元。</li>" +
      "<li><b>保密</b>：作答只以編號記錄，不包含姓名或 Email；你填寫的 Email 另外存放，無法與作答資料連結。結果只以整體統計呈現。資料於研究結束後保存三年，屆滿後銷毀。</li>" +
      // 聯絡方式分兩條：研究問題找研究人員、權益諮詢或申訴找倫理單位（成大人類研究倫理審查委員會問卷說明頁範例；臺大行為與社會科學研究倫理委員會同意書範本）
      "<li><b>研究問題</b>：對研究內容有任何疑問，可聯絡研究人員：{INST}研究生{NAME}（Email：{EMAIL}）{ADVISOR}。</li>" +
      "<li><b>權益諮詢或申訴</b>：若想諮詢或申訴參與研究的權益，可聯絡中國醫藥大學暨附設醫院研究倫理中心（電話：04-22052121 分機 11941、11942；E-mail：rrec@mail.cmu.edu.tw）。</li></ul>",
    checkbox: "我已閱讀並了解以上說明，並同意參與本研究。"
  },

  /* ---------- 結束頁（篩除、不同意） ---------- */
  SCREEN_END: "謝謝你撥空參加。依據本研究的參與條件，你這次不需要繼續作答。請通知施測人員，施測人員會協助你後續事宜。",

  /* ---------- P2-0 Email ---------- */
  EMAIL: {
    intro: "請填寫你的 Email。你的 Email 會保密，並與你的作答分開存放，無法與你的作答資料連結；只用來確認你沒有重複參加本研究。", // 依 Pacific University IRB 範例用語改寫
    label1: "Email：",
    label2: "再輸入一次確認：",
    errMismatch: "兩次輸入的 Email 不一致，請再確認。",
    errFormat: "Email 格式不正確，請再確認。",
    checking: "確認中，請稍候……"
  },

  /* ---------- P2 資格篩選 ---------- */
  AGE: { q: "請問你目前幾歲？", unit: "歲（須年滿 18 歲）", min: 18 },  // OECD (2022) QD7：Minimum value = 18
  /* 生成式AI使用
     1. 頻率：Reuters Institute AI_branduse 的題幹與選項（Simon et al., 2025；第三章原用），由逐項工具改為整體一題；
        加「過去 12 個月內」與 AI 摘要不算使用；選「從未使用」者結束實驗。計分 每天 4、每週 3、每月 2、一兩次 1。
     2. 使用過哪些：Verasight (2026) June 2026 AI Survey Q2（Select all that apply）的工具清單；
        時間範圍由「過去 30 天」改為「過去 12 個月」，刪「都沒有」（使用者才作答），增列「其他（請寫出）」。
     3. AC2：Meade & Craig (2012) 指示型題目，單獨一題，選項同頻率題。 */
  AIUSE: {
    freqQ: "過去 12 個月內，你使用生成式AI聊天機器人或工具（不論用途）的頻率大約是？（只在 Google 搜尋結果中看到 AI 摘要或 AI 模式，不算使用）",
    freqOpts: ["每天", "每週", "每月", "一兩次", "從未使用"],
    freqScore: { "每天": 4, "每週": 3, "每月": 2, "一兩次": 1 },
    never: "從未使用",
    toolsQ: "過去 12 個月內，你使用過下列哪些生成式AI工具？（可複選）",
    tools: ["ChatGPT（OpenAI）", "Google Gemini", "Meta AI", "Microsoft Copilot", "Claude（Anthropic）", "Grok（xAI）", "DeepSeek", "Perplexity"],
    otherLabel: "其他（請寫出名稱）：",
    toolsErr: "請至少勾選一項，或在「其他」寫出名稱。",
    ac2Q: "為了確保資料品質，這一題請選「每月」。",
    ac2Correct: "每月"
  },

  /* ---------- P3 人口統計與投資經驗 ---------- */
  /* 人口統計：第三章第二節四、附錄二（三）。QD1 取自 OECD (2022)；身分與行業為研究者自編（行業採主計總處 2021 第 11 次修正 19 大類） */
  DEMO: [
    { id: "QD1", q: "你的性別是？", opts: ["男", "女", "其他", "不願回答"] },
    { id: "status", q: "你目前的主要身分是？", opts: ["學生（目前就讀高中職、大專院校或研究所）", "社會人士（包括在職、待業、退休、家管等）", "不願回答"] },
    { id: "A3", q: "不包括退休金帳戶（例如勞工退休金個人專戶），你目前是否持有任何股票、債券、基金（含 ETF）或其他有價證券的投資？",
      opts: ["是", "否", "不知道", "不願回答"] }
  ],
  INDUSTRY: {
    showIf: "社會人士（包括在職、待業、退休、家管等）",
    q: "你目前工作的行業是？如果目前沒有工作，請選最後一項。",
    opts: ["農、林、漁、牧業", "礦業及土石採取業", "製造業", "電力及燃氣供應業", "用水供應及污染整治業", "營建工程業", "批發及零售業",
           "運輸及倉儲業", "住宿及餐飲業", "出版影音及資通訊業", "金融及保險業", "不動產業", "專業、科學及技術服務業", "支援服務業",
           "公共行政及國防；強制性社會安全", "教育業", "醫療保健及社會工作服務業", "藝術、娛樂及休閒服務業", "其他服務業",
           "目前沒有工作（待業、退休、家管等）", "不願回答"]
  },
  B30: {
    intro: "以下問題是關於你在退休金帳戶以外的投資。",
    q: "你最早是在多久以前開始在退休金帳戶以外投資？",
    opts: ["未滿 1 年前", "1 年至未滿 2 年前", "2 年至未滿 3 年前", "3 年至未滿 5 年前", "5 年至未滿 10 年前", "10 年前或更早", "不知道"]
  },

  /* ---------- P4 金融素養（OECD, 2022） ---------- */
  FINLIT: {
    intro: "有五位兄弟將獲得共新臺幣 1,000 元的禮金，由他們平分。",
    items: [
      { id: "QK3", type: "choice", q: "現在請想像，這幾位兄弟必須等一年才能拿到各自分得的錢，而這一年的通貨膨脹率維持在 1.66%。一年後，他們用分得的錢能買到：",
        opts: ["a) 比現在更多的東西", "b) 一樣多的東西", "c) 比現在更少的東西", "不知道"], correct: "c) 比現在更少的東西" },
      { id: "QK4", type: "number", q: "某天晚上你借給朋友新臺幣 25 元，他隔天還你 25 元。他為這筆借款付了多少利息？", unit: "元", correct: 0 },
      { id: "QK5", type: "number", q: "想像某人把新臺幣 100 元存進一個免手續費、免稅、保證年利率 2% 的儲蓄帳戶。之後他不再存入，也不提領。第一年底入帳利息後，帳戶裡會有多少錢？", unit: "元", correct: 102 },
      { id: "QK6", type: "choice", q: "那麼五年後帳戶裡會有多少錢？是：",
        opts: ["a) 超過 110 元", "b) 剛好 110 元", "c) 少於 110 元", "d) 依現有資訊無法判斷", "不知道"], correct: "a) 超過 110 元" },
      { id: "QK7_1", type: "tf", q: "高報酬的投資很可能也是高風險的。", correct: "對" },
      { id: "QK7_2", type: "tf", q: "高通貨膨脹表示生活成本快速上升。", correct: "對" },
      { id: "QK7_3", type: "tf", q: "買進多種不同的股票，通常可以降低投資股市的風險。", correct: "對" }
    ],
    tfStem: "請判斷下列各敘述是對還是錯。",
    tfOpts: ["對", "錯", "不知道"],
    dk: "不知道"
  },

  /* ---------- P5 注意力檢核 1 ---------- */
  AC1: { q: "請選擇「完全沒有信心」。", opts: ["完全沒有信心", "有一點信心", "中等信心", "有信心", "非常有信心"], correct: "完全沒有信心" },

  /* ---------- P6 四格漫畫 ---------- */
  COMIC: {
    // 2026-10-18 改回舊網頁 experiment1.html 的 5 張原圖（comic/leo1–5.jpg）與說明文字、對白；說明文字中的「爸爸」依研究者決定改為「家人」、第 3 格「投資老師」改為「投資公司經理」以與目標訊息一致（2026-10-18），其餘逐字沿用；
    // 呈現方式也沿用 experiment1：一次一格、替換式，圖下方為說明文字，第 5 格另有對白泡泡，看完最後一格才能繼續。
    // 舊的四格 SVG 版移至 comic/old_4panel/。
    intro: "下面的情境分成幾格。看完一格，再點「看下一格」，畫面會換到下一格。",
    nextBtn: "看下一格（{i} / {n}）→",
    doneNote: "（看完了）",
    doneBtn: "看完了，繼續",
    panels: [
      { img: "comic/leo1.jpg", cap: "家人最近被朋友拉進一個「投資群組」。", bubble: null },
      { img: "comic/leo2.jpg", cap: "群組裡每天有人曬獲利對帳單，家人看得心動。", bubble: null },
      { img: "comic/leo3.jpg", cap: "一位自稱投資公司經理的人私訊家人，推一檔「未上市生技股」，要家人把錢匯到指定帳戶。", bubble: null },
      { img: "comic/leo4.jpg", cap: "家人正準備轉帳，手指卻停在確認鍵上，有點猶豫。", bubble: null },
      { img: "comic/leo5.jpg", cap: "家人把手機轉向你——", bubble: "你幫我看看，這是真的嗎？" }
    ]
  },

  /* ---------- P7 / P13 預估 ---------- */
  PREDICT: { q: "等一下你會看到 {N} 則投資相關訊息，請判斷每則是不是詐騙。你認為自己能正確判斷幾則？", unit: "則" },

  /* ---------- P8 目標訊息與 AI 回覆 ---------- */
  TARGET_MESSAGE: [
    { t: "text", s: "【○○生技　內部認購通知】", bold: true },
    { t: "text", s: "您好，我是○○投資的經理。○○生技目前還沒上市，這次透過內部管道釋出一批員工認購額度，想優先通知您。" },
    { t: "files", items: [["file", "公司簡介.pdf", ["img/company_profile.svg"]], ["img", "產品照片 ×3", ["img/product1.svg", "img/product2.svg", "img/product3.svg"]], ["img", "近三年營收圖表 ×2", ["img/revenue1.svg", "img/revenue2.svg"]]] },
    { t: "text", s: "認購後每月穩定領 20% 獲利，本金保證不會虧損，我們會跟您簽正式的認購合約。" },
    { t: "files", items: [["file", "股權認購合約.pdf", ["img/contract.svg"]]] },
    { t: "text", s: "我們的投資群組現在有兩百多位會員，每天都有人在群組分享入帳截圖。" },
    { t: "files", items: [["img", "會員獲利截圖 ×3", ["img/profit1.svg", "img/profit2.svg", "img/profit3.svg"]]] },
    { t: "text", s: "這批額度只剩最後 3 個名額，今晚 10 點準時截止報名，再不匯款名額就要撥給別人了。" },
    { t: "text", s: "認購款請匯至以下帳戶：\n戶名：○○○\n銀行：○○銀行\n帳號：○○○-○○○-○○○○○○\n最後匯款期限：今晚 10:00 前" }
  ],
  AI_OPEN: "你貼的這則未上市生技股投資訊息我看過了。我把幾個判斷的重點整理成下面五項，你可以一項一項看：",
  AI_CLOSE: "我不是專業投資顧問，以上只是根據訊息內容的判斷。最終還是請你自己決定；投資前多方查證、對「保證獲利」或「私下匯款」的要求保持警覺，通常比較穩妥。",
  VERSIONS: {
 "A": {
  "depth": -1,
  "concrete": 1,
  "items": [
   {
    "head": "還沒上市的股票",
    "body": "這檔股沒在證交所掛牌，所以沒有公開行情可以比價；訊息還附了公司簡介、產品照片和兩張年度營收圖表。"
   },
   {
    "head": "要你私下匯款",
    "body": "他要你匯到個人帳戶，所以錢很難追查；訊息最後附上一組帳號，戶名是一個陌生人名，還寫了最後匯款期限。"
   },
   {
    "head": "群組貼獲利截圖",
    "body": "群組裡一直有人貼獲利截圖，讓你以為大家都在賺；這些人多是暗樁，群組有兩百多人，每天都有很多貼文。"
   },
   {
    "head": "限時限名額",
    "body": "他強調名額有限、今天截止，讓你沒時間查證或問家人；訊息寫著只剩三個名額，晚上十點準時截止報名。"
   },
   {
    "head": "保證穩賺又高報酬",
    "body": "報酬越高風險越高，所以保證高報酬不可能是真的；訊息寫著每月穩定領兩成、本金不會虧損，還附上一份正式合約。"
   }
  ]
 },
 "B": {
  "depth": -1,
  "concrete": -1,
  "items": [
   {
    "head": "未上市投資標的",
    "body": "標的未於證交所掛牌，所以價格缺乏公開依據；訊息另附公司簡介、產品圖片與兩份近三年度營收圖表資料。"
   },
   {
    "head": "指定收款管道",
    "body": "款項須匯入個人名義帳戶，所以追查的難度極高；訊息末段附有收款帳號、陌生個人戶名與最後匯款期限說明。"
   },
   {
    "head": "群體獲利展示",
    "body": "群組持續出現獲利截圖，使普遍獲利的印象形成；成員多屬詐團暗樁，群組規模逾兩百人，每日貼文數量龐大。"
   },
   {
    "head": "時限與名額條件",
    "body": "名額有限與當日截止的強調，使查證與商量的時間不足；名額據稱僅剩三個，截止時間為當晚十點整。"
   },
   {
    "head": "報酬與本金承諾",
    "body": "高報酬必然伴隨高風險，所以保證高報酬並不可信；承諾內容為每月兩成固定獲利、本金零虧損，並附正式的合約文件。"
   }
  ]
 },
 "C": {
  "depth": 0,
  "concrete": 1,
  "items": [
   {
    "head": "還沒上市的股票",
    "body": "這檔股沒在證交所掛牌，所以只能私下買賣，因此沒有公開行情可以比價；訊息還附了公司簡介和產品照片。"
   },
   {
    "head": "要你私下匯款",
    "body": "他要你匯到個人帳戶，錢一匯出就被層層轉進別的人頭帳戶，所以很難追查；收款戶名是一個陌生的個人名字。"
   },
   {
    "head": "群組貼獲利截圖",
    "body": "群組裡一直有人貼獲利截圖，讓你以為大家都在賺，於是放下戒心；這些人多是暗樁，群組有兩百多位成員。"
   },
   {
    "head": "限時限名額",
    "body": "他強調名額有限、今天截止，讓你沒時間查證或問家人，於是只能憑衝動判斷；訊息寫著只剩下三個名額。"
   },
   {
    "head": "保證穩賺又高報酬",
    "body": "報酬越高風險越高，所以保證高報酬不可能是真的，因此獲利只能來自新加入者的錢；訊息寫著每月可以穩定領兩成。"
   }
  ]
 },
 "D": {
  "depth": 0,
  "concrete": -1,
  "items": [
   {
    "head": "未上市投資標的",
    "body": "標的未於證交所掛牌，所以交易僅限私下轉讓，因此價格缺乏公開依據；訊息另附公司簡介與產品介紹圖片。"
   },
   {
    "head": "指定收款管道",
    "body": "款項須匯入個人名義帳戶，資金一經匯出就經多層人頭帳戶移轉，所以追查的難度極高；戶名為陌生個人姓名。"
   },
   {
    "head": "群體獲利展示",
    "body": "群組持續出現獲利截圖，使普遍獲利的印象形成，於是警覺程度下降；成員多屬詐團暗樁，群組規模逾兩百人。"
   },
   {
    "head": "時限與名額條件",
    "body": "名額有限與當日截止的強調，使查證與商量的時間不足，於是判斷流於衝動；名額據稱目前僅剩三個。"
   },
   {
    "head": "報酬與本金承諾",
    "body": "高報酬必然伴隨高風險，所以保證高報酬並不可信，因此獲利來源僅能是新加入者資金；承諾內容為每月兩成固定獲利。"
   }
  ]
 },
 "E": {
  "depth": 1,
  "concrete": 1,
  "items": [
   {
    "head": "還沒上市的股票",
    "body": "這檔股沒在證交所掛牌，所以只能私下買賣，因此沒有公開行情可以比價，一旦買貴了，也很難再轉賣出去。"
   },
   {
    "head": "要你私下匯款",
    "body": "他要你匯到個人帳戶，錢一匯出就被層層轉進別的人頭帳戶，車手再臨櫃提領現金使金流中斷，所以很難追查。"
   },
   {
    "head": "群組貼獲利截圖",
    "body": "群組裡一直有人貼獲利截圖，讓你以為大家都在賺，於是放下戒心，結果跟著把錢投進去；這些人多是暗樁。"
   },
   {
    "head": "限時限名額",
    "body": "他強調名額有限、今天截止，讓你沒時間查證或問家人，於是只能憑衝動判斷，結果匆匆忙忙把錢匯出去。"
   },
   {
    "head": "保證穩賺又高報酬",
    "body": "報酬越高風險越高，所以保證高報酬不可能是真的，因此獲利只能來自新加入者的錢，一旦新錢不夠就拒絕你的出金。"
   }
  ]
 },
 "F": {
  "depth": 1,
  "concrete": -1,
  "items": [
   {
    "head": "未上市投資標的",
    "body": "標的未於證交所掛牌，所以交易僅限私下轉讓，因此價格缺乏公開依據，一旦以高價買進，轉售也相當困難。"
   },
   {
    "head": "指定收款管道",
    "body": "款項須匯入個人名義帳戶，資金一經匯出就經多層人頭帳戶移轉，經提領後使金流中斷，所以追查的難度極高。"
   },
   {
    "head": "群體獲利展示",
    "body": "群組持續出現獲利截圖，使普遍獲利的印象形成，於是警覺程度下降，結果促成資金投入；成員多屬詐團暗樁。"
   },
   {
    "head": "時限與名額條件",
    "body": "名額有限與當日截止的強調，使查證與商量的時間不足，於是判斷流於衝動，結果演變為倉促的匯款。"
   },
   {
    "head": "報酬與本金承諾",
    "body": "高報酬必然伴隨高風險，所以保證高報酬並不可信，因此獲利來源僅能是新加入者資金，一旦新資金不足就會拒絕出金。"
   }
  ]
 }
},
  READ_DONE: "我讀完了，繼續",

  /* ---------- P9 機制深度檢核（僅前測） ---------- */
  MC: {
    // 解釋滿意度量表全部 7 題（Hoffman et al., 2023；第三章第二節三（六）、附錄二（七））；檢核分數為 7 題平均
    intro: "以下所有問題都是關於你剛才閱讀的 AI 分析。請選出最符合你看法的選項。",
    items: [
      { id: "MC_D1", q: "看完這段 AI 分析，我知道這則訊息的詐騙手法是如何運作的。" },
      { id: "MC_D2", q: "這段 AI 分析對詐騙手法如何運作的說明，令人滿意。" },
      { id: "MC_D3", q: "這段 AI 分析對詐騙手法如何運作的說明，細節足夠。" },
      { id: "MC_D4", q: "這段 AI 分析對詐騙手法如何運作的說明，看起來是完整的。" },
      { id: "MC_D5", q: "這段 AI 分析對詐騙手法如何運作的說明，告訴我如何運用這些分析。" },
      { id: "MC_D6", q: "這段 AI 分析對詐騙手法如何運作的說明，對我的目標有用。" },
      { id: "MC_D7", q: "這段 AI 分析讓我知道這個 AI 助理的判斷有多準確。" }
    ],
    opts: ["非常同意", "有點同意", "普通", "有點不同意", "非常不同意"],
    score: { "非常同意": 5, "有點同意": 4, "普通": 3, "有點不同意": 2, "非常不同意": 1 }
  },

  /* ---------- P10 處理流暢度（僅前測） ---------- */
  FLUENCY: {
    stem: "閱讀這段 AI 分析的過程是……",
    items: [
      { id: "FL1", left: "困難", right: "容易" },
      { id: "FL2", left: "不流暢", right: "流暢" },
      { id: "FL3", left: "費力", right: "不費力" },
      { id: "FL4", left: "難以理解", right: "可以理解" },
      { id: "FL5", left: "不清楚", right: "清楚" }
    ]
  },

  /* ---------- 認知負荷量表（Krell, 2015, 2017；第三章第二節四、附錄二（十）） ----------
     閱讀解釋後（read）與判斷任務後（judge）各施測一次，12 題，1–7；rev＝反向題（8 減原分數）。
     sub：ML＝以任務為中心之分量表（mental load）；ME＝以人為中心之分量表（mental effort）。 */
  KRELL: {
    intro: {
      read: "我們想了解你覺得剛才閱讀的 AI 分析有多困難。請以整段 AI 分析來回答。你的回答不會影響任何評分。請選出每一句話符合你的程度。",
      judge: "最後，我們想了解你覺得剛才的判斷題整體而言有多困難。請以剛才的整份判斷題來回答，而不是針對其中某一題。你的回答不會影響任何評分。請選出每一句話符合你的程度。"
    },
    items: [
      { n: 1,  sub: "ML", rev: false, read: "這段 AI 分析很難看懂。", judge: "這些判斷題很難回答。" },
      { n: 2,  sub: "ME", rev: true,  read: "閱讀這段 AI 分析時，我很少花心力。", judge: "回答這些判斷題時，我很少花心力。" },
      { n: 3,  sub: "ML", rev: false, read: "這段 AI 分析的內容很複雜。", judge: "這些判斷題的內容很複雜。" },
      { n: 4,  sub: "ML", rev: false, read: "閱讀這段 AI 分析很有挑戰性。", judge: "這些判斷題很有挑戰性。" },
      { n: 5,  sub: "ME", rev: true,  read: "我沒有努力去看懂這段 AI 分析。", judge: "我沒有努力把這些判斷題答對。" },
      { n: 6,  sub: "ML", rev: true,  read: "這段 AI 分析很容易閱讀。", judge: "這些判斷題很容易作答。" },
      { n: 7,  sub: "ME", rev: false, read: "我努力去看懂這段 AI 分析。", judge: "我努力把這些判斷題答對。" },
      { n: 8,  sub: "ML", rev: true,  read: "這段 AI 分析的內容很容易理解。", judge: "這些判斷題的內容很容易理解。" },
      { n: 9,  sub: "ME", rev: false, read: "閱讀這段 AI 分析時，我費了心思思考。", judge: "回答這些判斷題時，我費了心思思考。" },
      { n: 10, sub: "ML", rev: true,  read: "要弄懂這段 AI 分析很容易。", judge: "這些判斷題很容易解答。" },
      { n: 11, sub: "ME", rev: true,  read: "閱讀這段 AI 分析時，我沒有特別專心。", judge: "回答這些判斷題時，我沒有特別專心。" },
      { n: 12, sub: "ME", rev: false, read: "我盡力去看懂這段 AI 分析。", judge: "我盡力解答這些判斷題。" }
    ],
    labels: { 1: "1 完全不符合", 4: "4 中等符合", 7: "7 完全符合" }
  },

  /* ---------- P12 自評 ---------- */
  SELF: {
    q: "你覺得自己對「這種投資詐騙是如何運作的」理解程度有多少？",
    left: "1（理解最淺）", right: "7（理解最深）",
    levels: [
      ["第 1 級", "我能說出這則訊息有哪些可疑之處"],
      ["第 4 級", "我了解每個可疑之處為什麼可疑"],
      ["第 7 級", "我能說明每個可疑之處如何一步步導致受騙或損失，以及它們彼此的關聯"]
    ]
  },

  /* ---------- P14 判斷任務 ---------- */
  JUDGE: {
    intro: "接下來你會看到 {N} 則投資相關訊息（這些訊息 AI 都沒有分析過），其中有些是詐騙。詐騙會試圖取得你的錢或個人資料來進行詐欺。你的任務是辨識哪些訊息是詐騙。",
    q1: "這是詐騙嗎？", yes: "是", no: "否",
    q2: "你認為自己這一題答對的機率是多少？",
    probs: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    probLabels: { 50: "50%（完全是用猜的）", 100: "100%（確定答對）" },
    counter: "第 {i} / {n} 則"
  },
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  // 2026-10-18：判斷題改為「情境導言＋手機畫面」的完整訊息（A＝完整真實訊息逐字、B＝取材自真實案例改編），
  // 由 samples/judge_24.html 轉入；kind／cue／source 只供研究者對照，不顯示給參與者。
  POOL: [
 {
  "id": "F01",
  "answer": "scam",
  "ctx": "你加入了一個 LINE 股票討論群組。某天，群組裡出現了下面這些訊息：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">投資群組</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">助</div><div><div class=\"who\">助理</div><div class=\"bub\">✨後續的各種內幕操作也是直接帶所有新老會員同步操作的，不存在對新會員就有隱晦，不管是今天跟上佈局還是沒有跟上佈局的朋友大家一定要持續關注我們的【金創計劃】，大家有什麼不明白的可以私訊我唷，我替老師幫你解決問題，另外這是開戶專員的Line名片，可以先添加開通，下週資金準備好後，大家一起跟上開始新的征程，同時下週也會增加隔日沖的操作❤️</div></div><span class=\"time\">15:18</span></div>\n<div class=\"msg\"><div class=\"av\"> </div><div class=\"namecard\"><div class=\"lg\"></div><b>○○通寶-○經理</b><div class=\"jbtn\">查看個人檔案</div></div><span class=\"time\">15:18</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L2 準備資金開戶",
  "source": "來源：Tan1sVaca（2024 年 8 月 11 日）。Re: [新聞] 投資詐騙line群組臥底實錄。PTT 批踢踢實業坊 Stock 板。https://www.ptt.cc/bbs/Stock/M.1723358534.A.7DE.html 處理：截圖 hk98ZWe，逐字；公司與人名去識別。",
  "sample": "F01"
 },
 {
  "id": "F02",
  "answer": "scam",
  "ctx": "你加入了一個 LINE 股票討論群組。某天，群組裡出現了下面這些訊息：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">投資群組</div><div class=\"jchat\"><div class=\"msg\"><div class=\"av\">助</div><div><div class=\"who\">助理</div>\n<div class=\"imgcard red\"><div class=\"t\">新股申購</div><div class=\"pill\">投標日期：08/21~08/23</div><div class=\"pill\">【○○○○ ○○○○】</div>\n<div class=\"jrow\"><div class=\"cell\"><small>抽籤日</small>08/27</div><div class=\"cell\"><small>撥券日</small>09/02</div><div class=\"cell\"><small>承銷價</small>75</div></div>\n<div class=\"jrow\"><div class=\"cell\"><small>市價</small>134.5</div><div class=\"cell\"><small>單張獲利</small>59500</div><div class=\"cell\"><small>報酬率</small>79.3%</div></div>\n<div class=\"big\">抽中一張獲利59500</div><div class=\"big\">抽中十張獲利595000</div></div>\n</div></div></div></div>",
  "kind": "A",
  "cue": "L1 新股＋L5 獲利",
  "source": "來源：Tan1sVaca（2024 年 8 月 11 日）。Re: [新聞] 投資詐騙line群組臥底實錄。PTT 批踢踢實業坊 Stock 板。https://www.ptt.cc/bbs/Stock/M.1723358534.A.7DE.html 處理：截圖 QeWi7Qq，全部文字逐字；股票名稱原圖已馬賽克。",
  "sample": "F02"
 },
 {
  "id": "F03",
  "answer": "scam",
  "ctx": "你加入了一個 LINE 股票討論群組。某天，群組裡出現了下面這些訊息：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">投資群組</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">助</div><div><div class=\"who\">助理</div><div class=\"bub\">🎯 ○○○○ 📈停利通知❗❗❗\n進場點位：86.4💹\n停利價位：100💯\n獲利趴數：15.7%👍\n💰恭喜跟上操作的學員~💰\n💰現在賣出獲利即可~💰\n💰也可停利一半剩餘資金賺取更多利潤💰\n🌹現在市場正處於歷史高點 上下震盪的幅度預計會更大 記得關注我的訊息 以免錯過最佳的買賣點哦🌹</div></div><span class=\"time\">09:17</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 A</div><div class=\"bub\">哈哈收到，今天又是跟著老師賺飽飽的一天</div></div><span class=\"time\">09:22</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 B</div><div class=\"bub\">老師太厲害了</div></div><span class=\"time\">09:26</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 C</div><div class=\"bub\">○○賺兩個漲停板👍</div></div><span class=\"time\">09:30</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 D</div><div class=\"bub\">老師昨天沒有停利是因為有提前知道內線消息嗎</div></div><span class=\"time\">09:34</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 E</div><div class=\"bub\">我想應該是的，不然怎麼會把握的這麼精準</div></div><span class=\"time\">09:38</span></div>\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 F</div><div class=\"bub\">這要是說老師沒點內線消息 我都不信</div></div><span class=\"time\">09:43</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L3 曬獲利＋內線消息",
  "source": "來源：Tan1sVaca（2024 年 8 月 11 日）。Re: [新聞] 投資詐騙line群組臥底實錄。PTT 批踢踢實業坊 Stock 板。https://www.ptt.cc/bbs/Stock/M.1723358534.A.7DE.html 處理：截圖 blXZ7Hc，逐字；股票名稱原圖已馬賽克，成員名稱去識別。",
  "sample": "F03"
 },
 {
  "id": "F04",
  "answer": "scam",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">○經理</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">您好，我是○○通寶證券的開戶專員○經理，很高興為您服務，請問您是需要開通帳戶，對嗎？</div><span class=\"time\">18:02</span></div>\n<div class=\"msg me\"><span class=\"time\">已讀 18:30</span><div class=\"bub\">要如何參與金創計劃呢？</div></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">您了解這個金創計劃嗎？如果不了解，您可以向○○助理了解下，再來找我開戶</div><span class=\"time\">18:33</span></div>\n<div class=\"msg me\"><span class=\"time\">已讀 18:34</span><div class=\"bub\">已了解了</div></div>\n<div class=\"msg me\"><span class=\"time\">已讀 18:35</span><div class=\"bub\">如何開戶呢？</div></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">您是安卓手機 還是蘋果手機</div><span class=\"time\">18:35</span></div>\n<div class=\"msg me\"><span class=\"time\">已讀 18:35</span><div class=\"bub\">安卓</div></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">1.點選○○通寶證券開戶推薦連結（複製到google打開），進入○○通寶證券上開戶頁面並透過手機下載○○通寶證券-「線上開戶」APP\nhttps://app.○○○○.top/○○○○/<div class=\"linkcard\"><b>GoFPB</b><br>GoFPB 大小：5M ?安全認證 免費安裝 4.9 5230個評分 18+ 年齡 1、安卓手...</div></div><span class=\"time\">18:36</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">下載好之後和我說，我教您進行帳戶註冊</div><span class=\"time\">18:36</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L2 非正規平台開戶",
  "source": "來源：Tan1sVaca（2024 年 8 月 11 日）。Re: [新聞] 投資詐騙line群組臥底實錄。PTT 批踢踢實業坊 Stock 板。https://www.ptt.cc/bbs/Stock/M.1723358534.A.7DE.html 處理：截圖 sjtq5kA，逐字；公司、人名去識別，網址遮蔽；省略兩張 App 頁面截圖。綠色對話框為收訊者（發文者臥底）的回覆。",
  "sample": "F04"
 },
 {
  "id": "F05",
  "answer": "scam",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">○○○</div><div class=\"jchat\">\n<div style=\"align-self:center;background:rgba(0,0,0,.18);color:#fff;border-radius:999px;font-size:11px;padding:2px 10px\">今天</div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">早安，我是○○○，請問你是來領取飆股還是有持股需要診斷？</div><span class=\"time\">上午 8:34</span></div>\n<div class=\"msg me\"><span class=\"time\">已讀<br>下午 1:23</span><div class=\"bub\">是 飆股 嗎？</div></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">對，請問是來領取飆股還是有持股需要診斷？</div><span class=\"time\">下午 1:26</span></div>\n<div class=\"msg me\"><span class=\"time\">已讀<br>下午 1:27</span><div class=\"bub\">飆股</div></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">每日9點前 我的助理會在群組公佈 我精選的飆股。不管是停利還是停損，也會讓助理第一時間傳給大家。你可以先加下我的助理</div><span class=\"time\">下午 1:28</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"namecard\" style=\"text-align:left;display:flex;align-items:center;gap:8px\"><div class=\"av\" style=\"flex:0 0 30px;height:30px\">○</div>○○○　›</div><span class=\"time\">下午 1:28</span></div>\n</div></div>",
  "kind": "A",
  "cue": "免費飆股＋轉加助理",
  "source": "來源：Cofacts 真的假的（2023 年 4 月 18 日 使用者回報）。可疑訊息 z_lClIcBn6k8q-JUB9s2。2026 年 10 月 19 日擷取自 https://cofacts.tw/article/z_lClIcBn6k8q-JUB9s2 處理：使用者上傳的 LINE 私訊截圖，從第一句到最後一句全部逐字，含收訊者的兩句回覆與最後的好友名片；寄件者與助理名稱去識別（原署名冒用知名人士姓名）。Cofacts 尚無查核回應。",
  "sample": "F05"
 },
 {
  "id": "F06",
  "answer": "scam",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">股市聯合資訊</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">股</div><div class=\"bub\">我這邊跟您說，『○○目前已經公發了，準備在今年第三季掛牌』，所以目前有很多創投公司都會把這個投資的部分，都是預備在即將要掛牌的公司，納（那）今天不管是您，還是我，我們都算散戶身分，因為我們沒有像財團or法人一樣的資金，我們就是跟著創投公司的腳步走，我‧才不會虧</div><span class=\"time\">10:12</span></div>\n<div class=\"msg\"><div class=\"av\">股</div><div class=\"bub\">所以這邊跟您報告，○○現在是登錄興櫃前最後一次釋股，所以目前進場有幾個利多，我稍微跟你說一下，第一就是你是既（記）名股東，不是散戶喔</div><span class=\"time\">10:13</span></div>\n<div class=\"msg\"><div class=\"av\">股</div><div class=\"bub\">原始股東的好處就是，你今天手上有10張，公司1配1，你又多10張，股票成本沒有增加</div><span class=\"time\">10:14</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L1 未上市＋L4 最後一次釋股",
  "source": "來源：臺灣高等法院臺中分院 112 年度金上訴字第 2827 號刑事判決（2025 年 6 月 12 日）。司法院裁判書查詢。https://judgment.judicial.gov.tw/FJUD/data.aspx?ty=JD&id=TCHM%2c112%2c%e9%87%91%e4%b8%8a%e8%a8%b4%2c2827%2c20250612%2c1 處理：B 類。判決所載扣案推銷話術教戰守則，同一段話術依序拆成 3 則，逐字（第二、三則為節錄，省略括號內的互動提示）；公司名去識別。補上：原稿的「X先生/小姐」改為「您」、時間。",
  "sample": "F06"
 },
 {
  "id": "F07",
  "answer": "scam",
  "ctx": "你加了一個證券相關的 LINE 帳號。今天收到下面的訊息：",
  "html": "<div class=\"jphone oa\"><div class=\"jbar\">○○證券</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">您的證券帳戶因超過三年未交易，依交易所規定：為維護帳戶安全，列入靜止戶。</div><span class=\"time\">10:12</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">請將身份證正反面拍照傳給我，以便開放帳戶，謝謝！</div><span class=\"time\">10:12</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L2 要身分證照片",
  "source": "來源：Cofacts 真的假的（2020 年 11 月 13 日 使用者回報）。可疑訊息 1337jegooe8r6。2026 年 10 月 19 日擷取自 https://cofacts.tw/article/1337jegooe8r6 處理：全文逐字；原訊息兩行，分成兩個對話框；帳號名稱去識別。Cofacts 查核回應判定為詐騙。",
  "sample": "F07"
 },
 {
  "id": "F08",
  "answer": "scam",
  "ctx": "你加了一個證券相關的 LINE 帳號。今天收到下面的訊息：",
  "html": "<div class=\"jphone oa\"><div class=\"jbar\">台股○○孝親團</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">台</div><div class=\"bub\">您好，歡迎來到台股○○孝親團，這裡是加入社群負責審核的窗口，群內服務包括：\n\n🌟投資資訊交流\n🌟每日台股推薦\n🌟留倉股票諮詢\n🌟財經講師技術教學分享\n🔥金融市場內幕消息\n🔥線上直播教學</div><span class=\"time\">20:05</span></div>\n</div></div>",
  "kind": "A",
  "cue": "內幕消息＋每日推薦",
  "source": "來源：Cofacts 真的假的（2022 年 10 月 19 日 使用者回報）。可疑訊息 3bg5rfenvudrb。2026 年 10 月 19 日擷取自 https://cofacts.tw/article/3bg5rfenvudrb 處理：全文逐字（原訊息即為一則）；名稱去識別。Cofacts 尚無查核回應，研究者依其以「金融市場內幕消息」招攬判定為詐騙。",
  "sample": "F08"
 },
 {
  "id": "F09",
  "answer": "scam",
  "ctx": "你加了一個證券相關的 LINE 帳號。今天收到下面的訊息：",
  "html": "<div class=\"jphone oa\"><div class=\"jbar\">○○投資 在線客服</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">客</div><div class=\"bub\">○○○先生您好,恭喜您\n中籤 ○○○○2張,\n需繳納60000,手續費180,合計60180.今天是最後一個繳款日,請您盡快繳清中籤款</div><span class=\"time\">10:38</span></div>\n<div class=\"msg\"><div class=\"av\">客</div><div class=\"bub\">您好,我們平台都有您的實名以及抽籤記錄的,您如果不認繳產生的後果您需要自行負責的!中籤是很好的事情,中的多就賺的多,請您盡快繳清中籤款項,使帳戶正常操作噢!</div><span class=\"time\">10:46</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L1 中籤＋L2 繳款＋L4 最後一天",
  "source": "來源：Cofacts 真的假的（2023 年 3 月 8 日 使用者回報）。可疑訊息 C_x4wIYBC7Q3lHuU-FH9。2026 年 10 月 19 日擷取自 https://cofacts.tw/article/C_x4wIYBC7Q3lHuU-FH9 處理：使用者上傳的 LINE 截圖，客服的兩則訊息逐字；被害人的兩句提問省略；人名、公司名、股票名去識別。Cofacts 查核回應判定為詐騙。",
  "sample": "F09"
 },
 {
  "id": "F10",
  "answer": "scam",
  "ctx": "你在滑手機時，看到下面這則貼文：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">Facebook</div><div class=\"post\">\n<div class=\"src\"><div class=\"logo\">股市</div><div>股市爆料同學會<small>贊助</small></div></div>\n<div class=\"txt\">這檔目標價100塊起\n現價才3.71塊\n營收非常強，隔日沖籌碼洗得算乾淨\n外資大買，題材加持 族群表現依然強勁\n禮拜一當沖，短線，長線都值得購入...... 查看更多</div>\n<img src=\"judge_img/s1_chart.jpg\" alt=\"\" style=\"width:100%;display:block;border-radius:4px\">\n<div class=\"foot\">FACEBOOK 表單<br><b>歡迎加入股市爆料同學會領取更多潛力股明牌✔️</b><br>👇加入同學會即可提前免費領取同學會的6檔AI概念股，私訊我回復\"領取\"即可...</div>\n</div></div>",
  "kind": "A",
  "cue": "L5 高報酬明牌",
  "source": "來源：Tan1sVaca（2024 年 8 月 11 日）。Re: [新聞] 投資詐騙line群組臥底實錄。PTT 批踢踢實業坊 Stock 板。https://www.ptt.cc/bbs/Stock/M.1723358534.A.7DE.html 處理：截圖 lFOT69C，文字逐字，走勢圖直接裁自原截圖。",
  "sample": "F10"
 },
 {
  "id": "F11",
  "answer": "scam",
  "ctx": "你在滑手機時，看到下面這則貼文：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">Facebook</div><div class=\"post\">\n<div class=\"src\"><div class=\"logo\">證券</div><div>○○證券 - ○○○<small>3月31日</small></div></div>\n<div class=\"txt\">【限時免費領取大盤優股】\n股海茫茫，你還在漂泊不定嗎？\n趕快加入好友跟著大佬一起學投資吧！\n🔥免費個股健檢🔥\n🔥盤前盤後分析🔥\n🔥每日優股分享🔥\n❗更多福利 加緊關注❗\n\n❗❗趕快加入瞭解❗❗</div>\n<div style=\"background:linear-gradient(135deg,#d6e6f2,#f4f8fb);border:6px solid #c62020;border-radius:4px;padding:8px;position:relative\">\n <div style=\"font-size:22px;font-weight:900;color:#e0701c;letter-spacing:2px\">百人群組</div>\n <div style=\"font-size:22px;font-weight:900;color:#e0701c;letter-spacing:2px;text-align:right;margin-right:6px\">千萬創收</div>\n <div style=\"display:flex;gap:8px;margin-top:6px;align-items:flex-end\">\n  <div style=\"background:#06c755;color:#fff;border-radius:6px;padding:6px 4px;font-size:11px;font-weight:800;line-height:1.7;flex:0 0 96px;text-align:center\">\n   <div style=\"font-size:15px\">LINE</div>每日盤前分析<br>每日盤後解析<br>每日優股分享<br>在線專業解惑<br>群友討論分享</div>\n  <div style=\"flex:1;text-align:center\">\n   <div style=\"background:#fff;border-radius:10px;padding:4px;color:#1f9d4a;font-weight:900;font-size:15px;line-height:1.3\">LINE<br>限時加入</div>\n   <div style=\"margin-top:8px;display:flex;align-items:flex-end;justify-content:center;gap:4px\">\n    <div style=\"width:52px;height:64px;border-radius:26px 26px 4px 4px;background:#3b4a63\"></div>\n    <div style=\"background:#f08a24;color:#fff;font-size:10px;font-weight:800;writing-mode:vertical-rl;padding:4px 2px;border-radius:3px\">○○證券資深經理　○○○</div>\n   </div>\n  </div>\n </div>\n <div style=\"background:#c62020;color:#fff;font-weight:900;text-align:right;padding:3px 6px;margin:6px -8px -8px;font-size:14px\">○○證券</div>\n</div>\n<div class=\"foot\">MESSENGER<br><b>在 Messenger 索取更多老朋友</b>　〔發送訊息〕</div>\n</div></div>",
  "kind": "A",
  "cue": "冒用券商名義＋免費＋加 LINE",
  "source": "來源：臺灣證券交易所證券反詐騙聯防行動專區（2026 年 6 月 18 日）。證券商通報專區案件 3448（亞東證券通報）附件，第 2 頁。https://cam.twse.com.tw/antifraud/download/000218_20260618140804.pdf 處理：冒名券商的臉書專頁貼文，文字與圖中文字全部逐字；圖片以模擬圖重繪（真人照片改為剪影）；券商名與人名去識別。",
  "sample": "F11"
 },
 {
  "id": "F12",
  "answer": "scam",
  "ctx": "你在滑手機時，看到下面這則貼文：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">股票 期貨 外匯 基金之操作觀念</div><div class=\"post\">\n<div class=\"src\"><div class=\"logo\" style=\"background:#9aa5b1\">○</div><div>○○○<small>1月3日 · 🌐</small></div></div>\n<div class=\"txt\">散戶們聽好了！！！\n\n刷到的恭喜了，卡到這波直接可以提前過個肥年！\n\n我給的建議：\n\n鴻海（2317）232.00買了\n金居（8358）290.00買了\n群創（3481）18.10必買\n華邦電（2344）90.80必買\n力積電（6770）42.10買了\n友達（2409）12.60掛到必賺\n旺宏（2337）43.35買了\n南亞科（2408）207.00賣了\n南亞（1303）57.00快跑\n緯創（3231）155.00賣了\n富喬（1815）90.70買了必套\n華新（1605）32.90賣了\n神達（3706）90.90賣了\n方土昶（6265）33.45必買\n福懋科（8131）66.70賣了\n康舒（6282）43.80買了\n京元電子（2449）267.50趕緊進場\n元晶（6443）27.75賣了\n\n有很多股友問我：你報牌這麼准，為什麼不收費呢？\n\n因為我早已經財富自由，現在純粹交朋友分享！\n\n群組餘位僅剩26個名額！每天分享個股資料+潛力飆股📈\n\n傳訊我（2026）免費邀请你加入</div>\n<div style=\"font-size:12px;color:#777\">👍 41　　　　　　　　38則留言</div>\n</div></div>",
  "kind": "A",
  "cue": "L5 明牌＋L3 報牌準＋L4 名額",
  "source": "來源：臺灣證券交易所證券反詐騙聯防行動專區（2026 年 6 月 18 日）。證券商通報專區案件 3447（亞東證券通報）附件，第 1–2 頁。https://cam.twse.com.tw/antifraud/download/000218_20260618134044.pdf 處理：臉書社團貼文全文逐字（含原文的「准」「邀请」）；發文者去識別；股票名稱為公開上市公司，保留原文。",
  "sample": "F12"
 },
 {
  "id": "G01",
  "answer": "real",
  "ctx": "你加入了一個 LINE 股票討論群組。某天，群組裡有人分享了下面這篇文章：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">股票討論群組</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 A</div><div style=\"background:#fff;border-radius:12px;overflow:hidden;width:205px;font-size:12.5px\"><img src=\"judge_img/r1_cover.jpg\" alt=\"\" style=\"width:100%;display:block\"><div style=\"padding:6px 8px\"><b style=\"display:block;font-size:13px\">老牌高息ETF股利不減！ 元大高股息（0056）配發0.866元　把握10/22日前進場</b>元大高股息（0056）是台灣第一檔高股息ETF，規模僅次於0050，深受投資人青睞，目前受益人約有155萬、定期定額戶數突破27萬人。<div style=\"color:#888;font-size:11px\">○○sec.com.tw</div></div></div></div><span class=\"time\">20:15</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L5 配息＋L4 期限",
  "source": "來源：玉山證券（2025 年 10 月 2 日）。老牌高息ETF股利不減！ 元大高股息（0056）配發0.866元　把握10/22日前進場。2026 年 10 月 18 日擷取自 https://www.esunsec.com.tw/article/post/423 處理：標題＋重點摘要第一句，逐字；縮圖為原文章封面圖。",
  "sample": "G01"
 },
 {
  "id": "G02",
  "answer": "real",
  "ctx": "你在滑手機時，看到下面這個網頁：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">○○證券交易所 公開申購</div><div class=\"web\">\n<div class=\"brand\">公開申購</div>\n<div class=\"txt\">＊ 申購人匯款作業：申購人於申購截止日前存入申請認購價款、處理費及工本費等供銀行辦理扣款，且中籤後不能放棄認購及要求退還價款，申購處理費20元，中籤通知郵寄工本費50元。\n＊ 未中籤人及不合格申購件之退款作業：證券商應於抽籤日次一營業日將郵寄工本費(50元)及認購價款退回予申購人，申購處理費(20元)不退回。</div>\n<div class=\"dom\">www.○○○○.com.tw</div></div></div>",
  "kind": "A",
  "cue": "L2 匯款與扣款流程",
  "source": "來源：臺灣證券交易所（無日期）。公開申購。2026 年 10 月 18 日擷取自 https://www.twse.com.tw/zh/clearing/activities/ipo.html 處理：四項說明中的第一與第三項，逐字。",
  "sample": "G02"
 },
 {
  "id": "G03",
  "answer": "real",
  "ctx": "你在滑手機時，看到下面這個網頁：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">分享的網頁</div><div class=\"post\">\n<div class=\"src\"><div class=\"logo\">○○</div><div>○○證券<small>用戶故事</small></div></div>\n<div class=\"hl\">股票抽籤，讓我10天獲利20%</div>\n<div class=\"txt\">○○ (36) 上班族\n○○是一位普通上班族。在○○網站上，看到一家即將上櫃的傳產公司，發行新股開放大眾申購。</div>\n<div class=\"dom\">○○.com.tw</div>\n</div></div>",
  "kind": "A",
  "cue": "L1 即將上櫃＋L5",
  "source": "來源：凱基證券（無日期）。公開申購與承銷訊息。2026 年 10 月 18 日擷取自 https://www.kgi.com.tw/zh-tw/product-overview/stock-trading/ipo 處理：用戶故事標題＋前兩行，逐字；人名、公司名去識別。",
  "sample": "G03"
 },
 {
  "id": "G04",
  "answer": "real",
  "ctx": "你在滑手機時，看到下面這個網頁：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">○○證券 活動頁</div><div class=\"web\">\n<div class=\"brand\">股票抽籤選○○證券</div>\n<div class=\"banner\" style=\"background:linear-gradient(135deg,#e2552b,#c2410c)\"><div>2025股票申購實績</div><div class=\"big\">申購檔數 160檔</div><div class=\"big\">最高價差 約225萬</div><div class=\"jbtn\">立即申購</div></div>\n<div class=\"txt\" style=\"font-size:11px;color:#666\">價差計算公式為抽籤日之(當日市價-承銷價)申購股數(1,000股)做為邏輯基礎</div>\n<div class=\"dom\">event.○○.com.tw</div></div></div>",
  "kind": "A",
  "cue": "L1 新股＋L5 價差",
  "source": "來源：凱基證券（無日期）。股票抽籤選凱基證券。2026 年 10 月 18 日擷取自 https://event.kgi.com.tw/news/event/SS/index.html 處理：活動頁首屏文字，逐字，以網頁橫幅重繪。",
  "sample": "G04"
 },
 {
  "id": "G05",
  "answer": "real",
  "ctx": "你在滑手機時，看到下面這個網頁：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">○○證券 活動頁</div><div class=\"web\">\n<div class=\"banner\" style=\"background:linear-gradient(135deg,#0f766e,#115e59)\"><div class=\"big\">【新戶好禮】開戶送LINE POINTS 200點</div></div>\n<div class=\"txt\">活動期間：即日起至2025年7月18日止\n活動辦法：透過○○證券官方LINE/IG/FB等指定連結完成開戶，即贈LINE POINTS 200點。\n活動贈品限量150份。</div>\n<div class=\"dom\">event.○○.com.tw</div></div></div>",
  "kind": "A",
  "cue": "L4 限量",
  "source": "來源：凱基證券（無日期）。【新戶好禮】開戶送LINE POINTS。2026 年 10 月 18 日擷取自 https://event.kgi.com.tw/news/event/otherDocument/index.html 處理：「活動辦法」前段，逐字。",
  "sample": "G05"
 },
 {
  "id": "G06",
  "answer": "real",
  "ctx": "你在滑手機時，看到下面這個網頁：",
  "html": "<div class=\"jphone\"><div class=\"jbar fb\">○○證券 活動頁</div><div class=\"web\">\n<div class=\"banner\" style=\"background:linear-gradient(135deg,#2563eb,#1e40af)\"><div class=\"big\">每月都有大驚喜！</div></div>\n<div class=\"txt\">當月壽星加入○○ LINE官方帳號，優惠服務享不完\n完成申請○○證券個人化服務，月月皆享有抽獎機會！</div>\n<div class=\"dom\">www.○○.com</div></div></div>",
  "kind": "A",
  "cue": "誘因（抽獎）",
  "source": "來源：富邦證券（無日期）。富邦證券 LINE官方帳號活動網頁。2026 年 10 月 18 日擷取自 https://www.fubon.com/securities/line/index.html 處理：首段，逐字。",
  "sample": "G06"
 },
 {
  "id": "G07",
  "answer": "real",
  "ctx": "你加入了一個 LINE 股票討論群組。某天，群組裡有人分享了下面這篇文章：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">股票討論群組</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">會</div><div><div class=\"who\">會員 B</div><div style=\"background:#fff;border-radius:12px;overflow:hidden;width:205px;font-size:12.5px\"><div style=\"padding:6px 8px\"><b style=\"display:block;font-size:13px\">(七) 如何參與新股上市公開申購?</b>IPO股票申購　指公司經證交所或櫃買中心核准上市、上櫃之申請後，首次辦理現金增資發行股票以募集資金，透過公開管道提供投資人申購。公司為順利完成募資，股票申購的價格通常低於市場，當投資人申購的數量大於公司提出銷售的數量時，則採用公開抽籤的方式辦理。<div style=\"color:#888;font-size:11px\">shl.○○○○.com.tw</div></div></div></div><span class=\"time\">21:30</span></div>\n</div></div>",
  "kind": "A",
  "cue": "L1 新股價格低於市場",
  "source": "來源：臺灣證券交易所宅在家學習網（無日期）。如何參與新股上市公開申購?。2026 年 10 月 18 日擷取自 https://shl.twse.com.tw/page/library/listed/7.html 處理：標題＋第一段，逐字；做成群組裡的連結分享卡（原網頁無封面圖）。",
  "sample": "G07"
 },
 {
  "id": "G08",
  "answer": "real",
  "ctx": "你加了一個證券相關的 LINE 帳號。今天收到下面的訊息：",
  "html": "<div class=\"jphone oa\"><div class=\"jbar\">○○證券</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">不論你是哪種投資人，○○APP都能滿足你的投資策略</div><span class=\"time\">10:00</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">只要您有下載○○就可以體驗使用囉！除此之外，您還可以選擇使用「社群帳號」登入體驗。</div><span class=\"time\">10:00</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">如果您已經是○○證券客戶，請使用「身分證字號(或統一編號)」與「網路密碼」登入使用更多功能！</div><span class=\"time\">10:01</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L2 要求身分資料登入",
  "source": "來源：元大證券（無日期）。元大證券投資先生-最懂你的投資專家，投資必備神器。2026 年 10 月 18 日擷取自 https://www.yuanta.com.tw/file-repository/content/mr_invest/index.html 處理：B 類。功能介紹一句＋常見問題 Q1 的回答，逐字；App 與公司名去識別。補上：帳號外框、分則、時間。",
  "sample": "G08"
 },
 {
  "id": "G09",
  "answer": "real",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">○○○</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">台股新籤採用「先繳費，後抽籤」的方式，只要在抽籤日前一個營業日，將「申購價格x申購股數」的金額和70元(含手續費20元+50元郵資)存入帳戶即可，若沒中籤的投資人僅會被扣除申購手續費20元，券商會退回預扣的承銷價與50元郵資。</div><span class=\"time\">08:30</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">因為新股申購採用「先繳費，後抽籤」的方式，就算你不打算投資台股，也可以先開一個台股帳戶，定期申購，要留意到的是，雖然台股申購有95%在開盤賣出都能賺錢，但因為中籤率低，也要做好期望值管理。如果順利中籤，就當撿到的年終獎金吧！</div><span class=\"time\">08:30</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L2 存入資金＋L5 獲利機率",
  "source": "來源：凱基證券（2019 年 11 月 12 日）。「股票申購」做好這三步，多賺一筆過節費。凱基投資充電站。2026 年 10 月 18 日擷取自 https://www.kgi.com.tw/zh-tw/resources-index/article-details?id=1552ee76eb72455ab844dd7cb3b683b5&tid=bc1b63e6b0904af9965ac03e3cecb882 處理：B 類。相連兩段，逐字。補上：私訊外框、寄件者名稱、時間。",
  "sample": "G09"
 },
 {
  "id": "G10",
  "answer": "real",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">○○○</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">送出申購前，建議先確認申購標的、申購價格、扣款金額與交割帳戶餘額；送出後則可透過「我的申購」追蹤後續扣款與中籤狀態。</div><span class=\"time\">12:00</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">若想確認自己是否中籤，可至○○ APP 的「我的申購」查詢申購紀錄與結果。實際查詢入口與畫面，仍以 APP 最新版本為準。</div><span class=\"time\">12:00</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">股票抽籤一定會賺錢嗎？不一定。中籤後上市櫃股價仍可能上漲或下跌，投資人仍需自行評估風險。</div><span class=\"time\">12:01</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L2 扣款",
  "source": "來源：永豐金證券（2026 年 10 月）。股票抽籤｜申購流程、扣款費用與中籤查詢教學。2026 年 10 月 18 日擷取自 https://www.sinotrade.com.tw/richclub/invest/guide/ipo-subscription 處理：B 類。三句，逐字（第三則為常見問題 Q5 的問與答）；App 名去識別。補上：私訊外框、寄件者名稱、時間。",
  "sample": "G10"
 },
 {
  "id": "G11",
  "answer": "real",
  "ctx": "你加了一個證券相關的 LINE 帳號。今天收到下面的訊息：",
  "html": "<div class=\"jphone oa\"><div class=\"jbar\">○○證券</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">中籤不用等發薪！○○讓您一指申請抽籤資金</div><span class=\"time\">19:30</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">抽籤資金缺口？○○線上秒申請</div><span class=\"time\">19:30</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">新手好運別浪費！○○幫您準備資金來抽籤！</div><span class=\"time\">19:31</span></div>\n<div class=\"msg\"><div class=\"av\">證</div><div class=\"bub\">一杯星巴克的資金，參與抽籤超容易</div><span class=\"time\">19:31</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L2 借資金抽籤",
  "source": "來源：凱基證券（無日期）。股票抽籤選凱基證券。2026 年 10 月 18 日擷取自 https://event.kgi.com.tw/news/event/SS/index.html 處理：B 類。活動頁中的四句標語，逐字。補上：帳號外框、分則、時間。",
  "sample": "G11"
 },
 {
  "id": "G12",
  "answer": "real",
  "ctx": "你在 LINE 收到下面這則私訊：",
  "html": "<div class=\"jphone\"><div class=\"jbar\">○○○</div><div class=\"jchat\">\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">以往投資人可能傾向於單一標的或短線操作，但如今，ETF定期定額已成為全民投資工具顯學，尤受年輕族群與長期儲蓄導向的投資群體所青睞。</div><span class=\"time\">20:00</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">如果，你還沒有出手，不妨試試「○○」這個更輕鬆的開始方式。透過小額投入，不僅能參與你看好的市場，也不用煩惱進場時機。</div><span class=\"time\">20:00</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">○○讓你自動扣款、自動買進，省去操作負擔，更重要的是，交易成本還更具優勢，單筆兩萬(含)內手續費１元！</div><span class=\"time\">20:01</span></div>\n<div class=\"msg\"><div class=\"av\">○</div><div class=\"bub\">現在，就從你最感興趣的ETF出發，把想法變成行動，讓資產穩穩增加。</div><span class=\"time\">20:01</span></div>\n</div></div>",
  "kind": "B",
  "cue": "L3 全民都在做＋L4 還沒出手",
  "source": "來源：玉山證券（2025 年 9 月 10 日）。存股熱潮狂燒！0050定期定額戶數挑戰50萬大關 還有這些人氣ETF你跟上了嗎？2026 年 10 月 18 日擷取自 https://www.esunsec.com.tw/article/post/405 處理：B 類。兩段中的四句，逐字；產品名「台股ｅ指存」去識別。補上：私訊外框、寄件者名稱、分則、時間。",
  "sample": "G12"
 }
],

  /* ---------- 判斷任務達成標準（第三章第二節四、附錄二（九）；前測不呈現） ---------- */
  STANDARD: "接下來共有 {N} 則投資相關訊息。在這項判斷任務中，答對 {K} 則以上才算成功完成。",

  /* ---------- P16 自我解釋 ---------- */
  SELFEXPL: {
    q: "請你詳細、一步一步地寫出：這種投資詐騙是如何運作的？請說明每一步如何導致下一步。",
    minChars: 30,  // 研究者訂定（去除空白後計算）；查無文獻依據，論文中註明為研究者訂定
    minNote: "（請至少寫 {MIN} 個字）",
    counter: "目前 {N} 字",
    tooShort: "請至少寫 {MIN} 個字（目前 {N} 字）。"
  },

  /* ---------- P18 解說（草稿，須經 REC 核准後定稿） ---------- */
  DEBRIEF_HTML:
    "<h2>研究說明</h2>" +
    "<p>謝謝你的參與。以下完整說明這項研究。</p>" +
    "<p><b>研究目的</b>：本研究想了解生成式AI的解釋寫法，包括說明的步驟多寡與用語的具體程度，是否影響人們閱讀時的負擔，以及對自身理解與判斷表現的評估。</p>" +
    "<p><b>為什麼參與前沒有完整說明</b>：如果事先知道研究目的，作答可能因此改變，所以參與前只告訴你這是一項關於資訊理解與判斷的研究。每位參與者讀到的 AI 分析是六種寫法之一，這是研究設計，與你個人無關。</p>" +
    "<p><b>關於研究材料</b></p><ol>" +
    "<li>情境中家人收到的那則投資訊息，是研究者依真實詐騙案例改編的虛構訊息，訊息中的公司與人名並不存在。</li>" +
    "<li>你讀到的 AI 分析，是研究者以生成式AI協助撰寫、再逐句修改的文字，不是當場由 AI 產生的。</li>" +
    "<li>判斷題中的訊息，取自法院判決、證券交易所與證券商的詐騙通報，以及證交所、櫃買中心、證券商與投信等官方資訊；個人資料已去除。</li></ol>" +
    "<p><b>辨識投資詐騙的原則</b>：保證獲利、要求匯入個人帳戶、限時限額催促、群組不斷展示獲利，都是常見的詐騙特徵。合法證券商不會要求你把錢匯到個人帳戶。</p>" +
    "<p><b>求助管道</b>：165 反詐騙諮詢專線；證券期貨反詐騙諮詢專線 (02)2737-3434；金管會 1998 金融服務專線。</p>" +
    "<p><b>撤回資料</b>：你的參與者編號是 <b>{PID}</b>。若你了解研究目的後不希望資料被使用，請以此編號 Email 聯絡研究人員（{EMAIL}），研究人員將刪除你的資料。</p>" +
    "<p><b>答案公布</b>：為了不影響其他尚未參加的人，各則訊息是否為詐騙，會在全部資料蒐集結束後公布於：{URL}</p>{QR}" +
    "<p><b>請協助我們</b>：在研究結束前，請不要向可能參加本研究的人透露研究內容或答案。</p>" +
    "<p>若有任何疑問，可以現在詢問施測人員，或聯絡研究人員（{NAME}，{EMAIL}）。對研究執行有任何疑慮或申訴，請聯絡中國醫藥大學暨附設醫院研究倫理中心（電話：04-22052121 分機 11941、11942；E-mail：rrec@mail.cmu.edu.tw）。</p>",
  DEBRIEF_BTN: "我已閱讀研究說明",

  /* ---------- P19 結束 ---------- */
  END: "感謝你撥空參與本研究，你的作答已記錄。請通知施測人員。", // 前句依 Qualtrics 預設結束訊息翻譯

  /* ---------- 共用 ---------- */
  NEXT: "繼續",
  BACK: "回上一頁",
  EMAIL_DONE: "你的 Email 已確認，不需要再填寫一次。",
  MISSING: "還有題目沒有作答（已用淺紅色標示）。"
};
