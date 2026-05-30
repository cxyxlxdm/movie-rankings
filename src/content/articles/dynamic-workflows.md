> 多 Agent 编排从"模型驱动"到"代码驱动"的范式升级

---

## 一、现有 Agent Workflow 的设计缺陷

### 1.1 传统架构回顾

大多数基于 LLM 的多 Agent 工作流采用以下模式：

```
主会话 (Orchestrator)
│
├── Agent Tool 调用 → subagent-1 (串行等待)
│   └── 结果回传主会话上下文
├── Agent Tool 调用 → subagent-2 (串行等待)
│   └── 结果回传主会话上下文
└── ... 逐个调度
```

Orchestrator（编排器）通过 Agent Tool 逐个派发 subagent，每个 subagent 的完整输出回传到主会话，由 LLM 判断下一步动作。

### 1.2 核心缺陷

#### 缺陷 1：上下文窗口饱和

每个 subagent 的返回结果（通常 10-50KB）累加到主会话上下文中。当工作流包含多个阶段（需求分析 → 代码实现 → 代码审查 → 测试 → 归档），上下文迅速膨胀：

```
[200K 上下文窗口]
├── 系统指令 + 项目配置       ~20KB (固定)
├── MCP 工具 Schema          ~50-100KB (固定)
├── Skill 描述摘要            ~15-25KB (固定)
├── subagent-1 返回结果       ~30KB
├── subagent-2 返回结果       ~40KB
├── subagent-3 返回结果       ~25KB
└── 剩余可用空间              < 30KB → Autocompact Thrashing
```

**Autocompact Thrashing**：Claude Code 检测到上下文压缩后仅 3 轮对话就再次溢出，连续 3 次，判定为 thrashing 并报错。这意味着工作流无法继续。

#### 缺陷 2：伪并行

Agent Tool 允许在单条消息中放置多个调用来"模拟并行"，但本质上：

- 主会话必须等待所有调用返回后才能继续
- 受限于 API 请求/响应循环的串行化
- N 个独立 agent 的总耗时 ≈ 最慢那个的耗时 × 串行系数
- 无法实现流水线（pipeline）模式：item A 在 stage 3 时 item B 还在 stage 1

实际观测：3 个 researcher agent 并行调研，总耗时约为单个的 2.5 倍（而非理想的 1 倍）。

#### 缺陷 3：调度逻辑不确定性

由 LLM 驱动的调度存在以下问题：

- **非确定性**：同样的输入，模型可能选择不同的执行路径
- **遗忘**：长上下文中模型可能忘记 DAG 依赖关系，错序执行
- **过度保守**：模型倾向于串行执行以"确保安全"，即使任务间无依赖
- **重试逻辑脆弱**：错误处理依赖模型判断，而非代码保证

#### 缺陷 4：模型降级不可控

使用 API 代理/网关时，代理层可能根据请求特征（如 subagent 调用的短上下文）将部分请求路由到低成本模型。Agent Tool 层面无法指定模型偏好，导致：

- 关键任务（代码审查、架构设计）被路由到弱模型
- 实现质量不稳定，需要额外的人工检查
- 用户在 Stats 中看到大量 token 流向非预期模型

#### 缺陷 5：可观测性差

subagent 的执行过程混杂在主对话流中：

- 无法区分哪些 token 属于哪个 subagent
- 无独立的进度视图
- 难以定位某个阶段的瓶颈
- 无法在不打断主会话的情况下监控后台工作

---

## 二、Dynamic Workflows 解决方案

### 2.1 核心思想

将多 Agent 编排从"LLM 决策调度"转变为"确定性代码控制"：

- **控制流由 JavaScript 脚本定义**：循环、条件、扇出/收集都是代码
- **执行在后台独立运行**：不占主会话上下文
- **并发度由运行时管理**：自动排队，真正并行
- **结果通过结构化 Schema 约束**：可编程消费，无需 parse 自然语言

### 2.2 架构对比

