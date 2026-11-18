# Markdown 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Markdown.d.ts

```typescript
export interface MarkdownProps {
  /** Pre-rendered markdown HTML string (from your markdown parser). Fenced code blocks with `language-mermaid` class render as Mermaid diagrams. */
  html?: string;
  /** Alternative to `html`: raw HTML string passed as children. */
  children?: string;
  style?: React.CSSProperties;
}
export declare function Markdown(props: MarkdownProps): JSX.Element;
```

## Markdown.jsx

```jsx
/* Markdown.jsx — renders parsed markdown HTML with full-element styling (headings, lists, quote, code, table, links, hr, task list). Pass pre-rendered `html`; falls back to `children` as raw HTML string. */
let mdStyleInjected = false;
function ensureMdStyle() {
  if (mdStyleInjected || typeof document === "undefined") return;
  mdStyleInjected = true;
  const el = document.createElement("style");
  el.textContent = `
.th-md{font-family:var(--th-font-cn);font-size:var(--th-text-base);line-height:1.7;color:var(--color-fg)}
.th-md>*:first-child{margin-top:0}
.th-md h1,.th-md h2,.th-md h3,.th-md h4{font-family:var(--th-font-cn);color:var(--color-fg);margin:1.4em 0 .5em}
.th-md h1{font-size:var(--th-text-2xl);font-weight:700;line-height:1.25;border-bottom:1px solid var(--color-divider);padding-bottom:.35em}
.th-md h2{font-size:var(--th-text-xl);font-weight:700;line-height:1.3}
.th-md h3{font-size:var(--th-text-md);font-weight:600;line-height:1.35}
.th-md h4{font-size:var(--th-text-base);font-weight:600}
.th-md p{margin:.75em 0}
.th-md a{color:var(--color-link);text-decoration:none;border-bottom:1px solid color-mix(in srgb, var(--color-link) 40%, transparent)}
.th-md a:hover{opacity:.85}
.th-md strong{font-weight:700}
.th-md em{font-style:italic}
.th-md del{color:var(--color-fg-muted)}
.th-md ul,.th-md ol{margin:.75em 0;padding-left:1.5em}
.th-md li{margin:.3em 0}
.th-md li::marker{color:var(--color-fg-subtle)}
.th-md li.th-md-task{list-style:none;margin-left:-1.5em;display:flex;align-items:flex-start;gap:8px}
.th-md li.th-md-task input{margin-top:.3em;accent-color:var(--th-teal-500)}
.th-md blockquote{margin:1em 0;padding:.2em 1em;border-left:3px solid var(--th-teal-300);background:var(--th-teal-50);color:var(--color-fg-muted);border-radius:0 var(--th-radius-xs) var(--th-radius-xs) 0}
.th-md blockquote p{margin:.5em 0}
.th-md code{font-family:var(--th-font-mono);font-size:.9em;background:var(--th-gray-50);border:0.5px solid var(--color-border);border-radius:4px;padding:.1em .4em}
.th-md pre{margin:1em 0;padding:14px 16px;background:var(--th-bg);border:var(--th-border-card);border-radius:var(--th-radius-sm);overflow:auto}
.th-md pre code{background:none;border:none;padding:0;font-size:13px;line-height:1.7}
.th-md hr{border:none;border-top:1px solid var(--color-divider);margin:1.5em 0}
.th-md table{border-collapse:collapse;margin:1em 0;width:100%;font-size:var(--th-text-sm)}
.th-md th,.th-md td{border:0.5px solid var(--color-border);padding:8px 12px;text-align:left}
.th-md th{background:var(--th-gray-50);font-weight:600}
.th-md img{max-width:100%;border-radius:var(--th-radius-xs)}
.th-md .th-md-mermaid{margin:1em 0;padding:16px;background:var(--th-bg);border:var(--th-border-card);border-radius:var(--th-radius-sm);overflow:auto;display:flex;justify-content:center}
`;
  document.head.appendChild(el);
}
let mermaidLoading = null;
function ensureMermaid() {
  if (typeof document === "undefined") return Promise.resolve(null);
  if (window.mermaid) return Promise.resolve(window.mermaid);
  if (mermaidLoading) return mermaidLoading;
  mermaidLoading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    s.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "var(--th-teal-50)",
          primaryBorderColor: "var(--th-teal-500)",
          primaryTextColor: "var(--color-fg)",
          lineColor: "var(--color-fg-subtle)",
          fontFamily: "var(--th-font-ui)",
          fontSize: "13px",
        },
      });
      resolve(window.mermaid);
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return mermaidLoading;
}
let mermaidRenderQueue = Promise.resolve();
let mermaidSeq = 0;
function queueMermaidRender(source) {
  const id = "th-md-mermaid-" + (mermaidSeq++) + "-" + Date.now();
  mermaidRenderQueue = mermaidRenderQueue.then(() => ensureMermaid()).then((mermaid) => {
    if (!mermaid) return { error: true, source };
    return mermaid.render(id, source).then((res) => ({ svg: res.svg })).catch(() => ({ error: true, source }));
  }, () => ({ error: true, source }));
  return mermaidRenderQueue;
}
export function Markdown({ html, children, style }) {
  const ref = React.useRef(null);
  const content = html ?? children ?? "";
  React.useEffect(ensureMdStyle, []);
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blocks = root.querySelectorAll("code.language-mermaid, code.mermaid, pre.mermaid");
    blocks.forEach((code) => {
      const source = code.textContent;
      const host = document.createElement("div");
      host.className = "th-md-mermaid";
      const pre = code.closest("pre") || code;
      pre.replaceWith(host);
      queueMermaidRender(source).then((res) => {
        if (res.error) host.textContent = res.source;
        else host.innerHTML = res.svg;
      });
    });
  }, [content]);
  return <div ref={ref} className="th-md" style={style} dangerouslySetInnerHTML={{ __html: content }} />;
}
```

