import type { RouteHandler } from 'itty-router'
import { Router } from 'itty-router'
import TTLCache from '@isaacs/ttlcache'

const proxyCache = new TTLCache<string, string>({ max: 100, ttl: 1000 * 60 * 10 }) // 10 minutes
// now let's create a router (note the lack of "new")
export function createProxyRouter(preflight: RouteHandler) {
  const router = Router()

  router.all('*', preflight)

  router.get('/api/proxy', async (request) => {
    const proxyUrl = request.query.url
    if (!proxyUrl)
      return new Response('Bad request: Missing `url` query param', { status: 400 })
    let realUrl
    if (Array.isArray(proxyUrl))
      realUrl = proxyUrl[proxyUrl.length - 1]
    else
      realUrl = proxyUrl
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }
    if (proxyCache.has(realUrl)) {
      const result = proxyCache.get(realUrl)!
      return new Response(result, init)
    }
    else {
      const response = await fetch(realUrl, init)
      const { headers } = response
      const contentType = headers.get('content-type') || ''
      let result = ''
      if (contentType.includes('application/json'))
        result = JSON.stringify(await response.json())
      result = await response.text()
      proxyCache.set(realUrl, result)
      return new Response(result, init)
    }
  })

  // 404 for everything else
  router.all('*', () => new Response('Not Found.', { status: 404 }))
  return router
}
