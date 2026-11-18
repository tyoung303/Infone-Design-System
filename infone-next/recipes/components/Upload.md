# Upload 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Upload.d.ts

```typescript
import * as React from "react";
export interface UploadProps {
  /** Native accept string, e.g. ".jsonl,.csv". */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  /** Secondary hint line under the main label. */
  hint?: React.ReactNode;
  /** Called with the current File list on add/remove. */
  onChange?: (files: File[]) => void;
  /** @default 10 */
  maxCount?: number;
  style?: React.CSSProperties;
}
export function Upload(props: UploadProps): JSX.Element;
```

## Upload.jsx

```jsx
import { Button } from "./Button";

/* Upload.jsx — drag & drop / click upload zone with file list (fine-tune datasets, batch files). */
function thUploadSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : (n / 1024).toFixed(0) + " KB"; }
export function Upload({ accept, multiple = true, hint, onChange, maxCount = 10, style }) {
  const [files, setFiles] = React.useState([]);
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const add = (list) => {
    const next = [...files, ...Array.from(list).map((f) => ({ name: f.name, size: f.size, file: f }))].slice(0, maxCount);
    setFiles(next); onChange && onChange(next.map((x) => x.file));
  };
  const remove = (i) => { const next = files.filter((_, j) => j !== i); setFiles(next); onChange && onChange(next.map((x) => x.file)); };
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      <div role="button" tabIndex={0} onClick={() => inputRef.current.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        style={{ padding: "26px 20px", textAlign: "center", cursor: "pointer", borderRadius: "var(--th-radius-sm)", border: `1px dashed ${drag ? "var(--th-teal-500)" : "var(--th-gray-200)"}`, background: drag ? "var(--th-teal-50)" : "var(--th-bg)", transition: "all .18s var(--th-ease)" }}>
        <i className="ri-upload-cloud-2-line" style={{ fontSize: 20, color: drag ? "var(--th-teal-500)" : "var(--color-fg-muted)" }} />
        <div style={{ fontSize: 13, color: "var(--th-gray-900)", marginTop: 6 }}>点击或拖拽文件到此处上传</div>
        {hint && <div style={{ fontSize: 12, color: "var(--th-gray-300)", marginTop: 3 }}>{hint}</div>}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: "none" }} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </div>
      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--th-radius-xs)", background: "var(--th-gray-50)", fontSize: 12 }}>
              <i className="ri-file-3-line" style={{ fontSize: 14, color: "var(--color-fg-muted)" }} />
              <span style={{ flex: 1, color: "var(--th-gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span className="th-nums" style={{ fontSize: 11, color: "var(--th-gray-300)" }}>{thUploadSize(f.size)}</span>
              <Button variant="ghost" size="sm" icon="ri-close-line" aria-label={`移除${f.name}`} onClick={() => remove(i)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## upload.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Upload" subtitle="上传 — 拖拽上传微调数据集 / 批量文件" viewport="700x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Upload } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Upload accept=".jsonl,.csv" hint="支持 .jsonl / .csv，单文件不超过 100 MB" />
  </div>
);</script>
</body>
</html>
```