```
【原架构：模型驱动】                    【新架构：代码驱动】

主会话 200K 上下文                      主会话 200K 上下文
┌──────────────────┐                    ┌──────────────────┐
│ 系统指令          │                    │ 系统指令          │
│ subagent-1 结果   │ ← 占用上下文       │                  │ ← 大量空闲空间
│ subagent-2 结果   │                    │ workflow return   │ ← 仅最终结果 (~2KB)
│ subagent-3 结果   │                    │                  │
│ (空间告急...)     │                    │ (150KB+ 可用)    │
└──────────────────┘                    └──────────────────┘
                                                │
                                                │ Workflow Tool
                                                ▼
                                        ┌─ 后台 Runtime ──┐
                                        │ agent-1 ════╗   │
                                        │ agent-2 ════╬═══│══ 真并发
                                        │ agent-3 ════╝   │
                                        │ → return {}     │
                                        └─────────────────┘
```

---

## 三、实现原理

### 3.1 运行时机制

Dynamic Workflows 通过 Workflow Tool 调用，执行流程如下：

```
1. 主会话调用 Workflow({script: "...", args: {...}})
2. 运行时解析 JS 脚本，提取 meta 信息
3. 立即返回 task ID 给主会话（非阻塞）
4. 后台启动 JS 解释器执行脚本
5. 遇到 agent() 调用时：
   a. 检查并发池是否有空闲 slot（上限 min(16, cpu-2)）
   b. 有空闲 → 立即派发 subagent
   c. 无空闲 → 排队等待 slot 释放
6. agent() 返回结果（或 schema 校验后的结构化对象）
7. 脚本继续执行下一语句
8. return 语句执行后，通过 <task-notification> 回传主会话
```

### 3.2 核心 API 详解

#### agent(prompt, opts)

派发单个 subagent，异步等待完成。

```javascript
const result = await agent(
  '分析以下代码的安全漏洞...',
  {
    label: 'security-scan',     // 进度树中显示的标签
    phase: 'Review',            // 归属的进度阶段
    model: 'opus',              // 显式指定模型（防降级）
    schema: FINDING_SCHEMA,     // 强制结构化输出
    agentType: 'reviewer',      // 使用注册的 agent 角色定义
    isolation: 'worktree',      // 在独立 git worktree 中执行（互斥写入时）
  }
)
```

**关键行为：**
- 带 `schema` 时，agent 被要求调用 StructuredOutput 工具，运行时做 JSON Schema 校验，不合规则重试
- 返回 `null` 表示用户跳过了该 agent（`.filter(Boolean)` 过滤）
- `model` 参数覆盖继承的会话模型，请求中明确携带

#### parallel(thunks[])

并发执行多个任务，**全部完成后**返回结果数组。

```javascript
const results = await parallel([
  () => agent('审查安全性', {label: 'security', schema: S}),
  () => agent('审查性能', {label: 'perf', schema: S}),
  () => agent('审查可维护性', {label: 'maintain', schema: S}),
])
// results = [securityResult, perfResult, maintainResult]
```

**适用场景**：需要收集所有结果后才能做下一步决策（如去重、汇总、投票）。

**注意**：parallel 是屏障（barrier）— 最快的 agent 完成后必须等最慢的。如果不需要跨 item 聚合，用 pipeline 更高效。

#### pipeline(items, ...stages)

流水线模式：每个 item 独立流过所有 stage，**无跨 stage 屏障**。

```javascript
const results = await pipeline(
  items,
  // Stage 1: 分析
  (item) => agent(`分析 ${item.file}`, {schema: ANALYSIS_SCHEMA}),
  // Stage 2: 修复（基于分析结果）
  (analysisResult, originalItem) => agent(`修复 ${originalItem.file}: ${analysisResult.issue}`, {schema: FIX_SCHEMA}),
  // Stage 3: 验证
  (fixResult, originalItem) => agent(`验证 ${originalItem.file} 的修复`, {schema: VERIFY_SCHEMA}),
)
```

