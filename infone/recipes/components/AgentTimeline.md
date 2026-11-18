# AgentTimeline 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## AgentTimeline.d.ts

```typescript
export interface AgentTimelineStep {
  /** Step type — sets the rail icon and the small kind label. @default "tool" */
  kind?: "thinking" | "tool" | "retrieval" | "output" | "error";
  title: string;
  description?: string;
  /** Pre-formatted duration, e.g. "1.2s" or "340ms". */
  duration?: string;
  /** "done" (default), "running" (spinner + brand tint), "failed" (danger). */
  status?: "done" | "running" | "failed";
  /** Raw request/response body — expands inline in a sunken panel. */
  payload?: string;
}
export interface AgentTimelineProps {
  steps: AgentTimelineStep[];
  /** @default "comfortable" */
  density?: "comfortable" | "compact";
}
export function AgentTimeline(props: AgentTimelineProps): JSX.Element;
```

## AgentTimeline.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

if (typeof document !== "undefined" && !document.getElementById("th-agent-timeline-css")) {
  const s = document.createElement("style");
  s.id = "th-agent-timeline-css";
  s.textContent = `.th-agent-payload{scrollbar-width:none;-ms-overflow-style:none}.th-agent-payload::-webkit-scrollbar{width:0;height:0;display:none}`;
  document.head.appendChild(s);
}
/* AgentTimeline.jsx — the trace of one agent run: thinking, tool calls,
   output, errors, in order, with per-step duration. Distinct from Timeline
   (a plain audit feed): steps carry a kind, a run status, and an optional
   payload that expands inline. The running step shimmers; everything else
   is still. */
const AT_KIND = {
  thinking: { icon: "ri-sparkling-2-line", label: "思考" },
  tool: { icon: "ri-tools-line", label: "工具调用" },
  retrieval: { icon: "ri-search-line", label: "检索" },
  output: { icon: "ri-chat-1-line", label: "输出" },
  error: { icon: "ri-error-warning-line", label: "错误" },
};
export function AgentTimeline({ steps = [], density = "comfortable" }) {
  const compact = density === "compact";
  const [open, setOpen] = React.useState({});
  const payloadRefs = React.useRef({});
  return (
    <div className="th-stagger" style={{ fontFamily: "var(--th-font-cn)" }}>
      {steps.map((s, i) => {
        const kind = AT_KIND[s.kind] || AT_KIND.tool;
        const failed = s.status === "failed";
        const running = s.status === "running";
        const dot = failed ? "var(--color-danger-solid)" : running ? "var(--color-accent)" : "var(--th-gray-250)";
        const isOpen = !!open[i];
        const payloadRef = payloadRefs.current[i] || (payloadRefs.current[i] = { current: null });
        return (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22, flex: "none" }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: running ? "var(--color-surface-quiet)" : "var(--color-surface-inset)", color: failed ? "var(--color-danger-fg)" : running ? "var(--th-teal-600)" : "var(--color-fg-muted)", border: `1px solid ${running ? "var(--color-surface-quiet-border)" : "transparent"}` }}>
                <i className={running ? "ri-loader-4-line th-spin" : kind.icon} />
              </span>
              {i < steps.length - 1 && <span style={{ width: 0, flex: 1, borderLeft: `1px solid ${dot === "var(--th-gray-250)" ? "var(--color-border)" : dot}`, margin: "4px 0", opacity: 0.6 }} />}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? (compact ? 12 : 16) : 0, minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: "var(--th-text-2xs)", color: "var(--color-fg-subtle)", flex: "none" }}>{kind.label}</span>
                <span style={{ fontSize: compact ? "var(--th-text-xs)" : "var(--th-text-base)", fontWeight: 500, color: failed ? "var(--color-danger-fg)" : "var(--color-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{s.title}</span>
                {s.duration != null && <span className="th-nums" style={{ marginLeft: "auto", flex: "none", fontSize: "var(--th-text-2xs)", color: "var(--color-fg-subtle)" }}>{s.duration}</span>}
              </div>
              {s.description && <div style={{ fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", lineHeight: 1.5, marginTop: 2 }}>{s.description}</div>}
              {s.payload && (
                <>
                  <button type="button" onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} style={{ appearance: "none", border: "none", background: "transparent", padding: 0, marginTop: 4, cursor: "pointer", fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-2xs)", color: "var(--color-link)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <i className="ri-arrow-down-s-line" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform var(--th-dur-1) var(--th-ease)" }} />{isOpen ? "收起" : "查看详情"}
                  </button>
                  {isOpen && (
                    <div style={{ position: "relative", minWidth: 0, marginTop: 6 }}>
                      <pre ref={payloadRef} className="th-in-fade th-agent-payload" style={{ margin: 0, padding: "8px 10px", background: "var(--color-surface-inset)", borderRadius: "var(--th-radius-sm)", fontFamily: "var(--th-font-mono)", fontSize: "var(--th-text-2xs)", lineHeight: 1.6, color: "var(--color-fg-muted)", overflowX: "auto" }}>{s.payload}</pre>
                      <Scrollbar targetRef={payloadRef} axis="x" reveal="hover" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## agent-timeline.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Agent timeline" subtitle="一次 agent 运行的轨迹：思考/工具调用/输出/错误 + 耗时 + 可展开原始报文" viewport="560x460" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:20px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.panel{width:512px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { AgentTimeline } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <AgentTimeline steps={[
        { kind: "thinking", title: "解析用户意图", duration: "0.8s", description: "识别为「按成本重排路由」任务" },
        { kind: "retrieval", title: "读取近 7 天用量", duration: "340ms", payload: '{"range":"7d","group_by":"model","rows":128}' },
        { kind: "tool", title: "调用 pricing.compare", duration: "1.2s", payload: '{"models":["claude-sonnet-4","gpt-4o-mini"],"metric":"cost_per_1m"}' },
        { kind: "tool", title: "写入路由规则", status: "running" },
        { kind: "output", title: "生成变更摘要", status: "done", duration: "0.4s" },
      ]} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
