# UserList

根据源文件中的 user list 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 user list 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## UserList.dc.html

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
<style data-infone-responsive>
@media (max-width: 900px) {
  [style*="grid-template-columns:minmax(0,1fr) 292px"],
  [style*="grid-template-columns:minmax(0,1fr) 280px"] { grid-template-columns: minmax(0, 1fr) !important; }
}
@media (max-width: 680px) {
  [style*="grid-template-columns:minmax(0,1fr) 92px 84px"] { grid-template-columns: minmax(0, 1fr) !important; }
}
</style>
</head>
<body>
<x-dc>
<!-- @template name="User List" description="TokenHub 列表页 — D 档骨架（NavRail）、搜索/筛选工具栏、状态 Tab、数据表格、分页、空态、确认删除" -->
<helmet>
<script src="./ds-base.js"></script>
<style>body{margin:0}</style>
</helmet>
<div style="display:flex;height:100vh;background:var(--th-bg);font-family:var(--th-font-cn)" data-screen-label="用户列表">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="TokenHub" groups="{{ sidebarGroups }}" active="users" user="admin" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}"></x-import>
<div style="flex:1;min-width:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="用户管理" actions="{{ headerActions }}" hint-size="100%,56px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Tabs" items="{{ tabItems }}" active="{{ activeTab }}" on-change="{{ setTab }}" hint-size="100%,36px"></x-import>
<div style="display:flex;align-items:center;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TextField" placeholder="搜索用户名或邮箱" value="{{ query }}" on-change="{{ setQuery }}" prefix="{{ searchIcon }}" style="width:280px" hint-size="280px,32px"></x-import>
          <x-import component-from-global-scope="TokenHubDesignSystem_019e20.Select" value="{{ roleFilter }}" on-change="{{ setRoleFilter }}" options="{{ roleOptions }}" placeholder="全部角色" style="width:150px" hint-size="150px,32px"></x-import>
