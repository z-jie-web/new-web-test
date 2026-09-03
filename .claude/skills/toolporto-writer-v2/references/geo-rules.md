# GEO Rules (Generative Engine Optimization)

内容不仅被 Google 收录,还会被 Claude / ChatGPT / Perplexity / Gemini 等
AI 引擎检索并**直接引用**。GEO 的目标:当 AI 引擎回答"best coding model 2026"
类问题时,你的页面成为它摘引的答案来源。

与 SEO 的区别:SEO 优化排名信号,GEO 优化**可提取性**——AI 引擎不读全文,
它抽取立场、数字、Winner 判定和结论句。

---

## 1. Answer-First(开篇即答)

AI 引擎引用对比/测评页时,优先摘引言部立场句。

- 第一段直接回答标题问题("Is X good for coding agents?")并给出判定
- 判定句独立成段,包含:工具名 + 场景 + 结论(不用"it depends"开头,除非后接明确条件)

好: `Claude Fable 5.1 is the strongest model for long-running coding agents, but only pays off at scale.`
坏: `Whether Fable 5.1 is good depends on your needs.`(无信息)

## 2. 可引用结论句(Citable Claims)

AI 引擎倾向摘引**独立、完整、含数字与实体名**的句子。

- 关键结论写成 ≤40 词的独立句,含:实体全名 + 数字/价格 + 判定词
- 不要只把结论埋在长段落中间
- review 的 verdict 与 compare 的 winner/verdict 字段是最高价值可引用句,写好它们

## 3. 数据锚定(数字必须带实体与来源)

AI 引擎会交叉验证数字;无来源的数字会被跳过或导致整页不被信任。

- 每个 benchmark / 价格数字就近标注:厂商名 + 报告口径(如 "Meta-reported")
- 同一数字全站口径一致(版本、effort 设置标注清楚)
- 跨厂商比较注明 "vendor-reported on different suites", 不制造虚假同口径
- 关键第三方数字加外链(Artificial Analysis / Datacurve / 厂商系统卡)

## 4. 结构化对比(表与清单可提取性)

- compare 页的 quick table(auto-rendered)是 AI 引擎的主要抓取对象,
  review frontmatter(pros/cons/bestFor/pricing)质量直接决定引用质量
- 编辑性表格用于 quick table 之外的维度,表头含完整实体名
- Winner 判定用粗体显式写出: `**Winner: X** for ...`

## 5. FAQ 即答案库

AI 引擎把 FAQ 当直接答案源:

- 每个 FAQ 答案**首句**就是答案本身(可直接摘引),补充放后
- 好: `Yes; Fable 5.1 is ...` / `No. The model is ...`
- 坏: 首句是 "That depends on several factors, including ..."
- FAQ 覆盖 long-tail 问法(带工具名+场景),与 discover 的 primary_keyword 对齐

## 6. 实体与时间明确

- 首次出现用全称,后文可缩写
- 时间锚点用发布/更新日期("released September 1, 2026"),不用相对时间
- 明确模型版本号(3.8 Flash ≠ 3.7 Flash),避免 AI 引擎混淆版本

## 7. 立场清晰(为 AI 提取留明确断言)

- 模糊话术("both are good")降低被引用概率
- 每个对比/测评给出明确 winner/verdict,附适用条件
- 诚实披露不确定性(自报数字未验证)不削弱立场,反而提升可信度

---

## Enhance 中的 GEO 自检清单

enhance 阶段对每篇执行(逐项确认后在 brief 记录):

1. 开篇是否直接回答了标题问题?(answer-first)
2. 是否至少 3 个可独立摘引的结论句(实体+数字+判定)?
3. 每个关键数字是否带来源与口径?
4. FAQ 每个答案首句是否即答案?
5. verdict/winner 是否明确且诚实?
