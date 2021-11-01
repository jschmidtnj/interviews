import { Router } from 'itty-router'
import { hello, index } from './hello'
import { addPost, getPosts } from './posts'
import { getUserPostReactions, react } from './reactions'

const router = Router()

router.get('/', index)
router.get('/hello', hello)

// posts
router.get('/posts', getPosts)
router.post('/posts', addPost)

// reactions
router.get('/reactions', getUserPostReactions)
router.post('/reactions', react)

router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
