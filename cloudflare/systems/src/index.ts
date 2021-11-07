import { Router } from 'itty-router'
import { handleCors, inProduction } from './utils'
import HTTPStatus from 'http-status-codes'
import { withCookies } from 'itty-router-extras'
import { IttyRequest } from './types'

global.performance = {
  now: () => Date.now()
} as Performance

import './wasm_exec'
import { promisify } from 'util'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

declare const WASM: string;

const getRouter = (): Router<unknown> => {
  const router = Router()

  // test
  router.options('/', handleCors)
  router.get('/', async (): Promise<Response> => {
    try {
      return new Response(await promisify(index)(), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({
        message: err as string
      }), {
        status: HTTPStatus.BAD_REQUEST,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  })
  router.options('/hello', handleCors)
  router.get('/hello', async (): Promise<Response> => {
    try {
      return new Response(await promisify(hello)(), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({
        message: err as string
      }), {
        status: HTTPStatus.BAD_REQUEST,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  })

  // auth
  router.options('/auth/:username', handleCors)
  router.get('/auth/:username', async (req): Promise<Response> => {
    if (!req.params) {
      return new Response('no username provided', { status: HTTPStatus.BAD_REQUEST })
    }
    let res: string;
    try {
      res = await promisify(sign)(req.params.username);
    } catch (err) {
      return new Response(err as string, {
        status: HTTPStatus.BAD_REQUEST,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
    const data: ISignRes = JSON.parse(res);
    return new Response(data.publicKey, {
      headers: {
        'Content-Type': 'text/plain',
        'Set-Cookie': `token=${data.jwt}; Path=*; HttpOnly; Secure=${inProduction}; SameSite=${inProduction ? 'Strict' : 'Lax'}`,
      }
    });
  });
  router.options('/verify', handleCors)
  router.get('/verify', withCookies, async (req: IttyRequest & {
    cookies: Record<string, string>
  }): Promise<Response> => {
    if (!req.cookies.token) {
      return new Response('no token cookie found', {
        status: HTTPStatus.UNAUTHORIZED,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    let res: string;
    try {
      res = await promisify(verify)(req.cookies.token);
    } catch (err) {
      return new Response(err as string, {
        status: HTTPStatus.UNAUTHORIZED,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
    return new Response(res, {
      status: HTTPStatus.OK,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  });

  // misc
  router.options('/README.txt', handleCors)
  router.get('/README.txt', async () => {
    try {
      return new Response(await promisify(getREADME)(), {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    } catch (err) {
      return new Response(err as string, {
        status: HTTPStatus.BAD_REQUEST,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
  })
  router.options('/stats', handleCors)
  router.get('/stats', async () => {
    try {
      return new Response(await promisify(getStats)(), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({
        message: err as string
      }), {
        status: HTTPStatus.BAD_REQUEST,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  })

  router.all('*', () => new Response('404, not found!', { status: 404 }))

  return router;
}

if (require.main === module) {
  addEventListener('fetch', async (e: FetchEvent) => {
    e.respondWith((async () => {
      console.log('do stuff')
      const res = await getAssetFromKV(e, {
        mapRequestToAsset: req => {
          console.log(req.url)
          const url = new URL(req.url)
          console.log(url.pathname)
          url.pathname = '/dist.wasm';
          return mapRequestToAsset(new Request(url.href, req))
        }
      });
      console.log('test')
      const go = new Go();
      const obj = await WebAssembly.instantiate(await res.arrayBuffer(), go.importObject);
      go.run(obj);
      return getRouter().handle(e.request)
    })());
  })
}
