import 'reflect-metadata'
import { Router } from 'itty-router'
import { withCookies } from 'itty-router-extras'
import { hello, index } from './hello'
import { addPost, getPosts, updatePost, deletePost, getPost } from './posts'
import { getUserPostReactions, react } from './reactions'
import { handleCors, inProduction } from './utils'
import { login } from './users'
import { logout, verify } from './auth'

const router = Router()

router.get('/', index)
router.get('/hello', hello)
if (!inProduction) {
  router.options('/verify', handleCors)
  router.get('/verify', withCookies, verify)
}

// posts
router.options('/posts', handleCors)
router.get('/posts', getPosts)
router.post('/posts', withCookies, addPost)

router.options('/posts/:id', handleCors)
router.get('/posts/:id', getPost)
router.put('/posts/:id', withCookies, updatePost)
router.delete('/posts/:id', withCookies, deletePost)

// users
router.options('/login', handleCors)
router.post('/login', login)

router.options('/logout', handleCors)
router.put('/logout', withCookies, logout)

// reactions
router.get('/reactions', withCookies, getUserPostReactions)
router.options('/reactions', handleCors)
router.post('/reactions', withCookies, react)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