**关键优势**：Item A 可以在 Stage 3 时，Item B 还在 Stage 1。墙钟时间 = 最慢单个 item 链，而非最慢 stage × item 数。

#### phase(title) / log(message)

```javascript
phase('Review')           // 在 /workflows 进度树中创建分组
log('发现 3 个安全问题')   // 进度通知（200ms 内多行合并为一条）
```

#### workflow(ref, args)

嵌套调用子 workflow（一层限制，子 workflow 不能再嵌套）：

```javascript
const researchResult = await workflow(
  { scriptPath: './workflows/research.js' },
  { query: 'OAuth2 best practices', repos: [...] }
)
```

### 3.3 并发控制

```
并发上限 = min(16, cpu_cores - 2)

agent() 调用超过上限时自动排队：
  Slot 1: [agent-A] ████████░░ (运行中)
  Slot 2: [agent-B] ██████████ (完成，释放)
  Slot 3: [agent-C] ███░░░░░░░ (运行中)
  Queue:  [agent-D] [agent-E] (等待 slot)
         → agent-B 完成后，agent-D 自动启动
```

单个 workflow 生命周期内 agent 总调用上限 1000 次（防止失控循环）。

### 3.4 结构化输出（Schema）

```javascript
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['pass', 'issues_found', 'failure'] },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
          file: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['severity', 'description'],
      },
    },
  },
  required: ['status'],
}

const result = await agent('审查代码', { schema: REVIEW_SCHEMA })
// result 保证符合 schema，可直接 result.issues.filter(...)
```

Schema 的价值：
- **类型安全**：downstream 代码无需防御性 parse
- **自动重试**：输出不合规时，运行时自动要求 agent 重新生成
- **可组合**：多个 agent 的结果可以直接 `flatMap`、`filter`、`reduce`

### 3.5 错误处理与恢复

```javascript
// parallel 中单个 agent 失败不会导致整体失败
const results = await parallel(thunks)
const valid = results.filter(Boolean)  // 过滤 null（失败/跳过的）
const failures = results.filter(r => r === null || r.status === 'failure')

// 可恢复执行
// 1. 编辑脚本修复问题
// 2. 重新调用，携带 resumeFromRunId
Workflow({
  scriptPath: './my-workflow.js',
  resumeFromRunId: 'wf_abc123'  // 已完成的 agent 调用走缓存
})
```

### 3.6 脚本规范

```javascript
// 必须以纯字面量 meta 开头（不能有变量/模板/函数调用）
export const meta = {
  name: 'my-workflow',
  description: '一句话描述',
  phases: [
    { title: 'Analyze', detail: '分析阶段' },
    { title: 'Execute', detail: '执行阶段' },
  ],
}

// 脚本体在 async 上下文中执行，可直接 await
phase('Analyze')
const data = await agent('...', { schema: MY_SCHEMA })

// 标准 JS 内置可用（JSON, Math, Array, etc.）
// 不可用：Date.now(), Math.random(), new Date()（会破坏 resume 缓存）
// 不可用：Node.js API, 文件系统操作（通过 agent 完成）
```

---

## 四、现有项目改造方法

### 4.1 评估哪些阶段适合 Workflow 化

| 特征 | 适合 Workflow | 保留主会话 |
|------|-------------|-----------|
| 多个独立 agent 可并行 | ✅ | |
| 需要用户实时交互/确认 | | ✅ |
| 计算密集、输出大量文本 | ✅ | |
| 依赖前一步用户决策 | | ✅ |
| DAG 依赖图可静态分析 | ✅ | |
| 需要动态调整策略 | | ✅ |

**典型适合 Workflow 化的场景：**
- 多仓库并行代码调研
- 多任务并行实现（尊重依赖图）
- 多维度并行审查（安全/性能/规范/正确性）
- 多 bug 并行修复
- 多文件并行测试生成

**必须保留在主会话的场景：**
- 交互式需求讨论/方案决策
- 需要用户确认的破坏性操作（如 force push、删除分支）
- 依赖实时用户反馈的迭代式优化

