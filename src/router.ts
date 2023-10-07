import { Router } from 'itty-router'

// now let's create a router (note the lack of "new")
const router = Router()

router.get('/api/proxy', async (request) => {
  const proxyUrl = request.query.url
  if (!proxyUrl)
    return new Response('Bad request: Missing `url` query param', { status: 400 })
  if (Array.isArray(proxyUrl))
    return await fetch(proxyUrl[proxyUrl.length - 1], request)
  else
    return await fetch(proxyUrl, request)
})

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))

export default router
