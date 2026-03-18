// ============ 五维标签字典体系 ============
// Five-Dimensional Tag Dictionary System
// 将复杂的法律法规转化为结构化的合规要求

import type { Tag, TagDomain, TagMigrationMap } from "../types/tag";

// ============ 维度颜色配置 ============
const DOMAIN_COLORS: Record<TagDomain, string> = {
  OBJECT: "#3B82F6",    // blue-500
  SUBJECT: "#8B5CF6",   // violet-500
  LIFECYCLE: "#10B981", // emerald-500
  SECURITY: "#F59E0B",  // amber-500
  ACTION: "#EF4444",    // red-500
};

// ============ 1. 客体维度 (Object Domain) — 保护对象 ============
const OBJECT_TAGS: Tag[] = [
  {
    id: "obj-pi",
    code: "OBJ-PI",
    name: "个人信息",
    nameEn: "Personal Information",
    domain: "OBJECT",
    description: "与已识别或可识别的自然人相关的各种信息，不包括匿名化处理后的信息",
    weight: 3,
    keywords: ["个人信息", "自然人", "身份识别", "PII", "personal information", "用户数据"],
    relatedCodes: ["ACT-NOT", "ACT-CON", "ACT-RES"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "user",
  },
  {
    id: "obj-spi",
    code: "OBJ-SPI",
    name: "敏感个人信息",
    nameEn: "Sensitive Personal Information",
    domain: "OBJECT",
    description: "一旦泄露或非法使用，容易导致自然人的人格尊严受到侵害或人身、财产安全受到危害的个人信息",
    weight: 4,
    keywords: ["敏感信息", "生物识别", "宗教信仰", "特定身份", "金融账户", "行踪轨迹", "健康生理"],
    relatedCodes: ["OBJ-PI", "ACT-ASS", "ACT-CTR"],
    parentCode: "OBJ-PI",
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "shield-alert",
  },
  {
    id: "obj-imp",
    code: "OBJ-IMP",
    name: "重要数据",
    nameEn: "Important Data",
    domain: "OBJECT",
    description: "一旦遭到篡改、破坏、泄露或非法获取、非法利用，可能危害国家安全、经济运行、社会稳定、公共健康和安全的数据",
    weight: 5,
    keywords: ["重要数据", "国家安全", "经济运行", "社会稳定", "公共利益", "critical data"],
    relatedCodes: ["ACT-ASS", "ACT-REG", "SUB-CII"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "database",
  },
  {
    id: "obj-cor",
    code: "OBJ-COR",
    name: "核心数据",
    nameEn: "Core Data",
    domain: "OBJECT",
    description: "关系国家安全的数据，属于国家核心数据，实行更加严格的管理制度",
    weight: 6,
    keywords: ["核心数据", "国家核心数据", "国家安全", "重大命脉", "经济运行", "core data"],
    relatedCodes: ["OBJ-IMP", "ACT-ASS", "ACT-REG", "SUB-CII"],
    parentCode: "OBJ-IMP",
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "crown",
  },
  {
    id: "obj-cbi",
    code: "OBJ-CBI",
    name: "商业秘密",
    nameEn: "Commercial / Business Information",
    domain: "OBJECT",
    description: "不为公众所知悉、具有商业价值并经权利人采取相应保密措施的技术信息、经营信息等商业信息",
    weight: 2,
    keywords: ["商业秘密", "知识产权", "未公开信息", "保密信息", "trade secret", "IP"],
    relatedCodes: ["SEC-CRY", "SEC-ACC", "ACT-CTR"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "lock",
  },
  {
    id: "obj-log",
    code: "OBJ-LOG",
    name: "日志与审计数据",
    nameEn: "Log / Audit Data",
    domain: "OBJECT",
    description: "系统运行日志、访问记录、操作审计等用于安全审计和事件追溯的数据",
    weight: 2,
    keywords: ["日志数据", "访问记录", "操作日志", "审计日志", "audit log", "access log"],
    relatedCodes: ["SEC-AUD", "ACT-DOC", "ACT-REP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "clipboard-list",
  },
  {
    id: "obj-pi-chd",
    code: "OBJ-PI-CHD",
    name: "儿童个人信息",
    nameEn: "Children's Personal Information",
    domain: "OBJECT",
    description: "不满十四周岁未成年人的个人信息，适用特别保护规则",
    weight: 4,
    keywords: ["儿童信息", "未成年人", "14周岁", "COPPA", "儿童隐私", "children"],
    relatedCodes: ["OBJ-PI", "ACT-CON", "ACT-ASS"],
    parentCode: "OBJ-PI",
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.OBJECT,
    icon: "baby",
  },
];

// ============ 2. 主体维度 (Subject Domain) — 责任主体 ============
const SUBJECT_TAGS: Tag[] = [
  {
    id: "sub-pro",
    code: "SUB-PRO",
    name: "数据处理者",
    nameEn: "Data Processor",
    domain: "SUBJECT",
    description: "在数据处理活动中自主决定处理目的、处理方式的组织或个人",
    weight: 3,
    keywords: ["数据处理者", "控制者", "controller", "数据控制者", "处理目的"],
    relatedCodes: ["ACT-NOT", "ACT-REG", "SEC-ORG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "building",
  },
  {
    id: "sub-ent",
    code: "SUB-ENT",
    name: "受托处理者",
    nameEn: "Entrusted Processor",
    domain: "SUBJECT",
    description: "受数据处理者委托，按照约定处理数据的组织或个人",
    weight: 2,
    keywords: ["受托处理者", "处理者", "processor", "委托处理", "第三方处理"],
    relatedCodes: ["ACT-CTR", "SUB-PRO"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "handshake",
  },
  {
    id: "sub-cii",
    code: "SUB-CII",
    name: "关基运营者",
    nameEn: "CIIO (Critical Information Infrastructure Operator)",
    domain: "SUBJECT",
    description: "关键信息基础设施运营者，包括公共通信、能源、交通、水利、金融、公共服务、电子政务等重要行业",
    weight: 5,
    keywords: ["关基", "关键信息基础设施", "CII", "CIIO", "基础设施", "critical"],
    relatedCodes: ["OBJ-IMP", "OBJ-COR", "ACT-ASS", "ACT-REG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "shield",
  },
  {
    id: "sub-reg",
    code: "SUB-REG",
    name: "监管机关",
    nameEn: "Regulatory Authority",
    domain: "SUBJECT",
    description: "依法履行数据安全监管职责的行政机关，如网信、公安、市场监管等部门",
    weight: 4,
    keywords: ["监管机关", "网信部门", "公安机关", "市场监管", "regulator", "authority"],
    relatedCodes: ["ACT-REP", "ACT-AUD", "ACT-REM"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "scale",
  },
  {
    id: "sub-rep",
    code: "SUB-REP",
    name: "境内代表机构",
    nameEn: "Representative (Domestic)",
    domain: "SUBJECT",
    description: "境外数据处理者在境内设立的专门机构或者指定代表，负责处理数据保护相关事务",
    weight: 3,
    keywords: ["境内代表", "代表机构", "representative", "境外主体", "local representative"],
    relatedCodes: ["LIF-CBR", "ACT-REG", "ACT-CTR"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "map-pin",
  },
  {
    id: "sub-jnt",
    code: "SUB-JNT",
    name: "共同处理者",
    nameEn: "Joint Controllers",
    domain: "SUBJECT",
    description: "两个或两个以上的数据处理者共同决定数据处理目的和处理方式",
    weight: 3,
    keywords: ["共同处理", "联合控制", "joint controller", "多方处理", "连带责任"],
    relatedCodes: ["ACT-CTR", "SUB-PRO"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SUBJECT,
    icon: "users",
  },
];

// ============ 3. 业务流转维度 (Lifecycle Domain) — 业务环节 ============
const LIFECYCLE_TAGS: Tag[] = [
  {
    id: "lif-col",
    code: "LIF-COL",
    name: "数据收集",
    nameEn: "Collection",
    domain: "LIFECYCLE",
    description: "获取个人信息或数据的各个环节，包括直接收集、间接获取、自动采集等",
    weight: 3,
    keywords: ["收集", "采集", "获取", "前端埋点", "爬虫", "收集 consent", "collection"],
    relatedCodes: ["ACT-NOT", "ACT-CON", "OBJ-PI"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "download",
  },
  {
    id: "lif-sto",
    code: "LIF-STO",
    name: "数据存储",
    nameEn: "Storage",
    domain: "LIFECYCLE",
    description: "将数据保存于各种存储介质和环境的处理活动，包括本地存储、云存储等",
    weight: 3,
    keywords: ["存储", "保存", "本地化", "云上托管", "数据驻留", "storage", "retention"],
    relatedCodes: ["SEC-CRY", "SEC-AUD", "ACT-REG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "hard-drive",
  },
  {
    id: "lif-use",
    code: "LIF-USE",
    name: "使用加工",
    nameEn: "Usage / Processing",
    domain: "LIFECYCLE",
    description: "对数据进行加工、处理、分析、利用的活动，包括算法训练、用户画像、数据挖掘等",
    weight: 3,
    keywords: ["使用", "加工", "处理", "算法训练", "画像", "脱敏", "去标识化", "processing"],
    relatedCodes: ["ACT-ASS", "SEC-ACC", "OBJ-PI"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "cpu",
  },
  {
    id: "lif-pro",
    code: "LIF-PRO",
    name: "提供公开",
    nameEn: "Provision / Disclosure",
    domain: "LIFECYCLE",
    description: "向其他组织或个人提供数据，或公开披露数据的处理活动",
    weight: 4,
    keywords: ["提供", "公开", "共享", "交易", "转让", "披露", "disclosure", "sharing"],
    relatedCodes: ["ACT-NOT", "ACT-CON", "ACT-CTR", "OBJ-SPI"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "share-2",
  },
  {
    id: "lif-cbr",
    code: "LIF-CBR",
    name: "跨境传输",
    nameEn: "Cross-Border Transfer",
    domain: "LIFECYCLE",
    description: "将数据提供给境外接收方，或境外访问、调取境内数据的活动",
    weight: 5,
    keywords: ["跨境", "出境", "跨国传输", "海外节点", "境外访问", "CBT", "cross-border"],
    relatedCodes: ["ACT-ASS", "ACT-REG", "ACT-CTR", "SUB-REP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "globe",
  },
  {
    id: "lif-del",
    code: "LIF-DEL",
    name: "删除销毁",
    nameEn: "Deletion / Destruction",
    domain: "LIFECYCLE",
    description: "删除数据或使数据不可恢复的处理活动，包括响应用户删除请求、期限届满删除等",
    weight: 3,
    keywords: ["删除", "销毁", "匿名化", "期限届满", "删除权", "deletion", "erasure"],
    relatedCodes: ["ACT-RES", "ACT-AUD", "SEC-AUD"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "trash-2",
  },
  {
    id: "lif-bkp",
    code: "LIF-BKP",
    name: "备份恢复",
    nameEn: "Backup / Recovery",
    domain: "LIFECYCLE",
    description: "对数据进行备份存储，以及在数据丢失或损坏时进行恢复的活动",
    weight: 2,
    keywords: ["备份", "恢复", "容灾", "数据恢复", "灾难恢复", "backup", "recovery"],
    relatedCodes: ["SEC-VUL", "SEC-INC", "ACT-DOC"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.LIFECYCLE,
    icon: "archive",
  },
];

// ============ 4. 安全域维度 (Security Domain) — 保护手段 ============
const SECURITY_TAGS: Tag[] = [
  {
    id: "sec-org",
    code: "SEC-ORG",
    name: "组织保障",
    nameEn: "Organization",
    domain: "SECURITY",
    description: "建立数据安全组织架构和管理制度，如设立DPO、安全委员会、制定管理办法",
    weight: 3,
    keywords: ["组织", "DPO", "数据保护官", "安全委员会", "管理制度", "organization"],
    relatedCodes: ["SUB-PRO", "ACT-DOC", "ACT-AUD"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "sitemap",
  },
  {
    id: "sec-per",
    code: "SEC-PER",
    name: "人员管理",
    nameEn: "Personnel",
    domain: "SECURITY",
    description: "对数据处理相关人员进行背景调查、保密协议签署、合规培训等管理措施",
    weight: 3,
    keywords: ["人员", "背景调查", "保密协议", "NDA", "培训", "personnel", "staff"],
    relatedCodes: ["SEC-ORG", "ACT-DOC"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "user-check",
  },
  {
    id: "sec-acc",
    code: "SEC-ACC",
    name: "访问控制",
    nameEn: "Access Control",
    domain: "SECURITY",
    description: "实施身份鉴别、权限管理、最小权限原则、多因素认证等访问控制措施",
    weight: 4,
    keywords: ["访问控制", "身份鉴别", "权限", "MFA", "最小权限", "IAM", "access control"],
    relatedCodes: ["SEC-ORG", "SEC-AUD", "OBJ-IMP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "key",
  },
  {
    id: "sec-cry",
    code: "SEC-CRY",
    name: "密码技术",
    nameEn: "Cryptography",
    domain: "SECURITY",
    description: "采用加密技术保护数据，包括传输加密、存储加密、国密算法应用、密钥管理等",
    weight: 4,
    keywords: ["加密", "密码", "国密", "SM2", "SM3", "SM4", "TLS", "encryption", "crypto"],
    relatedCodes: ["SEC-ACC", "OBJ-SPI", "OBJ-IMP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "key-round",
  },
  {
    id: "sec-aud",
    code: "SEC-AUD",
    name: "安全审计",
    nameEn: "Audit",
    domain: "SECURITY",
    description: "记录和审查数据处理活动，包括日志留存(≥6个月)、审计追踪、防篡改等措施",
    weight: 3,
    keywords: ["审计", "日志", "日志留存", "审计追踪", "audit", "logging", "log retention"],
    relatedCodes: ["ACT-AUD", "ACT-DOC", "OBJ-LOG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "search",
  },
  {
    id: "sec-vul",
    code: "SEC-VUL",
    name: "漏洞管理",
    nameEn: "Vulnerability Management",
    domain: "SECURITY",
    description: "定期进行漏洞扫描、渗透测试，及时发现和修复安全漏洞",
    weight: 3,
    keywords: ["漏洞", "扫描", "渗透测试", "修复", "vulnerability", "scanning", "pentest"],
    relatedCodes: ["SEC-INC", "ACT-REP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "bug",
  },
  {
    id: "sec-inc",
    code: "SEC-INC",
    name: "应急响应",
    nameEn: "Incident Response",
    domain: "SECURITY",
    description: "建立安全事件应急响应机制，包括事件处置、取证分析、上报通报等",
    weight: 4,
    keywords: ["应急", "响应", "事件处置", "取证", "上报", "incident", "response", "breach"],
    relatedCodes: ["ACT-REP", "ACT-REM", "SEC-VUL"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.SECURITY,
    icon: "alert-triangle",
  },
];

// ============ 5. 动作义务维度 (Action Domain) — COU 核心 ============
const ACTION_TAGS: Tag[] = [
  {
    id: "act-not",
    code: "ACT-NOT",
    name: "告知义务",
    nameEn: "Notification",
    domain: "ACTION",
    description: "向数据主体告知数据处理相关事项，包括隐私政策、单独同意告知、变更通知等",
    weight: 4,
    keywords: ["告知", "通知", "隐私政策", "弹窗", "notice", "notification", "disclosure"],
    relatedCodes: ["LIF-COL", "OBJ-PI", "ACT-CON"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "bell",
  },
  {
    id: "act-con",
    code: "ACT-CON",
    name: "取得同意",
    nameEn: "Consent",
    domain: "ACTION",
    description: "在处理敏感个人信息等场景前，取得数据主体的明示同意、书面同意或单独同意",
    weight: 5,
    keywords: ["同意", "授权", "明示同意", "书面同意", "单独同意", "opt-in", "consent"],
    relatedCodes: ["ACT-NOT", "OBJ-SPI", "OBJ-PI-CHD", "LIF-COL"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "check-circle",
  },
  {
    id: "act-ass",
    code: "ACT-ASS",
    name: "评估审计",
    nameEn: "Assessment",
    domain: "ACTION",
    description: "开展各类评估活动，包括个人信息保护影响评估(PIA)、出境安全评估、等保测评等",
    weight: 5,
    keywords: ["评估", "PIA", "影响评估", "出境评估", "等保测评", "assessment", "PIA"],
    relatedCodes: ["LIF-CBR", "OBJ-SPI", "OBJ-IMP", "SUB-CII"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "clipboard-check",
  },
  {
    id: "act-rep",
    code: "ACT-REP",
    name: "备案报告",
    nameEn: "Reporting",
    domain: "ACTION",
    description: "向监管机构履行报告义务，包括漏洞上报、重大事件报告(72h)、年度报告等",
    weight: 5,
    keywords: ["报告", "上报", "备案", "72小时", "年报", "reporting", "notification"],
    relatedCodes: ["SEC-INC", "SEC-VUL", "SUB-REG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "file-text",
  },
  {
    id: "act-res",
    code: "ACT-RES",
    name: "响应请求",
    nameEn: "Response",
    domain: "ACTION",
    description: "响应数据主体行使权利的请求，包括查阅、复制、更正、删除、可携带等",
    weight: 4,
    keywords: ["响应", "查阅", "复制", "更正", "删除", "DSR", "rights request"],
    relatedCodes: ["OBJ-PI", "LIF-DEL"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "message-circle",
  },
  {
    id: "act-reg",
    code: "ACT-REG",
    name: "登记备案",
    nameEn: "Registration",
    domain: "ACTION",
    description: "依法履行各类登记备案义务，包括系统备案、算法备案、数据出境备案等",
    weight: 4,
    keywords: ["登记", "备案", "算法备案", "出境备案", "registration", "filing"],
    relatedCodes: ["SUB-CII", "LIF-CBR", "ACT-ASS"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "file-plus",
  },
  {
    id: "act-ctr",
    code: "ACT-CTR",
    name: "合同约束",
    nameEn: "Contract",
    domain: "ACTION",
    description: "通过合同条款约束数据处理活动，包括处理协议、标准合同条款(SCC)、数据处理协议(DPA)等",
    weight: 4,
    keywords: ["合同", "协议", "SCC", "DPA", "数据处理协议", "标准合同", "contract", "DPA"],
    relatedCodes: ["SUB-ENT", "LIF-CBR", "LIF-PRO"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "file-signature",
  },
  {
    id: "act-doc",
    code: "ACT-DOC",
    name: "记录留存",
    nameEn: "Documentation",
    domain: "ACTION",
    description: "记录和保存数据处理活动相关信息，包括处理活动记录、风险评估记录、培训记录等",
    weight: 3,
    keywords: ["记录", "留存", "文档", "ROPA", "处理活动记录", "documentation", "records"],
    relatedCodes: ["SEC-ORG", "SEC-AUD", "SEC-PER"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "folder-open",
  },
  {
    id: "act-aud",
    code: "ACT-AUD",
    name: "合规审计",
    nameEn: "Audit",
    domain: "ACTION",
    description: "定期开展合规审计，包括内部审计、第三方审计、合规检查等",
    weight: 4,
    keywords: ["审计", "合规审计", "内部审计", "第三方审计", "audit", "compliance audit"],
    relatedCodes: ["SEC-AUD", "SEC-ORG"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "search-check",
  },
  {
    id: "act-rem",
    code: "ACT-REM",
    name: "整改措施",
    nameEn: "Remediation",
    domain: "ACTION",
    description: "采取整改措施消除合规风险，包括停止处理、删除数据、限期整改等",
    weight: 5,
    keywords: ["整改", "停止处理", "删除", "限期", "remediation", "rectification"],
    relatedCodes: ["SEC-INC", "SUB-REG", "ACT-REP"],
    version: "1.0",
    status: "active",
    color: DOMAIN_COLORS.ACTION,
    icon: "wrench",
  },
];

// ============ 合并所有标签 ============
export const ALL_TAGS: Tag[] = [
  ...OBJECT_TAGS,
  ...SUBJECT_TAGS,
  ...LIFECYCLE_TAGS,
  ...SECURITY_TAGS,
  ...ACTION_TAGS,
];

// ============ 按维度分组的标签 ============
export const TAGS_BY_DOMAIN: Record<TagDomain, Tag[]> = {
  OBJECT: OBJECT_TAGS,
  SUBJECT: SUBJECT_TAGS,
  LIFECYCLE: LIFECYCLE_TAGS,
  SECURITY: SECURITY_TAGS,
  ACTION: ACTION_TAGS,
};

// ============ 标签索引（按 Code） ============
export const TAG_CODE_MAP: Record<string, Tag> = ALL_TAGS.reduce(
  (map, tag) => ({ ...map, [tag.code]: tag }),
  {}
);

// ============ 标签层级关系 ============
export const TAG_HIERARCHY: Record<string, string[]> = {
  "OBJ-PI": ["OBJ-SPI", "OBJ-PI-CHD"],
  "OBJ-IMP": ["OBJ-COR"],
};

// ============ 场景映射模板 ============
export const SCENE_TAG_TEMPLATES = {
  // 游戏出海场景
  GAME_OVERSEAS: {
    name: "游戏出海",
    requiredTags: ["LIF-CBR", "OBJ-PI"],
    preferredTags: ["ACT-ASS", "ACT-CTR", "ACT-REG", "ACT-NOT", "ACT-CON"],
    tagWeights: { "LIF-CBR": 2.0, "OBJ-PI": 1.5, "ACT-ASS": 2.0 },
  },
  // 金融等保场景
  FINANCE_COMPLIANCE: {
    name: "金融等保",
    requiredTags: ["SUB-CII", "OBJ-IMP"],
    preferredTags: ["SEC-ORG", "SEC-ACC", "SEC-CRY", "ACT-ASS", "ACT-AUD"],
    tagWeights: { "SUB-CII": 2.5, "OBJ-IMP": 2.0, "ACT-ASS": 1.8 },
  },
  // 电商合规场景
  ECOMMERCE_COMPLIANCE: {
    name: "电商合规",
    requiredTags: ["OBJ-PI", "LIF-COL"],
    preferredTags: ["ACT-NOT", "ACT-CON", "ACT-RES", "SEC-ACC", "SEC-AUD"],
    tagWeights: { "OBJ-PI": 1.5, "LIF-COL": 1.3, "ACT-NOT": 1.5 },
  },
  // 医疗数据场景
  HEALTHCARE_DATA: {
    name: "医疗数据",
    requiredTags: ["OBJ-SPI", "SUB-PRO"],
    preferredTags: ["ACT-ASS", "SEC-CRY", "SEC-ACC", "ACT-CTR", "ACT-DOC"],
    tagWeights: { "OBJ-SPI": 2.5, "ACT-ASS": 2.0, "SEC-CRY": 1.8 },
  },
  // 智慧城市场景
  SMART_CITY: {
    name: "智慧城市",
    requiredTags: ["OBJ-IMP", "SUB-CII"],
    preferredTags: ["SEC-ORG", "SEC-AUD", "ACT-REG", "ACT-REP", "LIF-BKP"],
    tagWeights: { "OBJ-IMP": 2.5, "SUB-CII": 2.0, "ACT-REG": 1.8 },
  },
  // 教育科技场景
  EDTECH_COMPLIANCE: {
    name: "教育科技",
    requiredTags: ["OBJ-PI-CHD", "LIF-COL"],
    preferredTags: ["ACT-CON", "ACT-NOT", "SEC-PER", "ACT-ASS", "ACT-CTR"],
    tagWeights: { "OBJ-PI-CHD": 2.5, "ACT-CON": 2.0, "ACT-NOT": 1.8 },
  },
};

// ============ 旧标签迁移映射 ============
export const TAG_MIGRATION_MAP: TagMigrationMap[] = [
  { legacyTagName: "个人信息保护", newTagCodes: ["OBJ-PI", "OBJ-SPI"], confidence: 0.95 },
  { legacyTagName: "数据出境", newTagCodes: ["LIF-CBR", "ACT-ASS", "ACT-REG"], confidence: 0.9 },
  { legacyTagName: "安全评估", newTagCodes: ["ACT-ASS", "SEC-VUL"], confidence: 0.85 },
  { legacyTagName: "加密要求", newTagCodes: ["SEC-CRY"], confidence: 0.95 },
  { legacyTagName: "备案管理", newTagCodes: ["ACT-REG", "ACT-DOC"], confidence: 0.9 },
  { legacyTagName: "应急响应", newTagCodes: ["SEC-INC", "ACT-REP"], confidence: 0.9 },
  { legacyTagName: "数据分类分级", newTagCodes: ["OBJ-PI", "OBJ-SPI", "OBJ-IMP", "OBJ-COR"], confidence: 0.85 },
  { legacyTagName: "风险评估", newTagCodes: ["ACT-ASS"], confidence: 0.95 },
  { legacyTagName: "合规审计", newTagCodes: ["ACT-AUD", "SEC-AUD"], confidence: 0.9 },
  { legacyTagName: "技术标准", newTagCodes: ["SEC-CRY", "SEC-ACC", "SEC-AUD"], confidence: 0.8 },
  { legacyTagName: "网络安全", newTagCodes: ["SEC-VUL", "SEC-INC", "SEC-ACC"], confidence: 0.85 },
  { legacyTagName: "关键信息基础设施", newTagCodes: ["SUB-CII", "OBJ-IMP"], confidence: 0.95 },
  { legacyTagName: "密码应用", newTagCodes: ["SEC-CRY"], confidence: 0.95 },
  { legacyTagName: "数据安全责任", newTagCodes: ["SUB-PRO", "SEC-ORG", "ACT-DOC"], confidence: 0.85 },
];

// ============ 辅助函数 ============

/** 根据 Code 获取标签 */
export function getTagByCode(code: string): Tag | undefined {
  return TAG_CODE_MAP[code];
}

/** 根据维度获取标签列表 */
export function getTagsByDomain(domain: TagDomain): Tag[] {
  return TAGS_BY_DOMAIN[domain] || [];
}

/** 获取标签的所有祖先（继承链） */
export function getTagAncestors(code: string): Tag[] {
  const tag = getTagByCode(code);
  if (!tag || !tag.parentCode) return [];
  const parent = getTagByCode(tag.parentCode);
  if (!parent) return [];
  return [parent, ...getTagAncestors(parent.code)];
}

/** 获取标签的所有后代 */
export function getTagDescendants(code: string): Tag[] {
  const children = TAG_HIERARCHY[code] || [];
  const childTags = children.map(getTagByCode).filter(Boolean) as Tag[];
  const descendants = childTags.flatMap((child) => getTagDescendants(child.code));
  return [...childTags, ...descendants];
}

/** 获取标签的关联标签 */
export function getRelatedTags(code: string): Tag[] {
  const tag = getTagByCode(code);
  if (!tag || !tag.relatedCodes) return [];
  return tag.relatedCodes.map(getTagByCode).filter(Boolean) as Tag[];
}

/** 检查标签是否匹配（支持层级继承） */
export function isTagMatch(couTagCodes: string[], queryTagCodes: string[]): boolean {
  // 直接匹配
  const directMatch = couTagCodes.some((code) => queryTagCodes.includes(code));
  if (directMatch) return true;

  // 继承匹配：查询标签是否是 COU 标签的祖先或后代
  for (const couCode of couTagCodes) {
    const ancestors = getTagAncestors(couCode).map((t) => t.code);
    const descendants = getTagDescendants(couCode).map((t) => t.code);
    const related = getRelatedTags(couCode).map((t) => t.code);

    const allRelatedCodes = [couCode, ...ancestors, ...descendants, ...related];
    if (queryTagCodes.some((code) => allRelatedCodes.includes(code))) {
      return true;
    }
  }

  return false;
}

/** 计算标签匹配分数 */
export function calculateTagMatchScore(
  couTagCodes: string[],
  queryTagCodes: string[],
  options: { includeRelated?: boolean; includeHierarchy?: boolean } = {}
): number {
  const { includeRelated = true, includeHierarchy = true } = options;

  let matchCount = 0;
  let totalWeight = 0;

  for (const queryCode of queryTagCodes) {
    const queryTag = getTagByCode(queryCode);
    if (!queryTag) continue;

    totalWeight += queryTag.weight;

    // 直接匹配
    if (couTagCodes.includes(queryCode)) {
      matchCount += queryTag.weight * 1.0;
      continue;
    }

    if (includeHierarchy) {
      // 祖先匹配（部分匹配）
      for (const couCode of couTagCodes) {
        const ancestors = getTagAncestors(couCode);
        if (ancestors.some((t) => t.code === queryCode)) {
          matchCount += queryTag.weight * 0.8;
          break;
        }

        // 后代匹配
        const descendants = getTagDescendants(couCode);
        if (descendants.some((t) => t.code === queryCode)) {
          matchCount += queryTag.weight * 0.9;
          break;
        }
      }
    }

    if (includeRelated) {
      // 关联匹配
      for (const couCode of couTagCodes) {
        const related = getRelatedTags(couCode);
        if (related.some((t) => t.code === queryCode)) {
          matchCount += queryTag.weight * 0.6;
          break;
        }
      }
    }
  }

  return totalWeight > 0 ? matchCount / totalWeight : 0;
}

export default ALL_TAGS;
