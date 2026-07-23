import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 从任意字符串中提取首个 http(s) URL。
 * 兼容菜单 path 中混入前缀的情况（如 "外链https://..."）。
 */
function extractHttpUrl(raw: string): string | null {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return null
  const index = trimmed.search(/https?:\/\//i)
  if (index === -1) return null
  return trimmed.slice(index)
}

function parseSafeUrl(raw: string): URL | null {
  const extracted = extractHttpUrl(raw)
  if (!extracted) return null
  try {
    const url = new URL(extracted)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url
  } catch {
    return null
  }
}

/** 受信主机：当前站点 + API 主机 + 环境变量白名单。 */
function getAllowlist(): string[] {
  const hosts = new Set<string>()

  if (typeof window !== 'undefined' && window.location?.hostname) {
    hosts.add(window.location.hostname.toLowerCase())
  }

  const baseUrl = import.meta.env.VITE_APP_BASE_URL
  if (baseUrl && /^https?:\/\//i.test(baseUrl)) {
    try {
      hosts.add(new URL(baseUrl).hostname.toLowerCase())
    } catch {
      // ignore invalid base url
    }
  }

  const extra = import.meta.env.VITE_EXTERNAL_LINK_ALLOWLIST || ''
  for (const part of String(extra).split(',')) {
    const host = part.trim().toLowerCase()
    if (host) hosts.add(host)
  }

  return [...hosts]
}

/**
 * 支持：
 * - 精确匹配 example.com
 * - 通配 *.example.com（含 example.com 本身）
 */
function isTrustedHost(hostname: string, allowlist: string[]): boolean {
  const host = hostname.toLowerCase()
  return allowlist.some((entry) => {
    if (entry.startsWith('*.')) {
      const root = entry.slice(2)
      return host === root || host.endsWith(`.${root}`)
    }
    if (entry.startsWith('.')) {
      const root = entry.slice(1)
      return host === root || host.endsWith(entry)
    }
    return host === entry
  })
}

export interface OpenExternalOptions {
  /** 不受信域名是否跳过二次确认（默认 false） */
  skipConfirm?: boolean
}

/**
 * 安全打开外部链接：
 * 1. 仅允许 http/https
 * 2. 受信域直接打开
 * 3. 非受信域二次确认
 * 4. 使用 noopener,noreferrer，并清空 opener
 */
export async function openExternal(
  rawUrl: string,
  options: OpenExternalOptions = {},
): Promise<boolean> {
  const url = parseSafeUrl(rawUrl)
  if (!url) {
    ElMessage.warning('外链地址无效或不支持的协议')
    return false
  }

  const trusted = isTrustedHost(url.hostname, getAllowlist())
  if (!trusted && !options.skipConfirm) {
    try {
      await ElMessageBox.confirm(
        `即将打开不受信外链：\n${url.href}\n\n请确认该地址来源可信后再继续。`,
        '外链打开确认',
        {
          type: 'warning',
          confirmButtonText: '仍要打开',
          cancelButtonText: '取消',
          distinguishCancelAndClose: true,
        },
      )
    } catch {
      return false
    }
  }

  const opened = window.open(url.href, '_blank', 'noopener,noreferrer')
  // 部分浏览器在传入 noopener 时返回 null，属预期行为
  if (opened) {
    opened.opener = null
  }
  return true
}
