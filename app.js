const CATEGORIES = [
  "餐饮",
  "交通",
  "学习",
  "购物",
  "娱乐",
  "数码",
  "生活",
  "人情转账",
  "其他",
];

const CATEGORY_KEYWORDS = [
  {
    category: "人情转账",
    keywords: ["转账", "红包", "群收款", "亲属卡", "AA收款", "收款方备注"],
  },
  {
    category: "餐饮",
    keywords: [
      "食堂",
      "餐厅",
      "餐饮",
      "小吃",
      "外卖",
      "美团",
      "饿了么",
      "肯德基",
      "麦当劳",
      "星巴克",
      "瑞幸",
      "蜜雪",
      "咖啡",
      "奶茶",
      "便利店",
    ],
  },
  {
    category: "交通",
    keywords: [
      "地铁",
      "公交",
      "滴滴",
      "高德",
      "打车",
      "铁路",
      "12306",
      "单车",
      "哈啰",
      "青桔",
      "充电桩",
      "停车",
    ],
  },
  {
    category: "学习",
    keywords: [
      "打印",
      "复印",
      "书店",
      "文具",
      "图书馆",
      "教育",
      "培训",
      "考试",
      "知网",
      "课程",
      "教材",
      "论文",
    ],
  },
  {
    category: "娱乐",
    keywords: [
      "电影",
      "游戏",
      "腾讯视频",
      "爱奇艺",
      "哔哩哔哩",
      "B站",
      "音乐",
      "KTV",
      "桌游",
      "剧本",
      "景区",
      "门票",
      "猫眼",
      "淘票票",
    ],
  },
  {
    category: "数码",
    keywords: [
      "话费",
      "流量",
      "中国移动",
      "中国联通",
      "中国电信",
      "云服务",
      "App Store",
      "Steam",
      "软件",
      "会员",
      "网盘",
      "深度求索",
      "硅基流动",
      "openai",
      "chatgpt",
    ],
  },
  {
    category: "生活",
    keywords: [
      "水电",
      "洗衣",
      "理发",
      "快递",
      "药品",
      "医院",
      "校医院",
      "宿舍",
      "物业",
      "生活用品",
      "超市",
    ],
  },
  {
    category: "购物",
    keywords: [
      "淘宝",
      "天猫",
      "京东",
      "拼多多",
      "商场",
      "优衣库",
      "名创优品",
      "服饰",
      "数码店",
      "家居",
    ],
  },
];

const CATEGORY_COLORS = {
  餐饮: "#c75c24",
  交通: "#2867a8",
  学习: "#176b4d",
  购物: "#a85564",
  娱乐: "#8a6bb3",
  数码: "#56707c",
  生活: "#a57b28",
  人情转账: "#735c4d",
  其他: "#78827c",
};

const HEADER_ALIASES = {
  date: ["交易时间", "时间", "交易创建时间", "支付时间", "transactiontime", "date"],
  type: ["交易类型", "类型", "transactiontype", "type"],
  counterparty: [
    "交易对方",
    "交易对象",
    "收款方",
    "商户名称",
    "对方",
    "counterparty",
    "merchant",
  ],
  description: ["商品", "商品说明", "交易说明", "description", "item", "details"],
  flow: ["收/支", "收支", "收支类型", "income/expense", "direction", "flow"],
  amount: [
    "金额(元)",
    "金额（元）",
    "金额",
    "交易金额(元)",
    "amount(cny)",
    "amount",
  ],
  payment: ["支付方式", "付款方式", "payment", "paymentmethod"],
  status: ["当前状态", "交易状态", "状态", "status"],
  note: ["备注", "交易备注", "note", "remarks"],
};

const state = {
  transactions: [],
  filtered: [],
  analytics: [],
  cleaning: {
    skipped: 0,
    duplicates: 0,
    refunded: 0,
    linkedRefunds: 0,
    unmatchedRefunds: 0,
  },
  sourceName: "示例数据",
  sourceMeta: "",
  filters: {
    dateFrom: "",
    dateTo: "",
    flow: "all",
    category: "all",
    search: "",
  },
  reportMonth: "",
  cleaningFilter: "all",
  budget: 1500,
  page: 1,
  pageSize: 12,
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  state.budget = Number(localStorage.getItem("wespend-budget")) || 1500;
  elements.budgetInput.value = state.budget;
  loadSampleData({ silent: true });
});

function cacheElements() {
  [
    "fileInput",
    "sampleButton",
    "resetFiltersButton",
    "dateFromInput",
    "dateToInput",
    "flowFilter",
    "categoryFilter",
    "searchInput",
    "cleaningStrip",
    "sourceTitle",
    "sourceMeta",
    "totalExpense",
    "totalIncome",
    "netCashflow",
    "dailyAverage",
    "expenseMeta",
    "incomeMeta",
    "netMeta",
    "averageMeta",
    "trendChart",
    "budgetRing",
    "budgetPercent",
    "budgetInput",
    "budgetMessage",
    "categoryList",
    "heatmap",
    "insightList",
    "merchantList",
    "transactionBody",
    "transactionCount",
    "pageInfo",
    "prevPageButton",
    "nextPageButton",
    "exportButton",
    "reportMonthSelect",
    "monthlyReportKpis",
    "monthlyReportContent",
    "exportAnonymousReportButton",
    "printReportButton",
    "toast",
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  elements.sampleButton.addEventListener("click", () => loadSampleData());
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  elements.fileInput.addEventListener("change", handleFileSelection);
  elements.dateFromInput.addEventListener("change", updateFilters);
  elements.dateToInput.addEventListener("change", updateFilters);
  elements.flowFilter.addEventListener("change", updateFilters);
  elements.categoryFilter.addEventListener("change", updateFilters);
  elements.searchInput.addEventListener("input", debounce(updateFilters, 180));
  elements.budgetInput.addEventListener("input", updateBudget);
  elements.reportMonthSelect.addEventListener("change", updateReportMonth);
  elements.exportAnonymousReportButton.addEventListener("click", exportAnonymousMonthlyReport);
  elements.printReportButton.addEventListener("click", printMonthlyReport);
  elements.prevPageButton.addEventListener("click", () => changePage(-1));
  elements.nextPageButton.addEventListener("click", () => changePage(1));
  elements.exportButton.addEventListener("click", exportFilteredTransactions);
  elements.cleaningStrip.addEventListener("click", handleCleaningChipClick);

  const dropTarget = document.body;
  dropTarget.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  dropTarget.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      processFiles(event.dataTransfer.files);
    }
  });
}

function loadSampleData(options = {}) {
  const sampleCsv = buildSampleCsv();
  const rows = parseCsv(sampleCsv);
  const parsed = parseWeChatRows(rows);

  if (!parsed.transactions.length) {
    showToast("示例数据加载失败");
    return;
  }

  setTransactionData(
    parsed,
    "示例账单",
    `${parsed.transactions.length} 条交易 · 2026-07-01 至 2026-09-30 · 关联退款 ${parsed.cleaning.linkedRefunds} 笔`,
  );

  if (!options.silent) {
    showToast("已加载示例账单，所有计算仍在本地完成");
  }
}

async function handleFileSelection(event) {
  const files = Array.from(event.target.files || []);
  await processFiles(files);
  event.target.value = "";
}

async function processFiles(files) {
  if (!files.length) {
    return;
  }

  const file = files[0];
  const extension = file.name.split(".").pop().toLowerCase();

  if (!["csv", "txt", "pdf"].includes(extension)) {
    showToast("请导入微信账单 CSV、TXT 或 PDF 文件");
    return;
  }

  try {
    const parsed =
      extension === "pdf" ? await parsePdfBill(file) : parseTextBill(await file.arrayBuffer());

    if (!parsed.transactions.length) {
      showToast(
        extension === "pdf"
          ? "PDF 中没有识别到文字型交易记录，请改用“用于个人对账”的账单"
          : "没有识别到有效交易，请确认导入的是微信官方账单",
      );
      return;
    }

    const sourceMeta = `${parsed.transactions.length} 条有效交易 · 跳过 ${
      parsed.cleaning.skipped
    } 条 · 关联退款 ${parsed.cleaning.linkedRefunds} 笔 · 重复 ${
      parsed.cleaning.duplicates
    } 条`;
    setTransactionData(parsed, file.name, sourceMeta);
    showToast(
      `已从 ${extension.toUpperCase()} 导入 ${parsed.transactions.length} 条交易，数据没有离开浏览器`,
    );
  } catch (error) {
    console.error(error);
    showToast("账单读取失败，请确认文件格式和编码正常");
  }
}

function parseTextBill(buffer) {
  return parseWeChatRows(parseCsv(decodeText(buffer)));
}

async function parsePdfBill(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js is not available");
  }

  const buffer = await file.arrayBuffer();
  const pdf = await openPdfDocument(buffer);
  const rows = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({
      includeMarkedContent: false,
      normalizeWhitespace: true,
    });
    const pageRows = groupPdfTextIntoRows(textContent.items);
    pageRows.forEach((row) => {
      Object.defineProperty(row, "pdfPage", {
        value: pageNumber,
        enumerable: false,
      });
    });
    rows.push(...pageRows);
  }

  await pdf.destroy();

  const structured = parseWeChatRows(rows);
  if (structured.transactions.length) {
    return structured;
  }

  return parseLoosePdfRows(rows);
}