<div style="flex:1"></div>
<span style="font-size:12px;color:var(--color-fg-muted)">{{ countLabel }}</span>
</div>
<div style="border-radius:var(--th-radius-md);background:var(--th-white);border:var(--th-border-card);box-shadow:var(--th-shadow-card);flex-shrink:0">
<sc-if value="{{ hasRows }}" hint-placeholder-val="{{ true }}">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" columns="{{ columns }}" rows="{{ pageRows }}" embedded="{{ true }}" hint-size="100%,300px"></x-import>
</sc-if>
<sc-if value="{{ noRows }}" hint-placeholder-val="{{ false }}">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.EmptyState" icon="ri-user-search-line" title="没有匹配的用户" description="调整搜索关键词或筛选条件后重试" hint-size="100%,220px"></x-import>
</sc-if>
</div>
<sc-if value="{{ hasRows }}" hint-placeholder-val="{{ true }}">
<div style="display:flex;justify-content:flex-end">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Pager" page="{{ page }}" total-pages="{{ totalPages }}" on-change="{{ setPage }}" hint-size="220px,32px"></x-import>
</div>
</sc-if>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Modal" open="{{ confirmOpen }}" title="禁用用户" description="{{ confirmDesc }}" on-close="{{ closeConfirm }}" footer="{{ confirmFooter }}" hint-size="440px,180px"></x-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = {
      activeTab: "all", query: "", roleFilter: "", page: 1, confirmUser: null, collapsed: false,
    users: [
      { id: 1, name: "linjie", email: "linjie@infone.dev", role: "管理员", status: "active", tokens: 4, lastActive: "10 分钟前" },
      { id: 2, name: "wangxu", email: "wangxu@infone.dev", role: "开发者", status: "active", tokens: 2, lastActive: "1 小时前" },
      { id: 3, name: "chenyi", email: "chenyi@infone.dev", role: "开发者", status: "active", tokens: 3, lastActive: "昨天" },
      { id: 4, name: "zhaomin", email: "zhaomin@infone.dev", role: "只读", status: "invited", tokens: 0, lastActive: "—" },
      { id: 5, name: "sunlei", email: "sunlei@infone.dev", role: "开发者", status: "disabled", tokens: 1, lastActive: "3 天前" },
      { id: 6, name: "houfang", email: "houfang@infone.dev", role: "开发者", status: "active", tokens: 5, lastActive: "2 小时前" },
      { id: 7, name: "gaoyang", email: "gaoyang@infone.dev", role: "只读", status: "active", tokens: 0, lastActive: "上周" },
      { id: 8, name: "xiaowen", email: "xiaowen@infone.dev", role: "管理员", status: "active", tokens: 2, lastActive: "刚刚" },
    ],
  };
  PAGE_SIZE = 5;
  statusLabel(s) { return { active: "已激活", invited: "待接受", disabled: "已禁用" }[s] || s; }
  statusTone(s) { return { active: "success", invited: "warning", disabled: "danger" }[s] || "neutral"; }
  filtered() {
    const { users, activeTab, query, roleFilter } = this.state;
    const q = query.trim().toLowerCase();
    return users.filter((u) =>
      (activeTab === "all" || u.status === activeTab) &&
      (!roleFilter || u.role === roleFilter) &&
      (!q || u.name.includes(q) || u.email.includes(q)));
  }
  renderVals() {
    const self = this;
    const DS = window.TokenHubDesignSystem_019e20 || {};
    const rows = this.filtered();
    const totalPages = Math.max(1, Math.ceil(rows.length / this.PAGE_SIZE));
    const page = Math.min(this.state.page, totalPages);
    const pageRows = rows.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE);
    const u = this.state.confirmUser;
    return {
      sidebarGroups: [
        { title: "令牌中心", items: [
          { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
          { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
          { key: "models", icon: "ri-store-2-line", label: "模型广场" },
        ]},
        { title: "系统", items: [
          { key: "users", icon: "ri-team-line", label: "用户管理" },
          { key: "settings", icon: "ri-settings-3-line", label: "系统设置" },
        ]},
      ],
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      noop: () => {},
      headerActions: DS.Button ? React.createElement(DS.Button, { size: "sm", icon: "ri-add-line", onClick: () => {} }, "新建用户") : null,
      tabItems: [
        { key: "all", label: "全部" },
        { key: "active", label: "已激活" },
        { key: "invited", label: "待接受" },
        { key: "disabled", label: "已禁用" },
      ],
      activeTab: this.state.activeTab,
      setTab: (k) => this.setState({ activeTab: k, page: 1 }),
      query: this.state.query,
      setQuery: (e) => this.setState({ query: e.target.value, page: 1 }),
      searchIcon: React.createElement("i", { className: "ri-search-line" }),
      roleFilter: this.state.roleFilter,
      setRoleFilter: (v) => this.setState({ roleFilter: v, page: 1 }),
      roleOptions: [
      { value: "管理员", label: "管理员" },
        { value: "开发者", label: "开发者" },
        { value: "只读", label: "只读" },
      ],
      countLabel: `共 ${rows.length} 位用户`,
      hasRows: rows.length > 0,
      noRows: rows.length === 0,
      columns: [
        { key: "name", label: "用户", width: "1.8fr", render: (r) => React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            DS.Avatar ? React.createElement(DS.Avatar, { name: r.name, size: 28 }) : null,
            React.createElement("div", null,
              React.createElement("div", { style: { fontWeight: 500 } }, r.name),
              React.createElement("div", { style: { fontSize: 11, color: "var(--color-fg-muted)" } }, r.email))) },
        { key: "role", label: "角色", width: "1fr", render: (r) => DS.Tag ? React.createElement(DS.Tag, null, r.role) : r.role },
        { key: "status", label: "状态", width: "1fr", render: (r) => DS.StatusChip ? React.createElement(DS.StatusChip, { tone: self.statusTone(r.status) }, self.statusLabel(r.status)) : self.statusLabel(r.status) },
        { key: "tokens", label: "令牌数", width: "0.8fr", render: (r) => String(r.tokens) },
        { key: "lastActive", label: "最近活跃", width: "1fr", render: (r) => React.createElement("span", { style: { color: "var(--color-fg-muted)", fontSize: 12 } }, r.lastActive) },
        { key: "ops", label: "", width: "48px", render: (r) => DS.Dropdown ? React.createElement(DS.Dropdown, { align: "right", items: [
            { key: "edit", label: "编辑", icon: "ri-edit-line" },
            { key: "reset", label: "重置密码", icon: "ri-lock-password-line" },
            { divider: true },
            { key: "disable", label: "禁用用户", icon: "ri-forbid-line", danger: true, onSelect: () => self.setState({ confirmUser: r }) },
          ] }) : null },
      ],
      pageRows, page, totalPages,
      setPage: (p) => this.setState({ page: p }),
      confirmOpen: !!u,
      confirmDesc: u ? `禁用后 ${u.name}（${u.email}）将无法登录，其名下 ${u.tokens} 个令牌同时失效。此操作可撤销。` : "",
      closeConfirm: () => this.setState({ confirmUser: null }),
      confirmFooter: React.createElement(React.Fragment, null,
        React.createElement(DS.Button || "button", { variant: "ghost", onClick: () => this.setState({ confirmUser: null }) }, "取消"),
        React.createElement(DS.Button || "button", { variant: "danger", onClick: () => {
            const id = u && u.id;
            this.setState((s) => ({ confirmUser: null, users: s.users.map((x) => x.id === id ? { ...x, status: "disabled" } : x) }));
          } }, "确认禁用")),
    };
  }
}
</script>
</body>
</html>
```