## markdown.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Markdown" subtitle="Full markdown element styling + all Mermaid diagram types" viewport="640x2200" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Markdown } = window.TokenHubDesignSystem_019e20;
const sample = `
<h1>一级标题 Heading 1</h1>
<p>这是正文段落，包含 <strong>加粗文本</strong>、<em>斜体文本</em> 和 <del>删除线文本</del>，以及一个 <a href="#">超链接示例</a>。</p>
<h2>二级标题 Heading 2</h2>
<p>行内代码示例：<code>const x = 1;</code></p>
<h3>三级标题 Heading 3</h3>
<ul>
  <li>无序列表项一</li>
  <li>无序列表项二
    <ul><li>嵌套子项</li></ul>
  </li>
</ul>
<ol>
  <li>有序列表项一</li>
  <li>有序列表项二</li>
</ol>
<ul>
  <li class="th-md-task"><input type="checkbox" checked disabled />已完成任务</li>
  <li class="th-md-task"><input type="checkbox" disabled />待办任务</li>
</ul>
<blockquote><p>这是一段引用文本，用于强调说明或提示信息。</p></blockquote>
<pre><code>function hello() {
  console.log("Hello, InfOne");
}</code></pre>
<h4>四级标题 Heading 4</h4>
<table>
  <thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>name</td><td>string</td><td>名称</td></tr>
    <tr><td>value</td><td>number</td><td>数值</td></tr>
  </tbody>
</table>
<hr/>
<p>分隔线上方与下方的段落文本示例。</p>
<h4>Mermaid — 流程图 Flowchart</h4>
<pre><code class="language-mermaid">graph TD
  A[请求发起] --> B{校验 Token}
  B -- 通过 --> C[调用模型]
  B -- 失败 --> D[返回 401]
  C --> E[返回结果]</code></pre>
<h4>Mermaid — 时序图 Sequence</h4>
<pre><code class="language-mermaid">sequenceDiagram
  participant U as 用户
  participant S as 网关
  participant M as 模型服务
  U->>S: 发起请求 (Token)
  S->>S: 校验 Token
  S->>M: 转发请求
  M-->>S: 返回结果
  S-->>U: 响应</code></pre>
<h4>Mermaid — 状态图 State</h4>
<pre><code class="language-mermaid">stateDiagram-v2
  [*] --> 待处理
  待处理 --> 处理中: 开始调用
  处理中 --> 成功: 返回 200
  处理中 --> 失败: 返回 4xx/5xx
  成功 --> [*]
  失败 --> [*]</code></pre>
<h4>Mermaid — 类图 Class</h4>
<pre><code class="language-mermaid">classDiagram
  class Token {
    +string key
    +string status
    +int quota
    +revoke()
  }
  class Account {
    +string name
    +Token[] tokens
  }
  Account "1" --> "*" Token</code></pre>
<h4>Mermaid — 甘特图 Gantt</h4>
<pre><code class="language-mermaid">gantt
  title 上线计划
  dateFormat  YYYY-MM-DD
  section 设计
  组件梳理        :done, d1, 2026-07-01, 5d
  视觉走查        :active, d2, after d1, 3d
  section 开发
  接口联调        : d3, after d2, 4d
  灰度发布        : d4, after d3, 2d</code></pre>
<h4>Mermaid — 饼图 Pie</h4>
<pre><code class="language-mermaid">pie title 模型调用占比
  "GPT 系列" : 42
  "Claude 系列" : 33
  "开源模型" : 25</code></pre>
<h4>Mermaid — 实体关系 ER</h4>
<pre><code class="language-mermaid">erDiagram
  ACCOUNT ||--o{ TOKEN : owns
  TOKEN ||--o{ REQUEST_LOG : generates
  ACCOUNT {
    string id
    string name
  }
  TOKEN {
    string key
    string status
  }</code></pre>
`;
function Demo() {
  return (
    <div className="panel">
      <Markdown html={sample} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
