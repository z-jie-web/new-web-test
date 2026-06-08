# Network Proxy Configuration

ToolPorto writer 需要访问外部网络（Google SERP、Product Hunt、Reddit、工具官网下载 logo 等）。在国内网络环境下，这些请求必须通过本地代理。

---

## 艾可云代理端口

| 协议 | 端口 | 地址 |
|------|------|------|
| HTTP | 33210 | `http://127.0.0.1:33210` |
| SOCKS | 33211 | `socks5://127.0.0.1:33211` |

## 代理检测（自动）

每轮写作开始前，执行以下检测：

```bash
# 检测艾可云代理是否可达
curl -x http://127.0.0.1:33210 -sI https://www.google.com --max-time 5 > /dev/null && export PROXY_PORT=33210 && export https_proxy=http://127.0.0.1:33210 && echo "✅ 艾可云 HTTP 代理可用: 33210" || \
curl -x socks5://127.0.0.1:33211 -sI https://www.google.com --max-time 5 > /dev/null && export PROXY_PORT=33211 && export https_proxy=socks5://127.0.0.1:33211 && echo "✅ 艾可云 SOCKS 代理可用: 33211" || \
echo "⚠️ 艾可云代理不可用，请开启艾可云应用"
```

检测到可用代理后，所有后续命令自动注入代理配置。未检测到 → 提示用户开启艾可云。

---

## curl 代理

所有 `curl` 命令追加代理标志：

```bash
# 单次命令（HTTP 代理）
curl -x http://127.0.0.1:33210 -sL --max-time 10 -o output.png "URL"

# 环境变量方式（推荐，一次设置全 session 生效）
export https_proxy=http://127.0.0.1:33210
export http_proxy=http://127.0.0.1:33210

# 后续所有 curl 自动走代理
curl -sL --max-time 10 -o output.png "URL"
```

---

## WebFetch / WebSearch 工具

Claude Code 的 `WebFetch` 和 `WebSearch` 工具会遵循系统代理设置：

```bash
# 确保环境变量已设置
export https_proxy=http://127.0.0.1:33210
export http_proxy=http://127.0.0.1:33210
```

如果 WebFetch 返回网络错误 → 检查 `echo $https_proxy` 是否已设置 → 检查艾可云是否运行 → 重试。

---

## 快速启动检查清单

```bash
# 1. 确认艾可云进程在运行（端口 33210 被监听）
lsof -i :33210 2>/dev/null | head -3

# 2. 验证代理可用
curl -x http://127.0.0.1:33210 -sI https://www.google.com --max-time 5 | head -1
# 预期输出: HTTP/2 204 或 HTTP/1.1 200

# 3. 设环境变量
export https_proxy=http://127.0.0.1:33210
echo "https_proxy=$https_proxy"
```
