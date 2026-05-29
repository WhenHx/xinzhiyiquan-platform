document.addEventListener("DOMContentLoaded", () => {
  const pages = Array.from(document.querySelectorAll(".page"));
  const navButtons = Array.from(document.querySelectorAll(".side-nav button"));
  const toast = document.querySelector("#toast");
  const saveState = document.querySelector("#saveState");

  const state = {
    caseType: "配送途中受伤 / 工伤认定",
    platform: "某外卖平台A · 苏州工业园区星湖站",
    incidentTime: "2026-05-12 11:36",
    description: "配送第18单途中摔伤，平台称我是合作关系，不能认定工伤。",
    evidence: new Set(["订单截图", "GPS轨迹", "聊天记录", "病历票据", "接单记录", "定位轨迹", "医疗票据"]),
    evidencePackage: [],
  };

  const clauseRules = [
    {
      key: "不构成劳动关系",
      title: "劳动关系规避条款",
      risk: "红色",
      suggestion: "建议保留平台派单、站点排班、超时罚款、账号封禁、收入结算等实际管理证据。",
    },
    {
      key: "站点排班",
      title: "管理从属性线索",
      risk: "橙色",
      suggestion: "该条款反向证明平台存在组织管理，应补充站长群通知和排班记录。",
    },
    {
      key: "自行承担",
      title: "事故责任排除条款",
      risk: "红色",
      suggestion: "建议替换为平台依法履行安全保障和职业伤害保障协助义务。",
    },
    {
      key: "单方调整",
      title: "结算规则单方变更",
      risk: "橙色",
      suggestion: "建议要求平台保留规则变更日志、通知记录和扣款明细。",
    },
  ];

  const baseEvidence = [
    ["接单记录", "事故当天第18单，11:20接单，11:36轨迹中断"],
    ["聊天记录", "站长要求继续配送并在群内确认事故报备"],
    ["支付记录", "近30天收入流水与扣款明细"],
    ["定位轨迹", "GPS显示事故发生于配送任务路线"],
    ["医疗票据", "急诊病历、诊断证明、发票和复诊建议"],
    ["事故报备", "平台事故报备截图与客服回复"],
  ];

  const evidenceAliases = {
    接单记录: ["接单记录", "订单截图"],
    聊天记录: ["聊天记录"],
    支付记录: ["支付记录", "收入流水"],
    定位轨迹: ["定位轨迹", "GPS轨迹"],
    医疗票据: ["医疗票据", "病历票据"],
    事故报备: ["事故报备"],
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function markSaved(text = "已生成") {
    if (!saveState) return;
    saveState.textContent = text;
    saveState.style.color = "var(--green)";
  }

  function switchPage(pageName) {
    pages.forEach((page) => page.classList.toggle("active", page.id === `page-${pageName}`));
    navButtons.forEach((button) => button.classList.toggle("active", button.dataset.page === pageName));
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => switchPage(button.dataset.page));
  });

  function canonicalEvidenceCount() {
    return baseEvidence.filter(([name]) => evidenceAliases[name].some((alias) => state.evidence.has(alias))).length;
  }

  function syncForm() {
    document.querySelector("#caseType").value = state.caseType;
    document.querySelector("#platformName").value = state.platform;
    document.querySelector("#incidentTime").value = state.incidentTime;
    document.querySelector("#caseDesc").value = state.description;
    document.querySelector("#miniCaseName").textContent = state.caseType;
    document.querySelectorAll("[data-evidence]").forEach((button) => {
      button.classList.toggle("selected", state.evidence.has(button.dataset.evidence));
    });
  }

  function collectCase() {
    state.caseType = document.querySelector("#caseType").value;
    state.platform = document.querySelector("#platformName").value.trim();
    state.incidentTime = document.querySelector("#incidentTime").value.trim();
    state.description = document.querySelector("#caseDesc").value.trim();
    document.querySelector("#miniCaseName").textContent = state.caseType;
  }

  function runCaseAnalysis() {
    collectCase();
    const desc = `${state.caseType} ${state.description} ${state.platform}`;
    let risk = 68;
    if (/工伤|受伤|事故|摔伤/.test(desc)) risk += 12;
    if (/合作关系|劳动关系|不能认定/.test(desc)) risk += 8;
    if (/扣款|封号|罚款/.test(desc)) risk += 5;
    risk += Math.min(8, canonicalEvidenceCount() * 2);
    risk = Math.min(96, risk);

    const level = risk >= 85 ? "高风险" : risk >= 75 ? "中高风险" : "中风险";
    document.querySelector("#workerRisk").textContent = `${level} ${risk}`;
    document.querySelector("#workerRiskText").textContent =
      risk >= 85
        ? "平台否认劳动关系，但存在派单、考核、扣款和站点管理线索，建议进入法援复核。"
        : "证据线索已形成初步闭环，建议继续补充平台管理和事故发生时点材料。";

    const list = document.querySelector("#supplementList");
    list.innerHTML = "";
    const items = [
      "站长排班截图与事故报备原图",
      "事故当天订单轨迹与超时记录",
      "医院诊断证明、发票、复诊建议",
      "收入流水与平台扣款明细",
    ];
    if (!state.evidence.has("聊天记录")) items.unshift("站长群聊天原图与时间戳");
    if (!state.evidence.has("GPS轨迹") && !state.evidence.has("定位轨迹")) items.unshift("事故前后30分钟GPS轨迹");
    items.slice(0, 5).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });

    const score = Math.min(94, 58 + canonicalEvidenceCount() * 7);
    document.querySelector("#materialCount").textContent = canonicalEvidenceCount();
    document.querySelector("#evidenceScore").textContent = `${score}%`;
    document.querySelector(".material-progress i").style.setProperty("--w", `${score}%`);
    markSaved("案例已建档");
    showToast("AI已完成初步建档，补证清单和风险等级已更新。");
  }

  document.querySelectorAll("[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.evidence;
      if (state.evidence.has(name)) state.evidence.delete(name);
      else state.evidence.add(name);
      button.classList.toggle("selected", state.evidence.has(name));
    });
  });

  function renderContractReview() {
    const text = document.querySelector("#contractText").value;
    const matched = clauseRules.filter((rule) => text.includes(rule.key));
    const list = document.querySelector("#clauseList");
    list.innerHTML = "";
    matched.forEach((rule, index) => {
      const node = document.createElement("article");
      node.className = "clause-item";
      node.innerHTML = `<b>${index + 1}. ${rule.risk}风险 · ${rule.title}</b><p>${rule.suggestion}</p>`;
      list.append(node);
    });
    if (!matched.length) {
      list.innerHTML = `<article class="clause-item"><b>未发现高频风险条款</b><p>建议继续上传完整协议、平台规则和结算说明。</p></article>`;
    }
    const score = Math.min(96, 64 + matched.length * 7);
    document.querySelector("#contractScore").textContent = `${score >= 85 ? "高风险" : "中风险"} ${score}`;
    markSaved("合同审查已完成");
  }

  function simpleHash(input) {
    let h1 = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
      h1 ^= input.charCodeAt(i);
      h1 = Math.imul(h1, 0x01000193);
    }
    const hex = (h1 >>> 0).toString(16).padStart(8, "0");
    return `${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`;
  }

  async function digest(text) {
    if (window.crypto?.subtle) {
      const data = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    return simpleHash(text);
  }

  async function buildEvidencePackage() {
    collectCase();
    const selected = baseEvidence.filter(([name]) => evidenceAliases[name].some((alias) => state.evidence.has(alias)));
    const source = selected.length ? selected : baseEvidence.slice(0, 4);
    state.evidencePackage = [];
    for (const [name, detail] of source) {
      const hash = await digest(`${state.platform}|${state.incidentTime}|${name}|${detail}`);
      state.evidencePackage.push({ name, detail, hash, time: state.incidentTime });
    }
    renderEvidencePackage();
    markSaved("证据包已生成");
  }

  function renderEvidencePackage() {
    const list = document.querySelector("#evidenceTimeline");
    list.innerHTML = "";
    state.evidencePackage.forEach((item, index) => {
      const node = document.createElement("article");
      node.innerHTML = `<small>${String(index + 1).padStart(2, "0")} · ${item.time}</small><b>${item.name}：${item.detail}</b><code>${item.hash}</code>`;
      list.append(node);
    });
    const score = Math.min(96, 58 + state.evidencePackage.length * 7);
    document.querySelector("#packageScore").textContent = `${score}%`;
    document.querySelector("#packageCount").textContent = `${state.evidencePackage.length}类${state.evidencePackage.length * 4 - 1}项`;
  }

  document.querySelector("#startCase").addEventListener("click", runCaseAnalysis);
  document.querySelector("#reviewContract").addEventListener("click", () => {
    renderContractReview();
    showToast("合同审查完成，风险条款已标注。");
  });
  document.querySelector("#buildEvidence").addEventListener("click", async () => {
    await buildEvidencePackage();
    showToast("证据链已固化，哈希清单和时间线摘要已生成。");
  });
  document.querySelector("#continueVoice").addEventListener("click", () => {
    document.querySelector("#chatDynamic").textContent = "AI追问：事故发生时是否正在执行平台派单？站长是否要求按时上线？";
    showToast("语音问诊已记录新的追问问题。");
  });
  document.querySelector("#generateLegal").addEventListener("click", () => {
    document.querySelector("#chatDynamic").textContent = "已生成：仲裁申请摘要、补证清单、律师复核提示和事故时间线。";
    markSaved("法援材料已生成");
    showToast("法援材料已生成，可进入证据包页面下载。");
  });
  document.querySelector("#quickRun").addEventListener("click", async () => {
    runCaseAnalysis();
    renderContractReview();
    await buildEvidencePackage();
    showToast("已完成建档、合同审查和证据包生成。");
  });
  document.querySelector("#downloadPackage").addEventListener("click", async () => {
    if (!state.evidencePackage.length) await buildEvidencePackage();
    const payload = {
      caseType: state.caseType,
      platform: state.platform,
      incidentTime: state.incidentTime,
      description: state.description,
      evidencePackage: state.evidencePackage,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "新职权益-证据包.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("证据包 JSON 已下载。");
  });
  document.querySelector("#resetDemo").addEventListener("click", async () => {
    state.caseType = "配送途中受伤 / 工伤认定";
    state.platform = "某外卖平台A · 苏州工业园区星湖站";
    state.incidentTime = "2026-05-12 11:36";
    state.description = "配送第18单途中摔伤，平台称我是合作关系，不能认定工伤。";
    state.evidence = new Set(["订单截图", "GPS轨迹", "聊天记录", "病历票据", "接单记录", "定位轨迹", "医疗票据"]);
    state.evidencePackage = [];
    syncForm();
    runCaseAnalysis();
    renderContractReview();
    await buildEvidencePackage();
    showToast("演示案例已重置。");
  });

  syncForm();
  renderContractReview();
  buildEvidencePackage();
});
