# Form 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Form.d.ts

```typescript
import * as React from "react";
export interface FormRule {
  required?: boolean;
  /** Error text; each rule type has a Chinese default. */
  message?: string;
  pattern?: RegExp;
  /** Min string length. */
  min?: number;
  /** Max string length. */
  max?: number;
  /** Return an error string to fail, undefined to pass. */
  validator?: (value: any, values: Record<string, any>) => string | undefined;
}
export interface FormProps {
  children?: React.ReactNode;
  initialValues?: Record<string, any>;
  /** Called with values when every rule passes on submit. */
  onFinish?: (values: Record<string, any>) => void;
  onFinishFailed?: (errors: Record<string, string>, values: Record<string, any>) => void;
  /** @default "vertical" */
  layout?: "vertical" | "horizontal";
  /** Field rhythm; also sets data-density on the <form> so nested controls tighten. @default "comfortable" */
  density?: "comfortable" | "compact";
  style?: React.CSSProperties;
}
export function Form(props: FormProps): JSX.Element;
export interface FormItemProps {
  /** Field key in the form's values; omit for layout-only items (e.g. a submit row). */
  name?: string;
  label?: React.ReactNode;
  rules?: FormRule[];
  /** Shorthand for a leading { required: true } rule. */
  required?: boolean;
  /** Single control element; receives value / onChange / onBlur / error. */
  children: React.ReactElement;
  /** Muted helper line shown when there is no error. */
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}
export function FormItem(props: FormItemProps): JSX.Element;
```

`FormItem` 只负责字段标签、布局、校验和辅助文案，不渲染增加/减少按钮。数值增减控件统一使用 `InputNumber`，其按钮尺寸、箭头图标和分隔线由 `InputNumber` 统一维护；不要在 `FormItem` 内重复绘制一套增减按钮。

## Form.jsx

```jsx
/* Form.jsx — form with rule-based validation (AntD Form equivalent).
   FormItem clones its single child, injecting value / onChange / error.
   Rules: { required, message, pattern, min, max, validator(value, values) => string|undefined }

   NOTE: the context is created lazily. The bundle may be evaluated before the
   React UMD script has run (cards load _ds_bundle.js in <head>), so touching
   `React` at module top level throws and leaves this module's exports
   undefined. Never call React.* outside a component body in this project. */
let thFormCtxRef = null;
const thFormCtx = () => (thFormCtxRef || (thFormCtxRef = React.createContext(null)));
function thValidate(rules = [], value, values) {
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);
  for (const r of rules) {
    if (r.required && empty) return r.message || "必填项";
    if (empty) continue;
    if (r.pattern && !r.pattern.test(String(value))) return r.message || "格式不正确";
    if (r.min !== undefined && String(value).length < r.min) return r.message || `至少 ${r.min} 个字符`;
    if (r.max !== undefined && String(value).length > r.max) return r.message || `最多 ${r.max} 个字符`;
    if (r.validator) { const msg = r.validator(value, values); if (msg) return msg; }
  }
  return undefined;
}
export function Form({ children, initialValues = {}, onFinish, onFinishFailed, layout = "vertical", density = "comfortable", style }) {
  const ThFormCtx = thFormCtx();
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const rulesRef = React.useRef({});
  const ctx = React.useMemo(() => ({
    layout, values, errors,
    register: (name, rules) => { rulesRef.current[name] = rules; },
    setValue: (name, v) => {
      setValues((prev) => {
        const next = { ...prev, [name]: v };
        setErrors((e) => e[name] ? { ...e, [name]: thValidate(rulesRef.current[name], v, next) } : e);
        return next;
      });
    },
    blur: (name) => setErrors((e) => ({ ...e, [name]: thValidate(rulesRef.current[name], values[name], values) })),
  }), [values, errors, layout]);
  const submit = (e) => {
    e && e.preventDefault();
    const errs = {};
    for (const [name, rules] of Object.entries(rulesRef.current)) {
      const msg = thValidate(rules, values[name], values);
      if (msg) errs[name] = msg;
    }
    setErrors(errs);
    if (Object.keys(errs).length) onFinishFailed && onFinishFailed(errs, values);
    else onFinish && onFinish(values);
  };
  return (
    <ThFormCtx.Provider value={ctx}>
      <form onSubmit={submit} noValidate data-density={density === "compact" ? "compact" : undefined}
        style={{ fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column", gap: density === "compact" ? 12 : 16, ...style }}>{children}</form>
    </ThFormCtx.Provider>  );
}
export function FormItem({ name, label, rules = [], required, children, extra, style }) {
  const ctx = React.useContext(thFormCtx());
  React.useEffect(() => { if (ctx && name) ctx.register(name, required ? [{ required: true }, ...rules] : rules); });
  if (!ctx) return children;
  const error = name ? ctx.errors[name] : undefined;
  const isRequired = required || rules.some((r) => r.required);
  const child = React.Children.only(children);
  const injected = name ? React.cloneElement(child, {
    value: ctx.values[name] ?? "",
    error,
    onChange: (ev) => ctx.setValue(name, ev && ev.target ? ev.target.value : ev),
    onBlur: () => ctx.blur(name),
  }) : child;
  const horizontal = ctx.layout === "horizontal";
  return (
    <div style={{ display: horizontal ? "grid" : "flex", gridTemplateColumns: horizontal ? "110px 1fr" : undefined, flexDirection: "column", gap: horizontal ? 16 : "var(--th-field-gap)", alignItems: horizontal ? "start" : "stretch", ...style }}>
      {label && (
        <label style={{ fontSize: "var(--th-text-sm)", color: "var(--th-gray-600)", lineHeight: horizontal ? "32px" : 1.5 }}>
          {isRequired && <span style={{ color: "var(--color-danger-fg)", marginRight: 3 }}>*</span>}{label}
        </label>
      )}
      <div>
        {injected}
        {error && <div className="th-in-fade" style={{ fontSize: "var(--th-text-xs)", color: "var(--color-danger-fg)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><i className="ri-error-warning-line" style={{ fontSize: 13 }} />{error}</div>}
        {!error && extra && <div style={{ fontSize: "var(--th-text-xs)", color: "var(--th-gray-300)", marginTop: 4 }}>{extra}</div>}
      </div>
    </div>
  );
}
```

## form.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Form" subtitle="表单校验 — 规则式校验：必填 / 格式 / 自定义" viewport="700x430" -->
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
const { Form, FormItem, TextField, Button, Toast } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <Form initialValues={{ name: "" }} onFinish={() => {}}>
      <FormItem name="name" label="密钥名称" required rules={[{ max: 24, message: "不超过 24 个字符" }]} extra="仅用于识别，不影响调用">
        <TextField placeholder="如 prod-gateway" />
      </FormItem>
      <FormItem name="email" label="告警邮箱" rules={[{ required: true }, { pattern: /^\S+@\S+\.\S+$/, message: "邮箱格式不正确" }]}>
        <TextField placeholder="alerts@example.com" />
      </FormItem>
      <FormItem name="quota" label="月度配额（¥）" rules={[{ validator: (v) => v && Number(v) <= 0 ? "必须大于 0" : undefined }]}>
        <TextField type="number" placeholder="不填则不限额" />
      </FormItem>
      <FormItem><Button type="submit">创建密钥</Button></FormItem>
    </Form>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<div className="panel"><Demo /></div>);</script>
</body>
</html>
```