### 4.2 改造步骤

#### Step 1：创建 workflows 目录

```
.claude/workflows/
├── my-research.js        # 调研阶段
├── my-implement.js       # 实现阶段
├── my-review.js          # 审查阶段
└── README.md             # 使用文档
```

#### Step 2：定义 Schema

为每个 subagent 的返回值定义 JSON Schema：

```javascript
// 先想清楚 downstream 需要什么字段
const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['success', 'failure'] },
    // ... 业务字段
  },
  required: ['status'],
}
```

#### Step 3：编写 Workflow 脚本

遵循模式：

```javascript
export const meta = {
  name: 'xxx',
  description: 'xxx',
  phases: [...]
}

// Phase 1: 准备
phase('Prepare')
// 验证前置条件...

// Phase 2: 并行执行
phase('Execute')
const results = await parallel(
  items.map(item => () => agent(buildPrompt(item), {
    label: `task:${item.id}`,
    model: 'opus',
    schema: RESULT_SCHEMA,
  }))
)

// Phase 3: 汇总
phase('Synthesize')
const valid = results.filter(Boolean)
return { status: 'success', results: valid }
```

#### Step 4：从主会话调用

```javascript
// 在 orchestrator 逻辑中，将原来的多次 Agent 调用替换为：
Workflow({name: "my-research", args: { /* 传入必要参数 */ }})

// 主会话继续处理其他交互，workflow 完成后通过 notification 回传结果
```

#### Step 5：处理交互式衔接

```javascript
// 在 workflow 中检测是否有足够输入继续
if (!args.tasks || args.tasks.length === 0) {
  return {
    status: 'paused',
    message: '需要用户完成方案决策后再继续',
    nextStep: '在主会话完成交互式阶段，然后以 tasks 参数重新调用',
  }
}
```

### 4.3 DAG 并行实现模式

对于有依赖关系的任务（如 task-B 依赖 task-A），使用拓扑排序分层：

```javascript
function resolveDAGLayers(tasks) {
  const completed = new Set()
  const layers = []
  let remaining = [...tasks]

  while (remaining.length > 0) {
    // 找出所有依赖已满足的任务
    const ready = remaining.filter(t =>
      (t.dependencies || []).every(d => completed.has(d))
    )

    if (ready.length === 0) break  // 循环依赖

    layers.push(ready)
    ready.forEach(t => completed.add(t.id))
    remaining = remaining.filter(t => !completed.has(t.id))
  }

  return layers  // [[layer0-tasks], [layer1-tasks], ...]
}

// 层间串行，层内并行
for (const layer of resolveDAGLayers(tasks)) {
  await parallel(layer.map(task => () => agent(...)))
}
```

### 4.4 审查 + 对抗验证模式

```javascript
// Phase 1: 并行多维度审查
const findings = await parallel(
  DIMENSIONS.map(dim => () =>
    agent(dim.prompt, { schema: FINDING_SCHEMA })
  )
)

// Phase 2: 对每个发现做对抗验证（防止误报）
const verified = await pipeline(
  findings.filter(Boolean).flatMap(r => r.issues),
  // Stage 1: 独立验证者尝试反驳
  (issue) => agent(
    `尝试反驳以下发现。如果你能证明它不是真正的问题，返回 refuted=true：\n${issue.description}`,
    { schema: VERDICT_SCHEMA }
  ),
  // Stage 2: 仅保留未被反驳的
  (verdict, originalIssue) => verdict.refuted ? null : originalIssue,
)

const confirmedIssues = verified.filter(Boolean)
```

### 4.5 循环模式（Loop-until-dry）

```javascript
const allFindings = []
let dryRounds = 0

while (dryRounds < 2) {
  const round = await agent('查找代码中的问题...', { schema: FINDINGS_SCHEMA })
  const newFindings = round.issues.filter(i => !allFindings.some(f => f.id === i.id))

  if (newFindings.length === 0) {
    dryRounds++
    continue
  }

  dryRounds = 0
  allFindings.push(...newFindings)
  log(`已发现 ${allFindings.length} 个问题，继续搜索...`)
}

return { issues: allFindings }
```

