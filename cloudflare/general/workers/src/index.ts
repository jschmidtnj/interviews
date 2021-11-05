import 'reflect-metadata'
import { Router } from 'itty-router'
import { hello, index } from './hello'
import { addPost, getPosts, updatePost, deletePost, getPost } from './posts'
import { getUserPostReactions, react } from './reactions'
import { handleCors } from './utils'
import { login } from './users'

const router = Router()

router.get('/', index)
router.get('/hello', hello)

// posts
router.options('/posts', handleCors)
router.get('/posts', getPosts)
router.post('/posts', addPost)

router.options('/posts/:id', handleCors)
router.get('/posts/:id', getPost)
router.put('/posts/:id', updatePost)
router.delete('/posts/:id', deletePost)

// users
router.options('/login', handleCors)
router.post('/login', login)

// reactions
router.get('/reactions', getUserPostReactions)
router.options('/reactions', handleCors)
router.post('/reactions', react)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