async function openPdfDocument(buffer, password = "") {
  const options = {
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: true,
    password,
  };

  if (window.location.protocol === "file:") {
    options.disableWorker = true;
  }

  try {
    return await window.pdfjsLib.getDocument(options).promise;
  } catch (error) {
    if (error?.name !== "PasswordException") {
      throw error;
    }

    const inputPassword = window.prompt("该 PDF 需要密码，请输入账单密码：");
    if (!inputPassword) {
      throw error;
    }
    return openPdfDocument(buffer, inputPassword);
  }
}

function groupPdfTextIntoRows(items) {
  const lines = [];

  items
    .filter((item) => item.str && item.str.trim())
    .forEach((item) => {
      const x = item.transform[4];
      const y = item.transform[5];
      let line = lines.find((candidate) => Math.abs(candidate.y - y) <= 2.8);

      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }

      line.items.push({ x, text: item.str.trim() });
    });

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => {
      const sortedItems = line.items.sort((a, b) => a.x - b.x);
      const row = sortedItems.map((item) => item.text).filter(Boolean);
      Object.defineProperty(row, "pdfItems", {
        value: sortedItems,
        enumerable: false,
      });
      return row;
    })
    .filter((row) => row.length);
}

function parseLoosePdfRows(rows) {
  const transactions = [];
  let skipped = 0;
  let pendingTransaction = null;

  rows.forEach((row, rowIndex) => {
    const cells = row.map((cell) => String(cell || "").replace(/\s+/g, " ").trim());
    const dateIndex = cells.findIndex(isPdfDateCell);

    if (dateIndex < 0) {
      if (pendingTransaction && pendingTransaction.pdfPage === row.pdfPage) {
        mergePdfContinuation(pendingTransaction, row);
      }
      return;
    }

    const flowIndex = cells.findIndex((cell) =>
      /^(?:支出|收入|\/|expense|income)$/i.test(cell),
    );
    const amountIndex = cells.findIndex(isPdfAmountCell);

    if (flowIndex < 0 || amountIndex < 0) {
      skipped += 1;
      return;
    }

    const date = parseTransactionDate(cells[dateIndex]);
    const amount = parseAmount(cells[amountIndex]);
    const flow = normalizeFlow(cells[flowIndex], amount);

    if (!date) {
      skipped += 1;
      return;
    }
    if (!Number.isFinite(amount) || amount === 0) {
      skipped += 1;
      return;
    }
    if (flow === "neutral") {
      skipped += 1;
      return;
    }

    const type = findPdfType(cells, dateIndex, flowIndex);
    const counterparty = findPdfCounterparty(cells, amountIndex) || "未知交易对象";
    const payment = cleanPdfPayment(findPdfPayment(cells, flowIndex, amountIndex));
    const status = /已退款|退款成功|refunded/i.test(type)
      ? "已退款"
      : /退款|退回|refund|returned/i.test(type)
        ? "退款"
        : "交易成功";
    const transaction = {
      id: `${date.getTime()}-pdf-${rowIndex}-${amount}`,
      date,
      dateKey: formatDateKey(date),
      timeKey: formatTimeKey(date),
      type,
      counterparty,
      description: type,
      flow,
      amount: Math.abs(amount),
      payment,
      status,
      category: "其他",
      categorySource: "auto",
      hasExplicitTime: false,
      pdfPage: row.pdfPage,
    };

    transaction.category = categorizeTransaction(transaction);
    transaction.categoryReason = getCategoryReason(transaction);
    transactions.push(transaction);
    pendingTransaction = transaction;
  });

  return finalizeTransactionSet(transactions, skipped);
}

function isPdfDateCell(value) {
  return /^\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}日?(?:\s+\d{1,2}:\d{1,2}(?::\d{1,2})?)?$/.test(
    String(value || "").trim(),
  );
}

function isPdfAmountCell(value) {
  return /^[¥￥]?\d[\d,]*(?:\.\d{1,2})$/.test(String(value || "").trim());
}

function findPdfType(cells, dateIndex, flowIndex) {
  const candidate = cells
    .slice(dateIndex + 1, flowIndex)
    .find((cell) => cell && !isPdfDateCell(cell));
  return candidate || "账单交易";
}

function findPdfCounterparty(cells, amountIndex) {
  const candidate = cells
    .slice(amountIndex + 1)
    .find(
      (cell) =>
        cell &&
        cell !== "/" &&
        !isPdfAmountCell(cell) &&
        !/^\d{8,}$/.test(cell) &&
        !/^(?:支出|收入|expense|income)$/i.test(cell),
    );
  return candidate || "";
}

function findPdfPayment(cells, flowIndex, amountIndex) {
  const candidate = cells
    .slice(flowIndex + 1, amountIndex)
    .find((cell) => /银行|零钱|卡|余额|支付/.test(cell));
  return candidate || "PDF 账单";
}

function applyPdfTime(transaction, timeValue) {
  const [hour, minute, second] = timeValue.split(":").map(Number);
  transaction.date.setHours(hour, minute, second || 0, 0);
  transaction.dateKey = formatDateKey(transaction.date);
  transaction.timeKey = formatTimeKey(transaction.date);
  transaction.hasExplicitTime = true;
}

function mergePdfContinuation(transaction, row) {
  const items = Array.isArray(row.pdfItems)
    ? row.pdfItems
    : row.map((text, index) => ({ x: index * 80, text }));

  items.forEach(({ x, text }) => {
    const value = String(text || "").trim();
    if (!value) {
      return;
    }

    if (
      x >= 120 &&
      x < 205
    ) {
      if (!transaction.hasExplicitTime && /^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
        applyPdfTime(transaction, value);
        return;
      }

      if (/^[\u4e00-\u9fff（）()]+$/.test(value)) {
        transaction.type = joinPdfContinuation(transaction.type, value);
        transaction.description = transaction.type;
      }
      return;
    }

    if (
      x >= 205 &&
      x < 280 &&
      !isPdfAmountCell(value) &&
      !/^(?:支出|收入|\/|expense|income)$/i.test(value)
    ) {
      transaction.type = joinPdfContinuation(transaction.type, value);
      transaction.description = transaction.type;
      return;
    }

    if (
      x >= 205 &&
      x < 345 &&
      /银行|储蓄卡|储|卡|零钱|余额|支付/.test(value) &&
      !isPdfAmountCell(value) &&
      !/^(?:支出|收入|\/|expense|income)$/i.test(value)
    ) {
      transaction.payment = joinPdfContinuation(transaction.payment, value);
      transaction.payment = cleanPdfPayment(transaction.payment);
      return;
    }

    if (
      x >= 390 &&
      x < 460 &&
      value !== "/" &&
      !isPdfAmountCell(value) &&
      !/^\d{8,}$/.test(value)
    ) {
      transaction.counterparty = joinPdfContinuation(
        transaction.counterparty,
        value,
      );
    }
  });

  transaction.category = categorizeTransaction(transaction);
  transaction.categoryReason = getCategoryReason(transaction);
}

function joinPdfContinuation(current, addition) {
  if (!current || current === "PDF 账单" || current === "未知交易对象") {
    return addition;
  }
  if (current.includes(addition)) {
    return current;
  }
  return `${current}${addition}`;
}

function cleanPdfPayment(value) {
  return String(value || "").replace(
    /中国银行储.*?蓄卡/,
    "中国银行储蓄卡",
  );
}

function setTransactionData(parsed, sourceName, sourceMeta) {
  state.transactions = parsed.transactions;
  state.cleaning = parsed.cleaning;
  state.sourceName = sourceName;
  state.sourceMeta = sourceMeta;
  state.page = 1;
  state.cleaningFilter = "all";
  state.reportMonth = getLatestMonthKey(state.transactions);
  state.filters.flow = "all";
  state.filters.category = "all";
  state.filters.search = "";
  elements.flowFilter.value = "all";
  elements.categoryFilter.value = "all";
  elements.searchInput.value = "";
  configureDateDefaults();
  renderReportMonthOptions();
  updateFilters();
}

function decodeText(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    try {
      return new TextDecoder("gb18030").decode(buffer);
    } catch {
      return new TextDecoder("utf-8").decode(buffer);
    }
  }
}

function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(source);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some((cell) => cell !== "")) {
    rows.push(row);
  }

  return rows;
}

function detectDelimiter(text) {
  const candidates = [",", "\t", ";"];
  const sample = text.split(/\r?\n/).slice(0, 8).join("\n");
  let best = ",";
  let bestCount = -1;

  candidates.forEach((candidate) => {
    const count = sample.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  });

  return best;
}