---

## 五、改造收益与机制对应

### 5.1 收益 → 机制映射

| 收益 | 实现机制 | 技术细节 |
|------|---------|---------|
| **主会话不再溢出** | 后台执行 + 仅回传 return 值 | Workflow Tool 立即返回 task ID，脚本在独立进程执行，所有 agent 的完整输出留在后台，主会话仅收到 `<task-notification>` 中的 return 对象（通常 1-3KB） |
| **真正并行加速** | parallel() / pipeline() + 并发池 | 运行时维护 min(16, cpu-2) 个 slot 的并发池，parallel 中的 thunk 按 slot 可用性立即启动，无需等待主会话轮次 |
| **模型质量可控** | agent() 的 model 参数 | 每个 agent 调用的 HTTP 请求中携带显式 model 字段，API 代理层可据此路由到正确模型，不受代理层默认策略影响 |
| **确定性执行** | JS 脚本控制流 | for/while/if 是代码而非 LLM 判断，DAG 层级严格按拓扑序执行，不会遗忘依赖或乱序 |
| **结果可编程** | schema 参数 + JSON 校验 | 运行时在 tool-call 层做 JSON Schema 验证，不合规自动重试，downstream 代码可直接 `.filter().map()` |
| **失败隔离** | parallel 中 null 处理 | 单个 agent 失败返回 null（不是 reject），其他 agent 不受影响，workflow 代码通过 `.filter(Boolean)` 过滤后继续 |
| **可恢复** | resumeFromRunId + 缓存 | 已完成的 agent 调用（prompt + opts 未变）返回缓存结果，仅新增/修改的调用重新执行 |
| **可观测** | /workflows 命令 + phase()/log() | 独立进度树视图，按 phase 分组显示每个 agent 的状态（pending/running/done/failed） |
| **Skill 不必裁剪** | 上下文压力消解 | 由于主会话不再累积 subagent 输出，skill 描述占用的 ~20KB 固定开销变得可以承受，无需为节省空间而归档功能性 skill |

### 5.2 耗时对比模型

假设工作流包含 Phase A（3 个独立 agent）和 Phase B（5 个 DAG 两层任务）：

**原方案（Agent Tool 串行调度）：**

```
Phase A: agent1(2min) + agent2(3min) + agent3(2min) = 7 min
Phase B: layer1[task1(4min), task2(3min)] 串行 + layer2[task3-5] 串行
       = max(4,3) + ... ≈ 12 min（实际因伪并行损失更多）
总计: ~19 min + 模型调度开销
```

**Dynamic Workflows（真并行）：**

```
Phase A: parallel([agent1, agent2, agent3]) = max(2,3,2) = 3 min
Phase B: parallel(layer1) + parallel(layer2) = max(4,3) + max(3,2,3) = 7 min
总计: ~10 min
加速比: 1.9x
```

### 5.3 上下文占用对比

| 场景 | 原方案主会话消耗 | Workflow 方案主会话消耗 |
|------|-----------------|---------------------|
| 3 个 researcher 调研 | ~90KB (30KB × 3) | ~2KB (return summary) |
| 8 个 task 实现 | ~160KB (20KB × 8) | ~3KB (return results array) |
| 多维度审查 | ~75KB (25KB × 3) | ~2KB (return issues list) |
| **累计** | **~325KB (远超 200K 限制)** | **~7KB** |

---

## 六、最佳实践

### 6.1 选择 parallel vs pipeline

```
需要跨 item 聚合再进下一步？
  ├── 是 → parallel (barrier)
  │         例：收集所有审查结果后去重再验证
  └── 否 → pipeline (no barrier)
            例：每个文件独立 分析→修复→验证
```

**判断标准**：如果 Stage N 的 prompt 中需要引用"所有 Stage N-1 的结果"，那需要 barrier（parallel）。如果每个 item 可以独立走完所有 stage，用 pipeline。

