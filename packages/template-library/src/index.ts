import type { ThemeDefinition } from '@theme-engine/core';
import { builtinThemes } from '@theme-engine/core';

export interface TemplateDefinition {
  id: string;
  title: string;
  summary: string;
  themeId: ThemeDefinition['id'];
  tags: string[];
  category: string;
  useCase: string;
  version: string;
  updatedAt: string;
  author: string;
  content: string;
  coverImage?: string;
}

const templates: TemplateDefinition[] = [
  {
    id: 'aurora-tech-launch',
    title: 'Aurora·新品发布套件',
    summary: '渐变霓虹视觉，为科技新品或创新工具打造高亮发布稿。',
    themeId: 'tech-spectrum',
    tags: ['新品发布', '产品亮点', '科技'],
    category: '科技·产品',
    useCase: '适用于科技新品发布、功能亮点速览、创投项目展示。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=compress&fit=crop&w=1200&q=80',
    content: `# Aurora 发布会｜Lumen OS 5

> 以「One canvas for all workflows」为灵感，呈现一次真正轻盈的跨设备体验。

## 亮点速览

- **Adaptive Halo UI**：自适应渐层视觉，依据场景动态调整冷暖色与字体粗细。
- **Cosmos Link**：手机、平板、桌面端统一通知与指令中心，延迟低于 32ms。
- **Studio Capsule**：一键生成会议摘要、行动项与排期，自动同步到协作平台。

![Lumen OS 5 界面](https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=compress&fit=crop&w=1200&q=80)

## 体验片段

| 场景 | 演示要点 | 成果 |
| --- | --- | --- |
| 创意提案 | 远程白板实时推送至所有设备 | 协同准备时间减少 28% |
| 客户演示 | 光感传感器自动校准亮度 | 客户满意度评分 4.7 / 5 |
| 数据运营 | 语音指令调用 KPI 面板 | 周会准备时间缩短 40% |

## 数据背书

- Beta 等候名单新增 **18,432** 人，邀请转化率 62%。
- 客户成功团队 NPS 达到 **71**，高于行业平均 18 分。
- 渠道伙伴完成 **12** 场路演，覆盖 6 个核心城市。

> “Lumen OS 5 把我们从指令里解放出来，只剩创造力。” —— Early Bird 计划用户

## 上市节奏

- 10/26 开启种子用户升级通道。
- 11/05 企业白名单开放，支持 API 集成。
- 11/20 发布媒体工具包与主题素材库。

- [预约深度演示](https://aurora.example.com/demo)
- [下载媒体资源包](https://aurora.example.com/press)
`
  },
  {
    id: 'velvet-brand-story',
    title: 'Velvet·品牌叙事手稿',
    summary: '暖雾调手帐视觉，强调人情味与生活方式氛围。',
    themeId: 'warm-note',
    tags: ['品牌故事', '生活方式', '调性塑造'],
    category: '生活方式',
    useCase: '适用于生活方式品牌故事、旗舰店特写、社群运营内容。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1495562569060-2eec283d3391?auto=compress&fit=crop&w=1200&q=80',
    content: `# 柔雾里的日常｜Velvet Atelier 的品牌心跳

![品牌空间](https://images.unsplash.com/photo-1495562569060-2eec283d3391?auto=compress&fit=crop&w=1200&q=80)

## 品牌自述

- 2019 年春天，我们在老城区的砖墙里点亮第一盏暖灯。
- 现在，三家门店、一个巡回快闪与线上社群，共同组成 Velvet 的生活地图。
- 大家常说这里像一封可触摸的情书，留给愿意慢下来的每个人。

## 三个感官锚点

- **味觉**：每日十五份的桂花白桃巴斯克，奶香里藏着雨后青草。
- **触感**：手工羊毛毯与亚麻抱枕，编织出冬夜电影场的柔软背景。
- **听觉**：驻店策划人每月精选 12 首播放列表，周五夜晚会变成城市里的私密派对。

## 社群温度

> “Velvet 让我们记起，好看的生活也需要真实的触觉。” —— 社群成员 Lynn

- 每周五的「Sunset Tales」读书会，报名 30 秒即满。
- 线上社群自发整理「Velvet City Guide」，记录城中温柔角落。
- 联名单独插画师推出的限量杯套，首批 480 套即日售罄。

## 下月日程

- 11/02 「手写明信片」工作坊，记录你与 Velvet 的记忆。
- 11/12 亚麻餐桌体验，共同探索冬日风味菜单。
- 11/26 社群摄影展揭幕，开放投稿与线下分享。

关注公众号【Velvet Atelier】，与我们一起为生活留白。
`
  },
  {
    id: 'pulseops-weekly-brief',
    title: 'PulseOps·运营周度简报',
    summary: '公众号标准化布局，突出指标变化与下一步行动。',
    themeId: 'wechat-medium',
    tags: ['运营', '周报', '增长'],
    category: '企业运营',
    useCase: '适用于运营周报、营销复盘、跨部门同步。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=compress&fit=crop&w=1200&q=80',
    content: `# PulseOps 周度摘要｜Week 42

> 重点围绕「双十一预热」「私域留存」与「客服体验升级」，请相关条线协同落地。

## 本周进展

- 商城专题页上线 18 套视觉，推送 CTR 达 **18.3%**。
- 私域社群增长 2,360 人，裂变海报「秋日保暖指南」表现最佳。
- 客服机器人更新热点问答库，人工转人工率下降 21%。

## 核心指标

| 指标 | 本周 | 环比 | 备注 |
| --- | --- | --- | --- |
| 新增关注 | 3,842 | +14% | 直播预热贡献 62% |
| 阅读完成率 | 71% | +6% | 加入章节导航 |
| 小程序跳转 | 2,104 | +12% | 导购路线改版 |
| 客服满意度 | 4.82 | +0.3 | 冬季权益答疑 |

## 声音与洞察

> “周更的内容节奏非常稳，建议继续强化专题页与小程序互导。” —— 品牌 VP

- 用户对「保暖换新」主题的收藏率较高，可延伸冬季换装场景。
- 高峰时段客服响应达标，周末夜间需补充临时人手。
- 下一阶段重点增强积分商城活动曝光。

## 下周动能

- 10/24 完成社群内容排期，输出 7 条秋冬搭配脚本。
- 10/25 提交「黑五预热」物料包审核，重点校对 CTA 话术。
- 10/27 完成客服机器人意图训练增量，覆盖物流退换问题。
`
  },
  {
    id: 'nebula-roadmap-dispatch',
    title: 'Nebula·路线图速递',
    summary: '科技感信息层级，适合版本规划、模块亮点与风险提示。',
    themeId: 'wechat-tech',
    tags: ['路线图', '技术发布', '版本规划'],
    category: '科技·产品',
    useCase: '适用于产品路线图、技术规划通告、合作伙伴同步。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=compress&fit=crop&w=1200&q=80',
    content: `# Nebula Roadmap Dispatch｜Release 2.2

- 面向客户与生态伙伴的季度能力更新，请结合技术白皮书同步。

## 新增模块

1. **Smart API Mesh**：自动发现服务、细粒度限流策略以及健康度仪表盘。
2. **Insight Data Layer**：统一指标规范，支持跨环境回溯与权限隔离。
3. **Secure Edge**：多因子认证 + 行为指纹防护，关键接口默认启用签名。

## 技术速览

\`\`\`bash
pnpm install
pnpm exec prisma migrate deploy
pnpm run bootstrap
pnpm dev:web
\`\`\`

## 风险与依赖

| 模块 | 负责人 | 风险等级 | 跟进计划 |
| --- | --- | --- | --- |
| Smart API Mesh | 李洋 | 中 | 10/28 灰度至 30% 流量，观察延迟曲线 |
| Insight Data Layer | 王璐 | 低 | 与 BI 团队对齐字段映射，完成自测 |
| Secure Edge | 周琪 | 高 | 10/26 前完成第三方签名升级 |

> “请保持发布说明与开发者中心同步，避免重复提交工单。”

## 下一步

- 10/29 完成 SDK 文档更新与示例代码。
- 11/02 启动第二批客户培训营，重点讲解数据权限组装。
- 11/10 发布生态插件兼容性测试结果。
`
  },
  {
    id: 'global-affairs-compass',
    title: 'Global Affairs·深度罗盘',
    summary: '纽约时报风格的国际局势解析模板，强调数据与观点平衡。',
    themeId: 'wechat-nyt',
    tags: ['国际', '分析', '评论'],
    category: '国际事务',
    useCase: '适用于国际局势分析、市场研究、智库观点。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1465446751832-9f11e15d17d2?auto=compress&fit=crop&w=1200&q=80',
    content: `# 特稿｜全球产链重塑的三重脉络

> 人口红利、关税博弈与技术标准正在共同书写新的制造地图。

## 关键驱动力

1. **劳动力结构**：东南亚人口中位年龄 30 岁，制造业薪资保持吸引力。
2. **贸易政策**：RCEP 生效后，区域内 92% 商品将在十年内降至零关税。
3. **技术标准**：新能源车零部件标准化成为跨区域合作的催化剂。

## 投资热度

| 地区 | 投资增长 | 重点行业 | 侧写 |
| --- | --- | --- | --- |
| 越南 | +18% | 电子组装、纺织 | 北部工业园区用地趋紧 |
| 墨西哥 | +12% | 汽车零部件、家电 | 受益于“近岸外包”补贴 |
| 波兰 | +9% | 电池、精密制造 | 欧盟绿色基金加速流入 |

## 观察者视角

- 政策顾问：供应链“回流”并非逆全球化，而是向多节点演化。
- 跨国企业 COO：自动化水平决定多地部署时的成本曲线。
- 区域智库学者：数据透明度将成为下一轮竞争力锚点。

> “如果不能兼顾政策红利与技术标准协同，重塑就会沦为成本迁移。”

## 结语

理解全球供应链的下一步，需要同时追踪政策、劳动力与技术标准的交汇。任何单一视角都可能错过窗口期。
`
  },
  {
    id: 'capital-markets-ledger',
    title: 'Capital Ledger·市场周刊',
    summary: '金融时报配色，突出资产表现、策略建议与风险提示。',
    themeId: 'wechat-ft',
    tags: ['金融', '市场', '策略'],
    category: '财经金融',
    useCase: '适用于投研周报、策略明细、客户简报。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=compress&fit=crop&w=1200&q=80',
    content: `# Capital Ledger｜Week 42

> 主要资产进入区间震荡，通胀预期与原油价格再度成为焦点。

## 本周焦点

- **宏观数据**：美国制造业 PMI 反弹至 49.8，中国财新 PMI 连续三月站上荣枯线。
- **能源价格**：布伦特原油回落至 83 美元/桶，库存数据表明需求边际回升。
- **汇率走势**：美元指数在 104-106 区间震荡，新兴市场货币承压。

## 资产表现

| 资产 | 本周涨跌幅 | 年内表现 | 观点 |
| --- | --- | --- | --- |
| 标普 500 | +1.6% | +12.4% | 科技龙头驱动反弹，仍建议控制仓位 |
| 恒生指数 | -0.8% | -6.2% | 关注政策发力节奏，等待量能确认 |
| 黄金 | +0.9% | +8.7% | 通胀对冲需求延续，可逢低增持 |

## 配置建议

1. **股票**：高股息能源 vs 科技成长 6:4，择机加仓半导体链。
2. **固收**：延长久期至 5-7 年，关注 AAA 城投与国企信用。
3. **另类**：原油回调后可分批布局，多单止损设在 7,900 美元/吨。

## 风险提示

- 地缘政治引发的能源供给扰动。
- 美联储政策路径偏离市场预期。
- 新兴市场资本外流加速。
`
  },
  {
    id: 'anthropic-lab-journal',
    title: 'Anthropic Lab·研究周记',
    summary: 'Claude 风格排版，记录实验进展、评测数据与反思。',
    themeId: 'wechat-anthropic',
    tags: ['AI', '研究', '周报'],
    category: 'AI·研究',
    useCase: '适用于 AI 研究日志、实验室周记、模型更新播报。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=compress&fit=crop&w=1200&q=80',
    content: `# Anthropic Lab Journal｜Week 42

> 关键词：多模态检索、轻量化部署、对齐反馈。

## 里程碑

- **多模态检索**：完成 3,200 对图文标注，引入模态对齐 loss。
- **推理速度**：7B 模型加入稀疏注意力，平均推理提速 18%。
- **人类反馈**：开放社区评审团测试，收集 240 份高质量评价。

## 评测快照

| 数据集 | 上周 | 本周 | 提升 |
| --- | --- | --- | --- |
| MMBench-Full | 63.5 | 65.1 | +1.6 |
| ChineseBench | 78.2 | 80.4 | +2.2 |
| SafetyEval | 92.4 | 93.0 | +0.6 |

## 反思笔记

> “我们需要在对齐体验与推理速度之间找到更优平衡。”

- 轻量版模型需在移动端补充更细致性能采样。
- 多语言 Prompt 仍偏重英文，Q4 将扩充高质量中文语料。
- 计划建立 Prompt Playground，共创高质量指令集。

## 下周计划

- 完成多模态数据的 bias 审视报告。
- 推出开放黑客松第二期，邀请社区开发者共创。
- 发布安全团队关于敏感问答的更新指引。
`
  },
  {
    id: 'civic-impact-investigation',
    title: 'Civic Impact·调查手记',
    summary: '卫报风格呈现调查时间线、证据链与行动建议。',
    themeId: 'guardian',
    tags: ['调查', '公益', '城市'],
    category: '社会观察',
    useCase: '适用于公益调研、公共议题追踪、深度报道。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=compress&fit=crop&w=1200&q=80',
    content: `# 深度调查｜城市「微工地」的安全空窗

> 当“快速度”成为唯一答案，谁来守住城市安全的底线？

## 调查时间线

- **7 月 2 日**：首例事故发生，造成 3 人受伤。
- **7 月 15 日**：匿名线索征集上线，收到 42 份反馈。
- **8 月 8 日**：与市政部门核对 27 份施工备案，发现 9 份缺失安全评估。

## 核心发现

1. **监管缝隙**：45% 小型工地未按要求完成第三方检测。
2. **用工不稳定**：80% 工人以日结形式聘用，平均培训时长不足 90 分钟。
3. **公众反馈**：噪音投诉高峰集中在工作日凌晨 2 点至 4 点。

| 证据类型 | 数量 | 备注 |
| --- | --- | --- |
| 现场照片 | 63 | 包含夜间作业记录 |
| 政府公文 | 11 | 其中 4 份尚未签署 |
| 受访者录音 | 18 | 已完成变声处理 |

> “不是我们不想守规则，而是项目周期太短，安全检查排不上号。” —— 某工地包工头

## 行动建议

- 市政部门建立「微工地」备案公示制度，引入现场 QR 查验。
- 推行夜间作业噪音实时监测，数据向社区代表开放。
- 建立施工前 30 分钟安全复核清单，纳入验收标准。
`
  },
  {
    id: 'savoir-culture-review',
    title: 'Savoir·文化展评稿',
    summary: 'Le Monde 文风，适合文化评论、艺术展览随笔。',
    themeId: 'lemonde',
    tags: ['文化', '展览', '评论'],
    category: '文化艺术',
    useCase: '适用于展览评论、艺术节报道、文化观察。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=compress&fit=crop&w=1200&q=80',
    content: `# 巴黎笔记｜光影之间的重量

> 柔和的光覆在粗粝的石墙上，像是一封在夜里慢慢展开的信。

## 策展路径

- **序章**：从煤油灯到 OLED，光的故事被拆解成六个日常情境。
- **材料间**：温度、气味与音景唤起记忆，邀请观众重新认识时间。
- **回声厅**：三位新锐设计师以短片回应“光是否需要被设计”。

## 参观者问题

1. 光是为了被看见，还是为了让其他事物被看见？
2. 当我们习惯氛围光，是否忽略了能源的真实成本？
3. 是否可以用更低的亮度，达成同样的情绪表达？

> “这场展览提醒我们，柔光之下同样需要克制与慈悲。” —— 策展人 Celeste

## 行动提示

- 预约夜场导览，感受灯光随时间推移的色温变化。
- 关注 #光影之间 标签，参与线上摄影征集。
- 展览结束后，可在艺术书店购买限量明信片套装。
`
  },
  {
    id: 'concrete-atelier-study',
    title: 'Concrete Atelier·建筑案例',
    summary: '清水混凝土主题，强调空间结构与材料逻辑解析。',
    themeId: 'ando-concrete',
    tags: ['建筑', '案例研究', '设计'],
    category: '建筑设计',
    useCase: '适用于空间复盘、建筑案例解读、材料研究。',
    version: '0.2.0',
    updatedAt: '2025-10-20',
    author: 'WeChat Markdown Studio',
    coverImage:
      'https://images.unsplash.com/photo-1529429617124-aeeeeeebc33d?auto=compress&fit=crop&w=1200&q=80',
    content: `# 案例研究｜「光之庭院」社区图书馆

## 项目摘要

- **地点**：大阪府丰中市
- **建筑面积**：2,300 ㎡
- **阅读席位**：120
- **藏书量**：35,000 册
- **主创团队**：Mori Atelier

## 设计策略

### 光的路径

| 节点 | 处理手法 | 目的 |
| --- | --- | --- |
| 中庭 | 倾斜天窗 + 竖向木格栅 | 引导自然光，形成动态阴影 |
| 阅读区 | 1.2 m 高窗带 | 控制眩光，保证视线舒适 |
| 走廊 | 间隔灯带 | 夜间提供导向，避免视觉干扰 |

### 材料语言

- **清水混凝土**：统一肌理，通过 1:1 模具反复打磨确保色差最小。
- **再生木材**：来自旧仓库的梁柱，与金属构件形成温差。
- **水景系统**：雨水回收后用于地面冷却，兼顾生态循环。

## 使用启示

> 图书馆不仅收藏书，也是城市温度的储存装置。

- 引入居民共建的植物志计划，建立在地生态档案。
- 通过预约制夜读活动延长空间使用时段。
- 设立「材料档案室」，展示构造样本与模型，建立可持续教育场景。
`
  }
];

export const builtinTemplates = templates;

export const listTemplates = (): TemplateDefinition[] => [...templates];

export const findTemplate = (id: string): TemplateDefinition | undefined => {
  return templates.find((item) => item.id === id);
};

export const listThemes = (): ThemeDefinition[] => builtinThemes;