function parseWeChatRows(rows) {
  const headerIndex = findHeaderRow(rows);

  if (headerIndex < 0) {
    return finalizeTransactionSet([], rows.length);
  }

  const headers = rows[headerIndex].map(normalizeHeader);
  const indexes = mapHeaderIndexes(headers);
  const transactions = [];
  let skipped = 0;

  rows.slice(headerIndex + 1).forEach((row, rowIndex) => {
    const rawDate = getCell(row, indexes.date);
    const rawAmount = getCell(row, indexes.amount);
    const rawFlow = getCell(row, indexes.flow);
    const rawStatus = getCell(row, indexes.status);

    if (!rawDate || !rawAmount || !rawFlow) {
      skipped += 1;
      return;
    }

    const date = parseTransactionDate(rawDate);
    const amount = parseAmount(rawAmount);
    const flow = normalizeFlow(rawFlow, amount);
    const status = rawStatus || "交易成功";

    if (!date || !Number.isFinite(amount) || amount === 0 || flow === "neutral") {
      skipped += 1;
      return;
    }

    if (isIgnoredStatus(status)) {
      skipped += 1;
      return;
    }

    const counterparty =
      getCell(row, indexes.counterparty) ||
      getCell(row, indexes.description) ||
      "未知交易对象";
    const description =
      getCell(row, indexes.description) || getCell(row, indexes.type) || "未注明";
    const transaction = {
      id: `${date.getTime()}-${rowIndex}-${amount}`,
      date,
      dateKey: formatDateKey(date),
      timeKey: formatTimeKey(date),
      type: getCell(row, indexes.type) || "支付",
      counterparty: counterparty.trim(),
      description: description.trim(),
      flow,
      amount: Math.abs(amount),
      payment: getCell(row, indexes.payment) || "未注明",
      status,
      category: "其他",
      categorySource: "auto",
    };

    transaction.category = categorizeTransaction(transaction);
    transaction.categoryReason = getCategoryReason(transaction);
    transactions.push(transaction);
  });

  return finalizeTransactionSet(transactions, skipped);
}

function finalizeTransactionSet(transactions, skipped) {
  const result = [...transactions].sort((a, b) => b.date - a.date);

  result.forEach((transaction) => {
    transaction.linkedTransactionId = "";
    transaction.refundState = "";
    transaction.isDuplicate = false;
    transaction.excludedFromAnalytics = false;
    transaction.categoryReason = transaction.categoryReason || "关键词自动分类";

    if (
      transaction.flow === "expense" &&
      /已退款|退款成功|原路退回|refunded/i.test(transaction.status)
    ) {
      transaction.refundState = "refunded";
      transaction.excludedFromAnalytics = true;
    }

    if (isRefundIncome(transaction)) {
      transaction.refundState = "refund";
    }
  });

  associateRefunds(result);
  markDuplicateTransactions(result);

  return {
    transactions: result,
    cleaning: {
      skipped,
      duplicates: result.filter((transaction) => transaction.isDuplicate).length,
      refunded: result.filter((transaction) => transaction.refundState === "refunded")
        .length,
      linkedRefunds: result.filter(
        (transaction) => transaction.refundState === "linked-refunded",
      ).length,
      unmatchedRefunds: result.filter(
        (transaction) => transaction.refundState === "refund-unmatched",
      ).length,
    },
  };
}

function isRefundIncome(transaction) {
  if (transaction.flow !== "income") {
    return false;
  }

  return /退款|退回|撤销|原路退回|refund|returned/i.test(
    [
      transaction.type,
      transaction.counterparty,
      transaction.description,
      transaction.status,
    ].join(" "),
  );
}

function associateRefunds(transactions) {
  const incomes = transactions
    .filter(
      (transaction) =>
        transaction.flow === "income" &&
        !transaction.isDuplicate &&
        !transaction.excludedFromAnalytics,
    )
    .sort((a, b) => a.date - b.date);
  const expenses = transactions.filter(
    (transaction) =>
      transaction.flow === "expense" &&
      !transaction.isDuplicate &&
      transaction.refundState !== "refunded",
  );

  incomes.forEach((refund) => {
    const explicitRefund = isRefundIncome(refund);
    const candidates = expenses
      .filter((expense) => expense.date <= refund.date)
      .map((expense) => {
        const match = refundMatchScore(expense, refund, explicitRefund);
        return { expense, ...match };
      })
      .filter((candidate) => {
        if (explicitRefund) {
          return candidate.score >= 6;
        }
        return (
          candidate.score >= 7 &&
          (candidate.merchantMatches || candidate.minutesApart <= 10)
        );
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.minutesApart - b.minutesApart;
      });
    const match = candidates[0];

    if (!match || match.expense.linkedTransactionId) {
      if (explicitRefund) {
        refund.refundState = "refund-unmatched";
      }
      return;
    }

    const original = match.expense;
    original.refundState = "linked-refunded";
    original.linkedTransactionId = refund.id;
    original.excludedFromAnalytics = true;
    original.refundMatchMethod = explicitRefund ? "explicit" : "inferred";
    refund.refundState = explicitRefund
      ? "linked-refund"
      : "linked-refund-inferred";
    refund.linkedTransactionId = original.id;
    refund.excludedFromAnalytics = true;
    refund.refundMatchMethod = explicitRefund ? "explicit" : "inferred";
  });
}

function refundMatchScore(expense, refund, explicitRefund) {
  const amountMatches = Math.abs(expense.amount - refund.amount) <= 0.01;
  if (!amountMatches) {
    return {
      score: 0,
      merchantMatches: false,
      minutesApart: Number.POSITIVE_INFINITY,
    };
  }

  const expenseMerchant = normalizeMerchant(expense.counterparty);
  const refundMerchant = normalizeMerchant(refund.counterparty);
  const merchantMatches = expenseMerchant && expenseMerchant === refundMerchant;
  const merchantOverlap =
    expenseMerchant &&
    refundMerchant &&
    (expenseMerchant.includes(refundMerchant) || refundMerchant.includes(expenseMerchant));
  const descriptionOverlap = textOverlap(
    expense.description,
    refund.description,
  );
  const minutesApart = Math.abs((refund.date - expense.date) / 60000);
  const daysApart = minutesApart / 1440;
  let score = 4;
  if (explicitRefund) {
    score += 4;
  }

  if (merchantMatches) {
    score += 3;
  } else if (merchantOverlap) {
    score += 2;
  }

  if (descriptionOverlap) {
    score += 2;
  }

  if (daysApart <= 3) {
    score += 2;
  } else if (daysApart <= 30) {
    score += 1;
  }

  return {
    score,
    merchantMatches: merchantMatches || merchantOverlap,
    minutesApart,
  };
}

function normalizeMerchant(value) {
  return String(value || "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

function textOverlap(first, second) {
  const a = normalizeMerchant(first);
  const b = normalizeMerchant(second);
  if (!a || !b) {
    return false;
  }
  return a.includes(b) || b.includes(a);
}

function markDuplicateTransactions(transactions) {
  const seen = new Set();

  transactions.forEach((transaction) => {
    const key = [
      transaction.date.getTime(),
      normalizeMerchant(transaction.counterparty),
      normalizeMerchant(transaction.description),
      transaction.flow,
      transaction.amount.toFixed(2),
    ].join("|");

    if (seen.has(key)) {
      transaction.isDuplicate = true;
      transaction.excludedFromAnalytics = true;
      return;
    }

    seen.add(key);
  });
}

function findHeaderRow(rows) {
  const keywords = [
    "交易时间",
    "金额",
    "收/支",
    "收支",
    "交易对方",
    "transactiontime",
    "amount",
    "income/expense",
  ];

  return rows.findIndex((row) => {
    const joined = row.map(normalizeHeader).join("|");
    return keywords.some((keyword) => joined.includes(normalizeHeader(keyword)));
  });
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"))
    .toLowerCase();
}

function mapHeaderIndexes(headers) {
  const indexes = {};

  Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
    const normalizedAliases = aliases.map(normalizeHeader);
    indexes[key] = headers.findIndex((header) =>
      normalizedAliases.some(
        (alias) => header === alias || header.includes(alias) || alias.includes(header),
      ),
    );
  });

  return indexes;
}

function getCell(row, index) {
  if (index === undefined || index < 0) {
    return "";
  }
  return String(row[index] || "").trim();
}

