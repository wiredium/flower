interface CookieOptions {
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof window === 'undefined') return

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`
  }

  if (options.path) {
    cookieString += `; path=${options.path}`
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`
  }

  if (options.secure) {
    cookieString += '; secure'
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`
  }

  document.cookie = cookieString
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const nameEQ = encodeURIComponent(name) + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

export function deleteCookie(name: string, path: string = '/') {
  setCookie(name, '', {
    expires: new Date(0),
    path,
  })
}