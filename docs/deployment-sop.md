# ToolPorto 部署 SOP

> 从域名购买到网站上线的完整操作记录，方便后续复盘和迁移参考。

**域名**：`toolporto.com`
**注册日期**：2026-05-29
**部署平台**：Vercel（免费）+ Cloudflare（免费 DNS/CDN）
**代码仓库**：`github.com/z-jie-web/new-web-test`

---

## 1. 域名购买

### 选域名原则

- **只要 `.com`**——海外英语用户首选，信任度最高
- **品牌化，不做关键词堆砌**——`bestaitoolsreview.com` 会被 Google 判定为低质站
- **10-15 字符以内**，无连字符、无数字
- **过电台测试**——普通人听一遍就能拼对

### 排坑记录

| 平台 | 问题 | 结论 |
|------|------|------|
| Porkbun | 支付宝报价 $11.08，但中国用户需身份证验证 | ❌ 放弃 |
| 阿里云国际版 | 要求新加坡手机号验证 | ❌ 放弃 |
| Namecheap | 价格 $13+，支付宝入口被隐藏 | ❌ 放弃 |
| Dynadot | 注册流程报错 | ❌ 放弃 |
| **Spaceship** | 支付宝可用，注册流程顺畅，$11.48 | ✅ 最终选择 |

### 最终购买

- 平台：**Spaceship**（Namecheap 旗下轻量品牌）
- 域名：`toolporto.com`
- 费用：$11.48（含 ICANN fee $0.20）
- 支付方式：支付宝

---

## 2. Cloudflare DNS 托管

### 为什么用 Cloudflare

- 域名注册商（Spaceship）的 DNS 性能一般
- Cloudflare 提供免费全球 DNS 加速 + CDN + DDoS 防护 + 免费 SSL
- 对中国用户注册友好（Google 登录即可）

### 操作步骤

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com) → Sign in with Google
2. 点 "Add a site" → 输入 `toolporto.com` → Continue
3. 选 **Free plan** → Continue
4. 页面自动扫描现有 DNS 记录 → 删掉扫描到的 A 记录
5. 添加两条 CNAME 记录：

| 类型 | 名称 | 目标 | 代理状态 |
|------|------|------|---------|
| CNAME | @ | cname.vercel-dns.com | 橙色云朵（开启） |
| CNAME | www | cname.vercel-dns.com | 橙色云朵（开启） |

6. Continue → 页面显示 Cloudflare nameserver 地址
7. 回到 Spaceship → 域名管理 → Nameservers → 替换为：
   - `dane.ns.cloudflare.com`
   - `olivia.ns.cloudflare.com`
8. 等待 5-30 分钟生效（Cloudflare 显示 "Active" 即完成）

### Cloudflare SSL/TLS 设置

- SSL/TLS 加密模式：**Full (strict)**
- 始终使用 HTTPS：开启
- 自动 HTTPS 重写：开启

---

## 3. Vercel 部署

### 首次部署

1. 打开 [vercel.com](https://vercel.com) → Sign in with GitHub
2. Add New Project → Import Git Repository → 选 `new-web-test`
3. 框架自动识别 Next.js → 直接点 Deploy
4. 等待 2 分钟 → 获得默认域名 `new-web-test-two.vercel.app`

### 绑定自定义域名

1. Vercel 项目 → Settings → Domains
2. 添加 `toolporto.com` → 设为 Production
3. 添加 `www.toolporto.com` → 设为 308 Permanent Redirect → `toolporto.com`

**最终域名配置：**
```
toolporto.com        → Production（主域名）
www.toolporto.com    → 308 Redirect → toolporto.com
```

### 自动部署

- 推送代码到 GitHub `main` 分支 → Vercel 自动触发构建和部署
- 无需手动操作

---

## 4. 代码中的域名配置

**文件**：`lib/constants.ts`

```typescript
export const SITE = {
  name: 'ToolHub',
  tagline: 'Discover the best online tools and AI products',
  description: '...',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolporto.com',
  locale: 'en_US',
};
```

- 生产环境通过环境变量 `NEXT_PUBLIC_SITE_URL` 覆盖
- Vercel 中设置此环境变量为 `https://toolporto.com`

---

## 5. 验证清单

部署完成后逐项检查：

- [ ] `https://toolporto.com` → 200，页面正常加载
- [ ] `https://www.toolporto.com` → 308 跳转到 `https://toolporto.com`
- [ ] `http://toolporto.com` → 308 跳转到 `https://toolporto.com`
- [ ] `https://toolporto.com/sitemap.xml` → 正常返回 XML
- [ ] `https://toolporto.com/robots.txt` → 正常返回
- [ ] 随机点 5 个 review 页面 → 全部 200
- [ ] 随机点 3 个 compare 页面 → 全部 200
- [ ] Google Search Console 提交 sitemap
- [ ] Cloudflare SSL/TLS → Full (strict)

---

## 6. 后续工作

见 `docs/superpowers/plans/2026-05-29-launch-and-growth-roadmap.md`：

1. GSC 提交 sitemap（当天完成）
2. 22 篇 review 内容扩充到 800-1200 词（1-4 周）
3. 接入 Umami 统计
4. Affiliate 链接申请 + AdSense 申请