function parseTransactionDate(value) {
  const normalized = String(value)
    .trim()
    .replace(/[年./]/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/\s+/g, " ");
  const match = normalized.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAmount(value) {
  const cleaned = String(value)
    .replace(/[¥￥,\s]/g, "")
    .replace(/[()]/g, (char) => (char === "(" ? "-" : ""));
  const amount = Number.parseFloat(cleaned);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function normalizeFlow(value, amount) {
  const flow = String(value || "").trim();

  if (/^(?:\/|—|-|不计收支|中性)$/.test(flow)) {
    return "neutral";
  }

  if (/收入|收款|入账|income|credit|received/i.test(flow)) {
    return "income";
  }

  if (/支出|付款|支付|expense|debit|paid/i.test(flow)) {
    return "expense";
  }

  if (amount > 0) {
    return "income";
  }

  if (amount < 0) {
    return "expense";
  }

  return "neutral";
}

function isIgnoredStatus(status) {
  return /已撤销|已取消|交易关闭|支付失败|cancelled|canceled|failed|closed/i.test(
    status,
  );
}

function categorizeTransaction(transaction) {
  const match = findCategoryMatch(transaction);
  return match ? match.category : "其他";
}

function getCategoryReason(transaction) {
  const match = findCategoryMatch(transaction);
  return match ? `命中关键词“${match.keyword}”` : "未命中关键词";
}

function findCategoryMatch(transaction) {
  const haystack = [
    transaction.counterparty,
    transaction.description,
    transaction.type,
  ]
    .join(" ")
    .toLowerCase();

  for (const rule of CATEGORY_KEYWORDS) {
    const keyword = rule.keywords.find((item) =>
      haystack.includes(item.toLowerCase()),
    );
    if (keyword) {
      return { category: rule.category, keyword };
    }
  }

  return null;
}

function configureDateDefaults() {
  const dates = state.transactions.map((transaction) => transaction.date).sort((a, b) => a - b);

  if (!dates.length) {
    return;
  }

  state.filters.dateFrom = formatDateKey(dates[0]);
  state.filters.dateTo = formatDateKey(dates[dates.length - 1]);
  elements.dateFromInput.value = state.filters.dateFrom;
  elements.dateToInput.value = state.filters.dateTo;
}

function updateFilters() {
  state.filters.dateFrom = elements.dateFromInput.value || state.filters.dateFrom;
  state.filters.dateTo = elements.dateToInput.value || state.filters.dateTo;
  state.filters.flow = elements.flowFilter.value;
  state.filters.category = elements.categoryFilter.value;
  state.filters.search = elements.searchInput.value.trim().toLowerCase();
  state.page = 1;

  const minDate = state.filters.dateFrom ? parseDateKey(state.filters.dateFrom) : null;
  const maxDate = state.filters.dateTo ? endOfDay(parseDateKey(state.filters.dateTo)) : null;

  state.filtered = state.transactions.filter((transaction) => {
    if (minDate && transaction.date < minDate) {
      return false;
    }
    if (maxDate && transaction.date > maxDate) {
      return false;
    }
    if (state.filters.flow !== "all" && transaction.flow !== state.filters.flow) {
      return false;
    }
    if (
      state.filters.category !== "all" &&
      transaction.category !== state.filters.category
    ) {
      return false;
    }
    if (
      state.filters.search &&
      !`${transaction.counterparty} ${transaction.description}`
        .toLowerCase()
        .includes(state.filters.search)
    ) {
      return false;
    }
    return true;
  });

  state.analytics = state.filtered.filter((transaction) => !transaction.excludedFromAnalytics);
  updateCategoryOptions();
  render();
}

function updateCategoryOptions() {
  const selected = state.filters.category;
  const available = CALCULATE_CATEGORY_COUNTS();
  const categories = CATEGORIES.filter((category) => available.get(category));

  elements.categoryFilter.innerHTML = [
    '<option value="all">全部分类</option>',
    ...categories.map(
      (category) =>
        `<option value="${escapeHtml(category)}">${escapeHtml(category)}（${
          available.get(category) || 0
        }）</option>`,
    ),
  ].join("");

  if (selected !== "all" && categories.includes(selected)) {
    elements.categoryFilter.value = selected;
  } else {
    state.filters.category = "all";
    elements.categoryFilter.value = "all";
  }
}

function CALCULATE_CATEGORY_COUNTS() {
  const counts = new Map();
  getAnalyticsTransactions(state.transactions).forEach((transaction) => {
    if (transaction.flow === "expense") {
      counts.set(transaction.category, (counts.get(transaction.category) || 0) + 1);
    }
  });
  return counts;
}

function render() {
  renderSource();
  renderCleaningSummary();
  renderMetrics();
  renderMonthlyReport();
  renderTrend();
  renderBudget();
  renderCategories();
  renderHeatmap();
  renderInsights();
  renderMerchants();
  renderTransactions();
}

function renderSource() {
  elements.sourceTitle.textContent = state.sourceName;
  elements.sourceMeta.textContent = state.sourceMeta;
}

function renderCleaningSummary() {
  const summary = calculateCleaningSummary(state.filtered);
  const chips = [
    {
      filter: "included",
      label: "有效记录",
      value: summary.included,
      warning: false,
    },
    {
      filter: "linked-refund",
      label: "退款关联",
      value: summary.linkedRefunds,
      warning: summary.linkedRefunds > 0,
    },
    {
      filter: "refunded",
      label: "已退款原单",
      value: summary.refunded + summary.linkedRefunds,
      warning: summary.refunded + summary.linkedRefunds > 0,
    },
    {
      filter: "duplicates",
      label: "重复记录",
      value: summary.duplicates,
      warning: summary.duplicates > 0,
    },
    {
      filter: "excluded",
      label: "未纳入统计",
      value: summary.excluded,
      warning: summary.excluded > 0,
    },
    {
      filter: "skipped",
      label: "解析跳过",
      value: state.cleaning.skipped,
      warning: state.cleaning.skipped > 0,
    },
  ];

  elements.cleaningStrip.innerHTML = chips
    .map(
      (chip) => `
        <button
          class="cleaning-chip ${chip.warning ? "is-warning" : ""} ${
            state.cleaningFilter === chip.filter ? "is-active" : ""
          }"
          type="button"
          data-cleaning-filter="${chip.filter}"
          aria-pressed="${state.cleaningFilter === chip.filter}"
        >
          ${escapeHtml(chip.label)} <strong>${chip.value}</strong>
        </button>
      `,
    )
    .join("");
}

function handleCleaningChipClick(event) {
  const button = event.target.closest("[data-cleaning-filter]");
  if (!button) {
    return;
  }

  const filter = button.dataset.cleaningFilter;
  if (filter === "skipped") {
    showToast(
      `解析时跳过 ${state.cleaning.skipped} 条记录，通常为中性、失败、取消或字段缺失记录`,
    );
    return;
  }

  state.cleaningFilter = state.cleaningFilter === filter ? "all" : filter;
  state.page = 1;
  renderCleaningSummary();
  renderTransactions();

  document
    .querySelector(".transactions-panel")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function calculateCleaningSummary(transactions) {
  return {
    total: transactions.length,
    included: transactions.filter((transaction) => !transaction.excludedFromAnalytics)
      .length,
    excluded: transactions.filter((transaction) => transaction.excludedFromAnalytics)
      .length,
    linkedRefunds: transactions.filter(
      (transaction) => transaction.refundState === "linked-refunded",
    ).length,
    duplicates: transactions.filter((transaction) => transaction.isDuplicate).length,
    refunded: transactions.filter((transaction) => transaction.refundState === "refunded")
      .length,
    unmatchedRefunds: transactions.filter(
      (transaction) => transaction.refundState === "refund-unmatched",
    ).length,
  };
}

function getAnalyticsTransactions(transactions) {
  return transactions.filter((transaction) => !transaction.excludedFromAnalytics);
}

function renderMetrics() {
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");
  const incomes = state.analytics.filter((transaction) => transaction.flow === "income");
  const totalExpense = sum(expenses);
  const totalIncome = sum(incomes);
  const net = totalIncome - totalExpense;
  const dayCount = getIncludedDayCount(state.analytics);
  const average = dayCount ? totalExpense / dayCount : 0;
  const excluded = state.filtered.filter(
    (transaction) => transaction.excludedFromAnalytics,
  ).length;

  elements.totalExpense.textContent = formatCurrency(totalExpense);
  elements.totalIncome.textContent = formatCurrency(totalIncome);
  elements.netCashflow.textContent = formatCurrency(net);
  elements.dailyAverage.textContent = formatCurrency(average);
  elements.expenseMeta.textContent = `${expenses.length} 笔有效支出${
    excluded ? ` · 已排除 ${excluded} 条` : ""
  }`;
  elements.incomeMeta.textContent = `${incomes.length} 笔有效收入`;
  elements.netMeta.textContent = net >= 0 ? "收入高于支出" : "支出高于收入";
  elements.averageMeta.textContent = `${dayCount || 0} 天范围内的日均`;
}

function renderReportMonthOptions() {
  const months = Array.from(
    new Set(state.transactions.map((transaction) => transaction.dateKey.slice(0, 7))),
  ).sort((a, b) => b.localeCompare(a));

  if (!months.length) {
    elements.reportMonthSelect.innerHTML = '<option value="">暂无月份</option>';
    return;
  }

  if (!months.includes(state.reportMonth)) {
    state.reportMonth = months[0];
  }

  elements.reportMonthSelect.innerHTML = months
    .map(
      (month) =>
        `<option value="${month}">${month.replace("-", " 年 ")} 月</option>`,
    )
    .join("");
  elements.reportMonthSelect.value = state.reportMonth;
}

function updateReportMonth(event) {
  state.reportMonth = event.target.value;
  renderMonthlyReport();
}

function renderMonthlyReport() {
  const report = buildMonthlyReport(state.reportMonth);

  if (!report) {
    elements.monthlyReportKpis.innerHTML = "";
    elements.monthlyReportContent.innerHTML =
      '<p class="panel-note">当前没有可生成的月度报告</p>';
    elements.exportAnonymousReportButton.disabled = true;
    elements.printReportButton.disabled = true;
    return;
  }

  elements.exportAnonymousReportButton.disabled = false;
  elements.printReportButton.disabled = false;
  const changeClass =
    report.changePercent === null
      ? ""
      : report.changePercent > 0
        ? "is-negative"
        : "is-positive";
  const changeText =
    report.changePercent === null
      ? "上月没有可比数据"
      : `${report.changePercent > 0 ? "增加" : "减少"} ${Math.abs(
          report.changePercent,
        ).toFixed(1)}%`;

  elements.monthlyReportKpis.innerHTML = `
    <div class="report-kpi is-negative">
      <span>月度有效支出</span>
      <strong>${formatCurrency(report.totalExpense)}</strong>
      <small>${report.expenseCount} 笔有效支出</small>
    </div>
    <div class="report-kpi ${report.net >= 0 ? "is-positive" : "is-negative"}">
      <span>月度净收支</span>
      <strong>${formatCurrency(report.net)}</strong>
      <small>${report.incomeCount} 笔有效收入</small>
    </div>
    <div class="report-kpi">
      <span>最大支出类别</span>
      <strong>${escapeHtml(report.topCategory?.category || "暂无")}</strong>
      <small>${
        report.topCategory
          ? `${report.topCategory.share.toFixed(1)}% · ${formatCurrency(
              report.topCategory.amount,
            )}`
          : "当前月份没有支出"
      }</small>
    </div>
    <div class="report-kpi ${changeClass}">
      <span>较上月</span>
      <strong>${report.changePercent === null ? "暂无" : `${report.changePercent > 0 ? "+" : ""}${report.changePercent.toFixed(1)}%`}</strong>
      <small>${escapeHtml(changeText)}</small>
    </div>
  `;

  const categories = report.categories.slice(0, 6);
  const categoryMarkup = categories.length
    ? categories
        .map(
          (item) => `
            <div class="report-category-row">
              <span class="report-category-name">${escapeHtml(item.category)}</span>
              <div class="report-category-track">
                <div class="report-category-fill" style="width:${item.share}%;background:${
                  CATEGORY_COLORS[item.category] || CATEGORY_COLORS.其他
                }"></div>
              </div>
              <span class="report-category-share">${item.share.toFixed(1)}%</span>
            </div>
          `,
        )
        .join("")
    : '<p class="panel-note">当前月份没有支出记录</p>';

  elements.monthlyReportContent.innerHTML = `
    <section class="report-section">
      <h4>支出结构</h4>
      <div class="report-category-list">${categoryMarkup}</div>
    </section>
    <section class="report-section">
      <h4>本月结论</h4>
      <div class="report-note-list">
        ${report.notes
          .map(
            (note, index) => `
              <div class="report-note">
                <b>${index + 1}</b>
                <span>${escapeHtml(note)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildMonthlyReport(monthKey) {
  if (!monthKey) {
    return null;
  }

  const analytics = getAnalyticsTransactions(state.transactions);
  const monthTransactions = analytics.filter((transaction) =>
    transaction.dateKey.startsWith(monthKey),
  );
  const expenseTransactions = monthTransactions.filter(
    (transaction) => transaction.flow === "expense",
  );
  const incomeTransactions = monthTransactions.filter(
    (transaction) => transaction.flow === "income",
  );
  const totalExpense = sum(expenseTransactions);
  const totalIncome = sum(incomeTransactions);
  const net = totalIncome - totalExpense;
  const categoryTotals = CATEGORIES.map((category) => ({
    category,
    amount: expenseTransactions
      .filter((transaction) => transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0),
  }))
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      share: totalExpense ? (item.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  const previousMonthKey = getPreviousMonthKey(monthKey);
  const previousExpense = previousMonthKey
    ? sum(
        analytics.filter(
          (transaction) =>
            transaction.flow === "expense" &&
            transaction.dateKey.startsWith(previousMonthKey),
        ),
      )
    : 0;
  const changePercent =
    previousExpense > 0 ? ((totalExpense - previousExpense) / previousExpense) * 100 : null;
  const topCategory = categoryTotals[0] || null;
  const dayTotals = new Map();

  expenseTransactions.forEach((transaction) => {
    dayTotals.set(
      transaction.dateKey,
      (dayTotals.get(transaction.dateKey) || 0) + transaction.amount,
    );
  });

  const highestDay = Array.from(dayTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  const allMonthTransactions = state.transactions.filter((transaction) =>
    transaction.dateKey.startsWith(monthKey),
  );
  const excluded = allMonthTransactions.filter(
    (transaction) => transaction.excludedFromAnalytics,
  ).length;
  const linkedRefunds = allMonthTransactions.filter(
    (transaction) => transaction.refundState === "linked-refunded",
  ).length;
  const budgetStatus =
    state.budget > 0
      ? totalExpense <= state.budget
        ? `本月支出比预算少 ${formatCurrency(state.budget - totalExpense)}`
        : `本月支出超出预算 ${formatCurrency(totalExpense - state.budget)}`
      : "尚未设置月度预算";
  const notes = [];

  if (topCategory) {
    notes.push(
      `${topCategory.category}占本月支出的 ${topCategory.share.toFixed(
        1,
      )}%，是当前最重要的消费结构。`,
    );
  } else {
    notes.push("本月没有有效支出，可以检查账单范围或筛选条件。");
  }

  if (changePercent !== null) {
    notes.push(
      `总支出比上月${changePercent >= 0 ? "增加" : "减少"} ${Math.abs(
        changePercent,
      ).toFixed(1)}%，${Math.abs(changePercent) > 20 ? "变化较明显" : "整体变化较平稳"}。`,
    );
  } else {
    notes.push("上个月没有可比的有效支出，因此暂不计算环比。");
  }

  if (highestDay) {
    notes.push(
      `${highestDay[0]} 是消费最高的一天，当天支出 ${formatCurrency(
        highestDay[1],
      )}，建议核对是否包含一次性消费。`,
    );
  }

  notes.push(
    `${budgetStatus}；本月关联 ${linkedRefunds} 笔退款，另有 ${excluded} 条重复或退款原记录未重复计入统计。`,
  );

  return {
    monthKey,
    totalExpense,
    totalIncome,
    net,
    expenseCount: expenseTransactions.length,
    incomeCount: incomeTransactions.length,
    categories: categoryTotals,
    topCategory,
    highestDay,
    changePercent,
    previousExpense,
    linkedRefunds,
    excluded,
    notes,
    budgetStatus,
  };
}

function getPreviousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const previous = new Date(year, month - 2, 1);
  return `${previous.getFullYear()}-${pad(previous.getMonth() + 1)}`;
}

function exportAnonymousMonthlyReport() {
  const report = buildMonthlyReport(state.reportMonth);
  if (!report) {
    showToast("当前没有可导出的月度报告");
    return;
  }

  const html = buildAnonymousReportDocument(report);
  downloadHtmlFile(`wespend-anonymous-${report.monthKey}.html`, html);
  showToast("匿名月报已导出，商户、日期和金额均已隐藏");
}

function printMonthlyReport() {
  const report = buildMonthlyReport(state.reportMonth);
  if (!report) {
    showToast("当前没有可打印的月度报告");
    return;
  }

  const html = buildAnonymousReportDocument(report);
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    showToast("浏览器阻止了报告窗口，请允许弹出窗口后重试");
    return;
  }

  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.addEventListener("load", () => reportWindow.print(), { once: true });
}

function buildAnonymousReportDocument(report) {
  const monthLabel = report.monthKey.replace("-", " 年 ") + " 月";
  const categoryRows = report.categories
    .map(
      (item, index) => `
        <div class="bar-row">
          <span>${escapeHtml(item.category)}</span>
          <div class="bar-track">
            <div class="bar" style="width:${item.share}%;background:${
              CATEGORY_COLORS[item.category] || CATEGORY_COLORS.其他
            }"></div>
          </div>
          <strong>${item.share.toFixed(1)}%</strong>
        </div>
      `,
    )
    .join("");
  const notes = report.notes
    .map((note, index) => `<li>${escapeHtml(anonymizeReportText(note))}</li>`)
    .join("");
  const comparison =
    report.changePercent === null
      ? "上月无可比数据"
      : `较上月${report.changePercent >= 0 ? "增加" : "减少"} ${Math.abs(
          report.changePercent,
        ).toFixed(1)}%`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${monthLabel}匿名消费报告</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f2f4f1;color:#17211b;font:14px/1.6 "Microsoft YaHei",sans-serif}
    main{width:min(900px,calc(100% - 40px));margin:36px auto;background:#fff;border:1px solid #dfe5de;border-radius:10px;padding:38px}
    header{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #dfe5de;padding-bottom:24px}
    h1{margin:0;font-size:28px}
    .eyebrow{margin:0 0 6px;color:#176b4d;font-size:11px;font-weight:800;letter-spacing:.12em}
    .privacy{max-width:240px;color:#69746d;text-align:right;font-size:12px}
    .kpis{display:grid;grid-template-columns:repeat(3,1fr);margin:26px 0;border-top:1px solid #dfe5de;border-bottom:1px solid #dfe5de}
    .kpi{padding:18px;border-right:1px solid #dfe5de}
    .kpi:last-child{border-right:0}
    .kpi span{display:block;color:#69746d;font-size:11px}.kpi strong{display:block;margin-top:7px;font-size:21px}
    section{margin-top:28px}section h2{margin:0 0 14px;font-size:16px}
    .bar-row{display:grid;grid-template-columns:86px 1fr 58px;align-items:center;gap:12px;margin:11px 0}
    .bar-row span{font-weight:700}.bar-row strong{text-align:right}
    .bar-track{height:9px;overflow:hidden;border-radius:5px;background:#eef1ec}.bar{height:100%;border-radius:inherit}
    ul{margin:0;padding-left:20px}li{margin:9px 0;color:#465149}
    footer{margin-top:34px;border-top:1px solid #dfe5de;padding-top:16px;color:#7a857e;font-size:11px}
    @media(max-width:640px){main{width:100%;margin:0;border:0;border-radius:0;padding:22px}.kpis{grid-template-columns:1fr}.kpi{border-right:0;border-bottom:1px solid #dfe5de}.kpi:last-child{border-bottom:0}header{flex-direction:column}.privacy{text-align:left}}
    @media print{body{background:#fff}main{width:100%;margin:0;border:0;padding:0}}
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="eyebrow">WESPEND ANONYMOUS REPORT</p>
        <h1>${monthLabel}消费月报</h1>
      </div>
      <p class="privacy">已隐藏商户名称、具体日期和金额数值。图表使用分类占比与相对变化展示。</p>
    </header>
    <div class="kpis">
      <div class="kpi"><span>有效消费记录</span><strong>${report.expenseCount} 笔</strong></div>
      <div class="kpi"><span>最大支出类别</span><strong>${escapeHtml(
        report.topCategory?.category || "暂无",
      )}</strong></div>
      <div class="kpi"><span>月度变化</span><strong>${comparison}</strong></div>
    </div>
    <section>
      <h2>支出结构</h2>
      ${categoryRows || "<p>本月没有可统计的支出。</p>"}
    </section>
    <section>
      <h2>报告结论</h2>
      <ul>${notes}</ul>
    </section>
    <footer>本报告由 WeSpend 在本地生成。原始账单没有上传，报告可用于展示或面试交流。</footer>
  </main>
</body>
</html>`;
}

function anonymizeReportText(value) {
  return String(value)
    .replace(/¥[\d,.]+/g, "已隐藏")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "已隐藏日期");
}

function downloadHtmlFile(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function renderTrend() {
  const svg = elements.trendChart;
  const width = 920;
  const height = 310;
  const padding = { top: 18, right: 18, bottom: 38, left: 58 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");
  const incomes = state.analytics.filter((transaction) => transaction.flow === "income");
  const grouped = groupTransactionsByTime([...expenses, ...incomes]);
  const labels = Array.from(grouped.keys()).sort();

  if (!labels.length) {
    svg.innerHTML = `<text x="${width / 2}" y="${
      height / 2
    }" text-anchor="middle" fill="#69746d" font-size="14">当前筛选范围没有数据</text>`;
    return;
  }

  const points = labels.map((label) => ({
    label,
    expense: sum(grouped.get(label).filter((item) => item.flow === "expense")),
    income: sum(grouped.get(label).filter((item) => item.flow === "income")),
  }));
  const maxAmount = Math.max(
    1,
    ...points.flatMap((point) => [point.expense, point.income]),
  );
  const niceMax = niceCeiling(maxAmount);
  const xStep = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
  const y = (value) => padding.top + chartHeight - (value / niceMax) * chartHeight;
  const x = (index) => padding.left + (points.length > 1 ? index * xStep : chartWidth / 2);
  const barWidth = Math.max(2, Math.min(14, chartWidth / Math.max(points.length * 2.8, 1)));
  const gridLines = 4;
  const monthly = points.length <= 18 && labels[0].length === 7;

  const gridMarkup = Array.from({ length: gridLines + 1 }, (_, index) => {
    const value = (niceMax / gridLines) * index;
    const yPos = y(value);
    return `
      <line x1="${padding.left}" y1="${yPos}" x2="${
        width - padding.right
      }" y2="${yPos}" stroke="#e6ebe5" stroke-width="1" />
      <text x="${padding.left - 10}" y="${yPos + 4}" text-anchor="end" fill="#7a857e" font-size="10">${compactCurrency(
        value,
      )}</text>
    `;
  }).join("");

  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const labelMarkup = points
    .map((point, index) => {
      if (index % labelStep !== 0 && index !== points.length - 1) {
        return "";
      }
      const label = monthly
        ? point.label.slice(5) + "月"
        : point.label.slice(5).replace("-", "/");
      return `<text x="${x(index)}" y="${
        height - 13
      }" text-anchor="middle" fill="#7a857e" font-size="10">${label}</text>`;
    })
    .join("");

  const barsMarkup = points
    .map((point, index) => {
      const valueY = y(point.expense);
      const barHeight = padding.top + chartHeight - valueY;
      return `
        <rect x="${x(index) - barWidth / 2}" y="${valueY}" width="${barWidth}" height="${Math.max(
          barHeight,
          0,
        )}" rx="2" fill="#c75c24" opacity="0.82">
          <title>${point.label} 支出 ${formatCurrency(point.expense)}</title>
        </rect>
      `;
    })
    .join("");

  const expenseLine = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.expense)}`)
    .join(" ");
  const incomeLine = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.income)}`)
    .join(" ");

  const hoverCircles = points
    .map(
      (point, index) => `
        <circle cx="${x(index)}" cy="${y(point.expense)}" r="3.2" fill="#ffffff" stroke="#c75c24" stroke-width="2">
          <title>${point.label} 支出 ${formatCurrency(point.expense)}</title>
        </circle>
        <circle cx="${x(index)}" cy="${y(point.income)}" r="3.2" fill="#ffffff" stroke="#2867a8" stroke-width="2">
          <title>${point.label} 收入 ${formatCurrency(point.income)}</title>
        </circle>
      `,
    )
    .join("");

  svg.innerHTML = `
    <defs>
      <linearGradient id="expenseArea" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#c75c24" stop-opacity="0.12"></stop>
        <stop offset="100%" stop-color="#c75c24" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    ${gridMarkup}
    <path d="${expenseLine} L ${x(points.length - 1)} ${
      padding.top + chartHeight
    } L ${x(0)} ${padding.top + chartHeight} Z" fill="url(#expenseArea)"></path>
    ${barsMarkup}
    <path d="${expenseLine}" fill="none" stroke="#c75c24" stroke-width="2.2" stroke-linejoin="round"></path>
    <path d="${incomeLine}" fill="none" stroke="#2867a8" stroke-width="2" stroke-linejoin="round"></path>
    ${hoverCircles}
    ${labelMarkup}
  `;
}

function groupTransactionsByTime(transactions) {
  const groups = new Map();
  const uniqueDates = new Set(transactions.map((transaction) => transaction.dateKey));
  const useMonthly = uniqueDates.size > 75;

  transactions.forEach((transaction) => {
    const key = useMonthly ? transaction.dateKey.slice(0, 7) : transaction.dateKey;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(transaction);
  });

  return groups;
}

function renderBudget() {
  const monthKey = getLatestMonthKey(state.analytics);
  const monthExpense = state.analytics
    .filter(
      (transaction) =>
        transaction.flow === "expense" && transaction.dateKey.startsWith(monthKey),
    )
    .reduce((total, transaction) => total + transaction.amount, 0);
  const percent = state.budget > 0 ? Math.min((monthExpense / state.budget) * 100, 999) : 0;
  const ringPercent = Math.min(percent, 100);
  const color = percent > 100 ? "#b33b3b" : percent > 80 ? "#ad7a14" : "#176b4d";

  elements.budgetRing.style.background = `conic-gradient(${color} ${
    ringPercent * 3.6
  }deg, #eef1ec ${ringPercent * 3.6}deg)`;
  elements.budgetPercent.textContent = `${Math.round(percent)}%`;
  elements.budgetPercent.style.color = color;

  if (!state.budget) {
    elements.budgetMessage.textContent = "输入一个月度预算即可开始跟踪";
  } else if (percent > 100) {
    elements.budgetMessage.textContent = `${monthKey.slice(5)} 月已超出预算 ${formatCurrency(
      monthExpense - state.budget,
    )}`;
  } else {
    elements.budgetMessage.textContent = `${monthKey.slice(5)} 月已花 ${formatCurrency(
      monthExpense,
    )}，剩余 ${formatCurrency(state.budget - monthExpense)}`;
  }
}

function renderCategories() {
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");
  const categoryTotals = CATEGORIES.map((category) => ({
    category,
    amount: expenses
      .filter((transaction) => transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0),
  }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const total = categoryTotals.reduce((accumulator, item) => accumulator + item.amount, 0);

  if (!categoryTotals.length) {
    elements.categoryList.innerHTML =
      '<p class="panel-note">当前筛选范围没有支出记录</p>';
    return;
  }

  elements.categoryList.innerHTML = categoryTotals
    .map((item) => {
      const share = total ? (item.amount / total) * 100 : 0;
      return `
        <div class="category-row">
          <span class="category-name" title="${escapeHtml(item.category)}">${escapeHtml(
            item.category,
          )}</span>
          <div class="category-track" aria-label="${escapeHtml(item.category)}占比 ${share.toFixed(
            1,
          )}%">
            <div class="category-fill" style="width:${share}%;background:${
              CATEGORY_COLORS[item.category] || CATEGORY_COLORS.其他
            }"></div>
          </div>
          <span class="category-amount">${formatCurrency(item.amount)}</span>
        </div>
      `;
    })
    .join("");
}

function renderHeatmap() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const timeLabels = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
  const cells = Array.from({ length: 7 }, () => Array(6).fill(0));
  const counts = Array.from({ length: 7 }, () => Array(6).fill(0));
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");

  expenses.forEach((transaction) => {
    const dayIndex = (transaction.date.getDay() + 6) % 7;
    const hour = transaction.date.getHours();
    const timeIndex = Math.min(Math.floor(hour / 4), 5);
    cells[dayIndex][timeIndex] += transaction.amount;
    counts[dayIndex][timeIndex] += 1;
  });

  const max = Math.max(1, ...cells.flat());
  const header = [
    '<span class="heatmap-label"></span>',
    ...timeLabels.map(
      (label) => `<span class="heatmap-time">${label}</span>`,
    ),
  ].join("");
  const rows = days
    .map((day, dayIndex) => {
      const rowCells = cells[dayIndex]
        .map((amount, timeIndex) => {
          const ratio = amount / max;
          const background = heatColor(ratio);
          return `
            <span class="heatmap-cell" style="background:${background}" title="${day} ${
              timeLabels[timeIndex]
            } · ${formatCurrency(amount)} · ${counts[dayIndex][timeIndex]} 笔"></span>
          `;
        })
        .join("");
      return `<span class="heatmap-label">${day}</span>${rowCells}`;
    })
    .join("");

  elements.heatmap.innerHTML = header + rows;
}

function renderInsights() {
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");
  const insights = [];

  if (!expenses.length) {
    elements.insightList.innerHTML =
      '<p class="panel-note">导入更多账单后自动生成观察</p>';
    return;
  }

  const total = sum(expenses);
  const categoryTotals = new Map();
  const merchantTotals = new Map();
  const dayTotals = new Map();
  let lateNight = 0;

  expenses.forEach((transaction) => {
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) || 0) + transaction.amount,
    );
    merchantTotals.set(
      transaction.counterparty,
      (merchantTotals.get(transaction.counterparty) || 0) + transaction.amount,
    );
    dayTotals.set(
      transaction.dateKey,
      (dayTotals.get(transaction.dateKey) || 0) + transaction.amount,
    );
    const hour = transaction.date.getHours();
    if (hour >= 22 || hour < 4) {
      lateNight += transaction.amount;
    }
  });

  const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  const topMerchant = Array.from(merchantTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  const topDay = Array.from(dayTotals.entries()).sort((a, b) => b[1] - a[1])[0];
  const categoryShare = topCategory ? (topCategory[1] / total) * 100 : 0;
  const lateNightShare = total ? (lateNight / total) * 100 : 0;

  if (topCategory) {
    insights.push({
      title: `${topCategory[0]}是最大支出项`,
      text: `累计 ${formatCurrency(topCategory[1])}，占总支出 ${categoryShare.toFixed(
        1,
      )}%。`,
    });
  }

  if (topMerchant) {
    insights.push({
      title: `${truncateText(topMerchant[0], 18)}出现频率最高`,
      text: `在筛选范围内累计消费 ${formatCurrency(topMerchant[1])}。`,
    });
  }

  if (topDay) {
    insights.push({
      title: `${topDay[0]} 是消费最高的一天`,
      text: `当天支出 ${formatCurrency(topDay[1])}，可回看是否包含大额或一次性消费。`,
    });
  }

  insights.push({
    title: lateNightShare > 15 ? "夜间消费占比较高" : "夜间消费整体可控",
    text:
      lateNightShare > 15
        ? `22 点后支出占 ${lateNightShare.toFixed(
            1,
          )}%，可以进一步区分必要消费与冲动消费。`
        : `22 点后支出占 ${lateNightShare.toFixed(1)}%，当前账单结构比较稳定。`,
  });

  elements.insightList.innerHTML = insights
    .slice(0, 4)
    .map(
      (item, index) => `
        <div class="insight-item">
          <span class="insight-number">${index + 1}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderMerchants() {
  const expenses = state.analytics.filter((transaction) => transaction.flow === "expense");
  const merchants = new Map();

  expenses.forEach((transaction) => {
    if (!merchants.has(transaction.counterparty)) {
      merchants.set(transaction.counterparty, { amount: 0, count: 0 });
    }
    const item = merchants.get(transaction.counterparty);
    item.amount += transaction.amount;
    item.count += 1;
  });

  const topMerchants = Array.from(merchants.entries())
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);

  if (!topMerchants.length) {
    elements.merchantList.innerHTML =
      '<p class="panel-note">当前筛选范围没有商户支出</p>';
    return;
  }

  elements.merchantList.innerHTML = topMerchants
    .map(
      ([name, detail], index) => `
        <div class="merchant-row">
          <span class="merchant-rank">${index + 1}</span>
          <div class="merchant-detail">
            <strong title="${escapeHtml(name)}">${escapeHtml(name)}</strong>
            <span>${detail.count} 笔 · 单笔平均 ${formatCurrency(
              detail.amount / detail.count,
            )}</span>
          </div>
          <span class="merchant-amount">${formatCurrency(detail.amount)}</span>
        </div>
      `,
    )
    .join("");
}

function getTableTransactions() {
  switch (state.cleaningFilter) {
    case "included":
      return state.filtered.filter((transaction) => !transaction.excludedFromAnalytics);
    case "linked-refund":
      return state.filtered.filter((transaction) =>
        [
          "linked-refunded",
          "linked-refund",
          "linked-refund-inferred",
        ].includes(transaction.refundState),
      );
    case "refunded":
      return state.filtered.filter((transaction) =>
        ["linked-refunded", "refunded"].includes(transaction.refundState),
      );
    case "duplicates":
      return state.filtered.filter((transaction) => transaction.isDuplicate);
    case "excluded":
      return state.filtered.filter((transaction) => transaction.excludedFromAnalytics);
    default:
      return state.filtered;
  }
}

function renderTransactions() {
  const tableTransactions = getTableTransactions();
  const totalPages = Math.max(
    1,
    Math.ceil(tableTransactions.length / state.pageSize),
  );
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const pageItems = tableTransactions.slice(start, start + state.pageSize);

  const excluded = state.filtered.filter(
    (transaction) => transaction.excludedFromAnalytics,
  ).length;
  const cleaningLabel = getCleaningFilterLabel(state.cleaningFilter);
  elements.transactionCount.textContent = cleaningLabel
    ? `${cleaningLabel} · ${tableTransactions.length} 条记录`
    : `${tableTransactions.length} 条记录${
        excluded ? ` · ${excluded} 条未重复计入统计` : ""
      }`;
  elements.pageInfo.textContent = `第 ${state.page} / ${totalPages} 页`;
  elements.prevPageButton.disabled = state.page <= 1;
  elements.nextPageButton.disabled = state.page >= totalPages;
  elements.exportButton.disabled = tableTransactions.length === 0;

  if (!pageItems.length) {
    elements.transactionBody.innerHTML =
      `<tr class="empty-row"><td colspan="7">${
        cleaningLabel ? `“${cleaningLabel}”中没有交易记录` : "当前筛选范围没有交易记录"
      }</td></tr>`;
    return;
  }

  elements.transactionBody.innerHTML = pageItems
    .map(
      (transaction) => `
        <tr class="${[
          transaction.isDuplicate ? "is-duplicate" : "",
          transaction.refundState === "refunded" ||
          transaction.refundState === "linked-refunded"
            ? "is-refunded"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}">
          <td>${formatDateTime(transaction.date)}</td>
          <td title="${escapeHtml(transaction.counterparty)}">
            ${escapeHtml(truncateText(transaction.counterparty, 22))}
            ${getRefundInlineBadge(transaction)}
          </td>
          <td title="${escapeHtml(transaction.description)}">${escapeHtml(
            truncateText(transaction.description, 26),
          )}${getRefundLinkText(transaction)}</td>
          <td>
            <select class="category-select" data-transaction-id="${escapeHtml(
              transaction.id,
            )}" title="${escapeHtml(transaction.categoryReason)}" aria-label="修改 ${escapeHtml(
              transaction.counterparty,
            )} 的分类">
              ${CATEGORIES.map(
                (category) =>
                  `<option value="${category}" ${
                    category === transaction.category ? "selected" : ""
                  }>${category}</option>`,
              ).join("")}
            </select>
          </td>
          <td>${escapeHtml(transaction.payment)}</td>
          <td>${getTransactionStateBadge(transaction)}</td>
          <td class="${
            transaction.flow === "expense" ? "amount-expense" : "amount-income"
          }">
            ${transaction.flow === "expense" ? "-" : "+"}${formatCurrency(
              transaction.amount,
            )}
          </td>
        </tr>
      `,
    )
    .join("");

  elements.transactionBody.querySelectorAll(".category-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      const transaction = state.transactions.find(
        (item) => item.id === event.target.dataset.transactionId,
      );
      if (!transaction) {
        return;
      }
      transaction.category = event.target.value;
      transaction.categorySource = "manual";
      transaction.categoryReason = "手动修改分类";
      updateFilters();
      showToast(`已将 ${transaction.counterparty} 调整为“${transaction.category}”`);
    });
  });
}

function getCleaningFilterLabel(filter) {
  const labels = {
    included: "有效记录",
    "linked-refund": "退款关联记录",
    refunded: "已退款原单",
    duplicates: "重复记录",
    excluded: "未纳入统计",
  };
  return labels[filter] || "";
}

function getRefundInlineBadge(transaction) {
  if (
    transaction.refundState === "linked-refunded" &&
    transaction.refundMatchMethod === "inferred"
  ) {
    return '<span class="refund-badge">疑似退款</span>';
  }

  if (
    transaction.refundState === "refunded" ||
    transaction.refundState === "linked-refunded"
  ) {
    return '<span class="refund-badge">已退款</span>';
  }

  if (
    transaction.refundState === "linked-refund" ||
    transaction.refundState === "linked-refund-inferred" ||
    transaction.refundState === "refund-unmatched"
  ) {
    return '<span class="refund-badge">退款入账</span>';
  }

  return "";
}

function getRefundLinkText(transaction) {
  if (
    transaction.refundState === "linked-refunded" &&
    transaction.refundMatchMethod === "inferred"
  ) {
    return '<span class="refund-link">已按金额、商户和时间匹配退款入账</span>';
  }

  if (transaction.refundState === "linked-refunded") {
    return '<span class="refund-link">已自动关联退款入账</span>';
  }

  if (transaction.refundState === "refunded") {
    return '<span class="refund-link">原始账单状态为已退款</span>';
  }

  if (transaction.refundState === "linked-refund") {
    return '<span class="refund-link">已自动关联原消费</span>';
  }

  if (transaction.refundState === "linked-refund-inferred") {
    return '<span class="refund-link">已按金额、商户和时间自动匹配原消费</span>';
  }

  if (transaction.refundState === "refund-unmatched") {
    return '<span class="refund-link">暂未找到对应原消费</span>';
  }

  return "";
}

function getTransactionStateBadge(transaction) {
  if (transaction.isDuplicate) {
    return '<span class="state-badge is-duplicate">重复</span>';
  }

  if (
    transaction.refundState === "linked-refunded" &&
    transaction.refundMatchMethod === "inferred"
  ) {
    return '<span class="state-badge is-refund">疑似退款</span>';
  }

  if (
    transaction.refundState === "refunded" ||
    transaction.refundState === "linked-refunded"
  ) {
    return '<span class="state-badge is-refund">已退款</span>';
  }

  if (
    transaction.refundState === "linked-refund" ||
    transaction.refundState === "linked-refund-inferred" ||
    transaction.refundState === "refund-unmatched"
  ) {
    return '<span class="state-badge is-refund">退款入账</span>';
  }

  return '<span class="state-badge is-normal">有效</span>';
}

function resetFilters() {
  state.filters.flow = "all";
  state.filters.category = "all";
  state.filters.search = "";
  state.cleaningFilter = "all";
  elements.flowFilter.value = "all";
  elements.categoryFilter.value = "all";
  elements.searchInput.value = "";
  configureDateDefaults();
  updateFilters();
  showToast("已恢复全部账单范围");
}

function updateBudget(event) {
  const value = Math.max(0, Number(event.target.value) || 0);
  state.budget = value;
  localStorage.setItem("wespend-budget", String(value));
  renderBudget();
  renderMonthlyReport();
}

function changePage(direction) {
  state.page += direction;
  renderTransactions();
  document
    .querySelector(".transactions-panel")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function exportFilteredTransactions() {
  const headers = [
    "交易时间",
    "交易对方",
    "商品说明",
    "收支",
    "金额",
    "支付方式",
    "分类",
    "当前状态",
    "退款状态",
    "关联信息",
    "是否纳入统计",
  ];
  const rows = state.filtered.map((transaction) => [
    formatDateTime(transaction.date),
    transaction.counterparty,
    transaction.description,
    transaction.flow === "expense" ? "支出" : "收入",
    transaction.flow === "expense" ? -transaction.amount : transaction.amount,
    transaction.payment,
    transaction.category,
    transaction.status,
    getRefundStateLabel(transaction),
    getRefundLinkLabel(transaction),
    transaction.excludedFromAnalytics ? "否" : "是",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `wspend-${formatDateKey(new Date())}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${state.filtered.length} 条当前筛选结果`);
}

function getRefundStateLabel(transaction) {
  if (
    transaction.refundState === "linked-refunded" &&
    transaction.refundMatchMethod === "inferred"
  ) {
    return "疑似退款并关联退款入账";
  }
  if (transaction.refundState === "linked-refunded") {
    return "已退款并关联退款记录";
  }
  if (transaction.refundState === "refunded") {
    return "账单状态已退款";
  }
  if (transaction.refundState === "linked-refund") {
    return "退款入账并关联原消费";
  }
  if (transaction.refundState === "linked-refund-inferred") {
    return "退款入账，按金额、商户和时间匹配原消费";
  }
  if (transaction.refundState === "refund-unmatched") {
    return "退款入账，未匹配原消费";
  }
  return "无";
}

function getRefundLinkLabel(transaction) {
  if (!transaction.linkedTransactionId) {
    return "";
  }
  return `关联交易 ID: ${transaction.linkedTransactionId}`;
}

function buildSampleCsv() {
  const merchants = [
    ["荔园食堂", "食堂消费", "餐饮", 8, 32, 0.26],
    ["美团外卖", "外卖订单", "餐饮", 12, 45, 0.18],
    ["瑞幸咖啡", "生椰拿铁", "餐饮", 9, 28, 0.07],
    ["深圳地铁", "乘车码扣费", "交通", 2, 9, 0.15],
    ["滴滴出行", "快车订单", "交通", 12, 42, 0.05],
    ["校园打印店", "课程资料打印", "学习", 2, 28, 0.05],
    ["当当书店", "教材购买", "学习", 22, 88, 0.03],
    ["京东", "宿舍生活用品", "购物", 18, 96, 0.06],
    ["拼多多", "日用品拼单", "购物", 9, 52, 0.04],
    ["腾讯视频", "月度会员", "娱乐", 15, 25, 0.02],
    ["哔哩哔哩", "大会员", "娱乐", 15, 25, 0.01],
    ["中国移动", "话费充值", "数码", 30, 80, 0.015],
    ["宿舍洗衣房", "洗衣机付款", "生活", 3, 8, 0.08],
    ["校园超市", "零食饮料", "生活", 5, 32, 0.09],
    ["顺丰速运", "快递寄件", "生活", 12, 22, 0.015],
    ["同学转账", "聚餐 AA", "人情转账", 20, 80, 0.02],
  ];
  const incomeSources = [
    ["家人转账", "生活费", 800, 1500, 0, 0.045],
    ["奖学金", "校级奖学金", 500, 1200, 0, 0.002],
    ["同学转账", "聚餐收款", 20, 90, 0, 0.025],
    ["退款", "订单退款", 8, 68, 0, 0.012],
  ];
  const random = mulberry32(20261015);
  const rows = [
    ["交易时间", "交易类型", "交易对方", "商品", "收/支", "金额(元)", "支付方式", "当前状态"],
    ["2026-07-10 12:00:00", "商户消费", "京东", "宿舍台灯", "支出", "129.00", "零钱", "支付成功"],
    ["2026-07-12 09:30:00", "退款", "京东", "订单退款", "收入", "129.00", "零钱", "已入账"],
    ["2026-08-05 13:20:00", "商户消费", "校园超市", "一次性雨伞", "支出", "19.90", "零钱", "支付成功"],
    ["2026-08-05 13:20:00", "商户消费", "校园超市", "一次性雨伞", "支出", "19.90", "零钱", "支付成功"],
  ];

  for (let dayOffset = 0; dayOffset < 92; dayOffset += 1) {
    const date = new Date(2026, 6, 1 + dayOffset);
    const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.08 : 1;
    const dailyCount = Math.max(1, Math.round((1.45 + random() * 1.7) * weekendFactor));

    for (let count = 0; count < dailyCount; count += 1) {
      const merchant = weightedPick(merchants, random);
      const amount = roundToCents(merchant[3] + random() * (merchant[4] - merchant[3]));
      const hour = weightedHour(random);
      const timestamp = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        Math.floor(random() * 60),
      );
      rows.push([
        formatDateTime(timestamp),
        "商户消费",
        merchant[0],
        merchant[1],
        "支出",
        amount.toFixed(2),
        random() > 0.78 ? "零钱通" : "零钱",
        "支付成功",
      ]);
    }

    const isAllowanceDay = date.getDate() === 1;
    if (isAllowanceDay || random() < 0.035) {
      const income = isAllowanceDay
        ? incomeSources[0]
        : weightedPick(incomeSources, random);
      const amount = roundToCents(income[2] + random() * (income[3] - income[2]));
      const timestamp = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        Math.floor(random() * 24),
        Math.floor(random() * 60),
      );
      rows.push([
        formatDateTime(timestamp),
        income[0] === "退款" ? "退款" : "收入",
        income[0],
        income[1],
        "收入",
        amount.toFixed(2),
        "零钱",
        "已入账",
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function weightedPick(items, random) {
  const total = items.reduce((sumValue, item) => sumValue + item[5], 0);
  let cursor = random() * total;

  for (const item of items) {
    cursor -= item[5];
    if (cursor <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function weightedHour(random) {
  const hours = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ];
  const weights = [
    0.3, 0.1, 0.1, 0.05, 0.05, 0.1, 0.8, 2.2, 3.2, 2.4, 2.1, 4.8, 4.2, 2.8,
    2.2, 2.1, 2.7, 4.1, 5.3, 4.8, 3.1, 2.2, 1.4, 0.7,
  ];
  const total = weights.reduce((sumValue, value) => sumValue + value, 0);
  let cursor = random() * total;

  for (let index = 0; index < hours.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) {
      return hours[index];
    }
  }

  return 12;
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function niceCeiling(value) {
  if (value <= 10) {
    return 10;
  }
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const niceFraction = fraction <= 1.5 ? 1.5 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

function heatColor(ratio) {
  if (ratio <= 0) {
    return "#edf0ec";
  }
  const alpha = 0.12 + ratio * 0.78;
  return `rgba(23, 107, 77, ${alpha.toFixed(3)})`;
}

function sum(transactions) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

function getIncludedDayCount(transactions) {
  if (!transactions.length) {
    return 0;
  }
  const dates = transactions.map((transaction) => transaction.dateKey).sort();
  const start = parseDateKey(dates[0]);
  const end = parseDateKey(dates[dates.length - 1]);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function getLatestMonthKey(transactions) {
  if (!transactions.length) {
    return formatDateKey(new Date()).slice(0, 7);
  }
  return transactions
    .map((transaction) => transaction.dateKey.slice(0, 7))
    .sort()
    .at(-1);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function compactCurrency(value) {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`;
  }
  if (value >= 1000) {
    return `¥${(value / 1000).toFixed(1)}k`;
  }
  return `¥${Math.round(value)}`;
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimeKey(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

function truncateText(value, length) {
  const text = String(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function escapeCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function debounce(callback, delay) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => callback(...args), delay);
  };
}

let toastTimeout;

function showToast(message) {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 3200);
}
