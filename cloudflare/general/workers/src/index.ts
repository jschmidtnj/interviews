import 'reflect-metadata'
import { Router } from 'itty-router'
import { withCookies } from 'itty-router-extras'
import { hello, index } from './hello'
import { addPost, getPosts, updatePost, deletePost, getPost } from './posts'
import { getUserPostReactions, react } from './reactions'
import { handleCors } from './utils'
import { logout } from './auth'

const router = Router()

router.get('/', index)
router.get('/hello', hello)

// posts
router.options('/posts', handleCors)
router.get('/posts', getPosts)
router.post('/posts', withCookies, addPost)

router.options('/posts/:id', handleCors)
router.get('/posts/:id', getPost)
router.put('/posts/:id', withCookies, updatePost)
router.delete('/posts/:id', withCookies, deletePost)

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
