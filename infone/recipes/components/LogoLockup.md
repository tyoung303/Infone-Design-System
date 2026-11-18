# LogoLockup 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## LogoLockup.d.ts

```typescript
export interface LogoLockupTag { label: string; tone?: "neutral" | "teal" | "pink" | "cat1" | "cat2" | "cat3" | "cat4" | "cat5" | "cat6" | "blue"; bg?: string; fg?: string }
export interface LogoLockupProps {
  /** Real logo image URL. Omit to fall back to the icon tile. */
  src?: string;
  /** Remix Icon class used when `src` is not given. @default "ri-cpu-line" */
  icon?: string;
  /** Icon color when falling back to the icon tile. @default "var(--color-fg)" */
  color?: string;
  name: string;
  /** Secondary line under the name (context window, vendor, region…). */
  meta?: string;
  /** Small Tag-aligned labels after the name. Strings use neutral;
   *  pass {label,tone} for category tones. bg/fg are escape hatches. */
  tags?: (string | LogoLockupTag)[];
  /** Mark tile edge in px. @default 40 */
  size?: number;
}
export function LogoLockup(props: LogoLockupProps): JSX.Element;
```

## LogoLockup.jsx

```jsx
/* LogoLockup.jsx — vendor/model mark + name + capability chips, one
   standard combo for model marketplace cards, compare tables, provider
   pickers. Pass `src` for a real logo image; without one it falls back to
   a Remix Icon tile (`icon`+`color`) — never a drawn illustration. */
export function LogoLockup({ src, icon = "ri-cpu-line", color = "var(--color-fg)", name, meta, tags = [], size = 40 }) {
  const tagTones = {
    neutral: { bg: "var(--th-gray-50)", fg: "var(--th-gray-600)" },
    cat1: { bg: "var(--th-cat-1-bg)", fg: "var(--th-cat-1-fg)" },
    cat2: { bg: "var(--th-cat-2-bg)", fg: "var(--th-cat-2-fg)" },
    cat3: { bg: "var(--th-cat-3-bg)", fg: "var(--th-cat-3-fg)" },
    cat4: { bg: "var(--th-cat-4-bg)", fg: "var(--th-cat-4-fg)" },
    cat5: { bg: "var(--th-cat-5-bg)", fg: "var(--th-cat-5-fg)" },
    cat6: { bg: "var(--th-cat-6-bg)", fg: "var(--th-cat-6-fg)" }
  };
  tagTones.teal = tagTones.cat2;
  tagTones.pink = tagTones.cat3;
  tagTones.blue = tagTones.cat1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, fontFamily: "var(--th-font-cn)" }}>
      <span style={{ flexShrink: 0, width: size, height: size, borderRadius: "var(--th-radius-md)", background: "var(--color-surface-raised)", border: "1px solid var(--th-gray-50)", boxShadow: "var(--th-shadow-card)", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {src ? <img src={src} alt="" style={{ width: "70%", height: "70%", objectFit: "contain" }} /> : <i className={icon} style={{ fontSize: size >= 48 ? 20 : size >= 32 ? 16 : 14, color }} />}
      </span>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--th-font-mono)", fontSize: "var(--th-text-base)", fontWeight: 600, color: "var(--color-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          {tags.map((t) => {
            const label = t.label || t;
            const tone = tagTones[t.tone] || tagTones.neutral;
            return <span key={label} style={{ flexShrink: 0, height: 24, padding: "0 8px", borderRadius: "var(--th-radius-xs)", fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-xs)", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: t.bg || tone.bg, color: t.fg || tone.fg }}>{label}</span>;
          })}
        </div>
        {meta && <div style={{ fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</div>}
      </div>
    </div>
  );
}
```

## logo-lockup.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Logo lockup" subtitle="供应商/模型标识组合 — 图标或真实 logo + 名称 + 规范 Tag，模型广场/对比表通用" viewport="440x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:20px;width:400px;display:flex;flex-direction:column;gap:16px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { LogoLockup } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <LogoLockup icon="ri-anthropic-fill" color="var(--color-fg)" name="claude-opus-4-7" meta="200K context · Anthropic" tags={[{ label: "视觉", tone: "cat1" }, { label: "工具调用", tone: "cat3" }]} />
      <LogoLockup icon="ri-openai-fill" color="var(--color-fg)" name="gpt-4o-mini" meta="128K context · OpenAI" tags={["快速"]} />
      <LogoLockup icon="ri-cpu-line" color="var(--th-cat-5-fg)" name="deepseek-v3" meta="64K context · DeepSeek" />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
