# Network Proxy Configuration

ToolPorto writer 需要访问外部网络（Google SERP、Product Hunt、Reddit、工具官网下载 logo 等）。在国内网络环境下，这些请求必须通过本地代理。

---

## 当前代理（FlClash）

| 协议 | 端口 | 地址 |
|------|------|------|
| HTTP | 7890 | `http://127.0.0.1:7890` |
| DNS | 1053 | `127.0.0.1:1053`（FlClash 内置 DNS，一般无需使用） |

历史代理：艾可云（HTTP 33210 / SOCKS 33211）已弃用，仅保留端口兼容。

## 代理检测（自动）

每轮写作开始前，执行以下检测（优先当前 FlClash 端口，兼容历史端口）：

```bash
# 检测可用代理（FlClash 7890 优先）
for port in 7890 7891 33210 33211; do
  if curl -x "http://127.0.0.1:$port" -sI https://www.google.com --max-time 3 > /dev/null 2>&1; then
    export PROXY_PORT=$port
    export https_proxy="http://127.0.0.1:$port"
    export http_proxy="http://127.0.0.1:$port"
    echo "✅ 代理可用: $port"
    break
  fi
done
[ -z "${PROXY_PORT:-}" ] && echo "⚠️ 未检测到代理，请开启 FlClash 后重试"
```

检测到可用代理后，所有后续命令自动注入代理配置。未检测到 → 提示用户开启 FlClash。

> `scripts/download-logos.sh` 内置同一套探测逻辑（端口顺序 7890 → 7891 → 33210 → 33211），无需手动设置 `PROXY_PORT`。

---

## curl 代理

所有 `curl` 命令追加代理标志：

```bash
# 单次命令（HTTP 代理）
curl -x http://127.0.0.1:${PROXY_PORT:-7890} -sL --max-time 10 -o output.png "URL"

# 环境变量方式（推荐，一次设置全 session 生效）
export https_proxy=http://127.0.0.1:${PROXY_PORT:-7890}
export http_proxy=http://127.0.0.1:${PROXY_PORT:-7890}

# 后续所有 curl 自动走代理
curl -sL --max-time 10 -o output.png "URL"
```

---

## WebFetch / WebSearch 工具

Claude Code 的 `WebFetch` 和 `WebSearch` 工具会遵循系统代理设置：

```bash
# 确保环境变量已设置
export https_proxy=http://127.0.0.1:${PROXY_PORT:-7890}
export http_proxy=http://127.0.0.1:${PROXY_PORT:-7890}
```

如果 WebFetch 返回网络错误 → 检查 `echo $https_proxy` 是否已设置 → 检查 FlClash 是否运行 → 重试。

---

## 快速启动检查清单

```bash
# 1. 确认 FlClash 进程在运行（端口 7890 被监听）
lsof -i :7890 2>/dev/null | head -3

# 2. 验证代理可用
curl -x http://127.0.0.1:7890 -sI https://www.google.com --max-time 5 | head -1
# 预期输出: HTTP/2 204 或 HTTP/1.1 200

# 3. 设环境变量
export https_proxy=http://127.0.0.1:7890
echo "https_proxy=$https_proxy"
```
