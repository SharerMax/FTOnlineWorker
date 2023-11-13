/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createCors } from 'itty-router'
import { createProxyRouter } from './router'

let cachedRouter: ReturnType<typeof createProxyRouter> | null = null
let cacheCorsify: any = null
// Export a default object containing event handlers
export default {
  // The fetch handler is invoked when this worker receives a HTTP(S) request
  // and should return a Response (optionally wrapped in a Promise)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!cachedRouter) {
      const { preflight, corsify } = createCors({
        origins: env.CORS_ORIGINS,
        methods: ['GET', 'HEAD'],
      })
      cachedRouter = createProxyRouter(preflight)
      cacheCorsify = corsify
    }

    return cachedRouter.handle(request, env, ctx).then(cacheCorsify)
  },
}