### 6.2 Schema 设计原则

1. **始终包含 status 字段**：`enum: ['success', 'failure', 'blocked']`
2. **错误信息独立字段**：`error: { type: 'string' }` 便于聚合错误
3. **标识字段传回**：让 agent 把输入的 ID 原样返回，便于结果关联
4. **数组用于可聚合数据**：findings、issues、files 等用 array

### 6.3 提示词写法

Workflow 中的 agent prompt 与普通对话 prompt 不同：

- **明确角色**：开头声明"你是 XXX 角色"
- **明确输入**：将所有必要上下文直接嵌入 prompt（agent 无法看到 workflow 变量）
- **明确输出**：说明需要返回什么（配合 schema 使用）
- **明确约束**：列出禁止做的事（如"不要修改其他文件"）

### 6.4 防止模型降级

```javascript
// 所有关键 agent 调用显式指定模型
await agent('...', { model: 'opus' })  // 最强模型，用于实现/审查
await agent('...', { model: 'sonnet' }) // 用于辅助性工作（格式转换等）
// 不指定 model → 继承会话模型 → 可能被代理层降级
```

### 6.5 Token 预算控制

```javascript
// 用户设置了 "+500k" token 目标时，动态调整规模
if (budget.total) {
  const maxAgents = Math.floor(budget.remaining() / 100_000)
  log(`预算允许再派发 ${maxAgents} 个 agent`)
}

// 无预算限制时用固定上限
const MAX_ROUNDS = budget.total ? Math.ceil(budget.total / 200_000) : 3
```

---

## 七、常见模式速查

### 判断面板（独立评估 → 投票）

```javascript
const votes = await parallel(
  Array.from({length: 3}, (_, i) => () =>
    agent(`独立评估方案可行性（评估者 ${i+1}）`, {schema: VOTE_SCHEMA})
  )
)
const approved = votes.filter(Boolean).filter(v => v.approve).length >= 2
```

### 对抗验证（发现 → 反驳）

```javascript
const verified = await pipeline(
  findings,
  (finding) => agent(`尝试反驳: ${finding.desc}`, {schema: VERDICT_SCHEMA}),
  (verdict, finding) => verdict.refuted ? null : finding,
)
```

### 循环至收敛

```javascript
let seen = new Set(), dry = 0
while (dry < 2) {
  const found = await agent('继续搜索问题...', {schema: ISSUES_SCHEMA})
  const fresh = found.issues.filter(i => !seen.has(i.key))
  if (!fresh.length) { dry++; continue }
  dry = 0
  fresh.forEach(i => seen.add(i.key))
}
```

### DAG 分层执行

```javascript
for (const layer of topoSort(tasks)) {
  const results = await parallel(
    layer.map(t => () => agent(t.prompt, {schema: RESULT_SCHEMA}))
  )
  // 下一层可以引用本层结果
}
```

### 预算感知扩展

```javascript
while (budget.total && budget.remaining() > 80_000) {
  await agent('深入分析...', {schema: DEEP_SCHEMA})
  log(`剩余预算: ${Math.round(budget.remaining()/1000)}k`)
}
```

---

## 八、限制与注意事项

| 限制 | 说明 | 应对方式 |
|------|------|---------|
| 不支持用户交互 | workflow 中无法 AskUserQuestion | 交互式阶段保留在主会话 |
| 无文件系统 API | 脚本内无法直接读写文件 | 通过 agent 完成文件操作 |
| 无 Date/Random | 会破坏 resume 缓存机制 | 通过 args 传入时间戳 |
| 嵌套仅一层 | workflow() 内不能再 workflow() | 扁平化设计 |
| Agent 上限 1000 | 单次 workflow 最多 1000 个 agent 调用 | 合理设计循环终止条件 |
| 无 TypeScript | 脚本是纯 JS，不支持类型注解 | 用 JSDoc 或 Schema 代替类型检查 |
| 并发上限 | min(16, cpu-2) | 超出自动排队，设计时考虑 slot 复用 |
