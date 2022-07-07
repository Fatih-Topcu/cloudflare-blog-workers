import { Router } from 'itty-router'
import { handleCors } from './corshelper'

// Create a new router
const router = Router()

// Headers GET API calls
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
    Accept: 'application/json',
}

// Headers for POST api calls
const myHeaders = new Headers()
myHeaders.set('Access-Control-Allow-Origin', '*')
myHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
myHeaders.set('Access-Control-Max-Age', '86400')

// Handling CORS for POST api calls
router.options('/add', handleCors({ methods: 'POST', maxAge: 86400 }))
router.options('/comment', handleCors({ methods: 'POST', maxAge: 86400 }))
router.options('/rating', handleCors({ methods: 'POST', maxAge: 86400 }))

// Get all posts
router.get('/posts', async () => {
    let posts = await POSTS.get('POSTS')

    return new Response(posts, { headers })
})

// Get selected post with id
router.get('/posts/:id', async ({ params }) => {
    let posts = await POSTS.get('POSTS')

    let post = JSON.parse(posts).find(x => x.id == params.id)

    return new Response(JSON.stringify(post), { headers })
})

// Add new post
router.post('/add', async request => {
    let posts = await POSTS.get('POSTS')

    let postsArray = JSON.parse(posts)

    let newPost = await request.json()

    newPost['comments'] = []
    newPost['rating'] = 0
    newPost['date'] = new Date()
    newPost['id'] =
        postsArray.length > 0 ? postsArray[postsArray.length - 1].id + 1 : 1

    postsArray.push(newPost)

    //disabled intentionally
    //await POSTS.put('POSTS', JSON.stringify(postsArray))

    return new Response(`New post added : ${newPost}`, {
        headers: myHeaders,
    }) 
})

// Add new comment to existing post
router.post('/comment', async request => {
    let posts = await POSTS.get('POSTS')
    let postsArray = JSON.parse(posts)
    let commentData = await request.json()

    let index = postsArray.findIndex(x => x.id == commentData.id)

    delete commentData.id
    commentData['date'] = new Date()

    postsArray[index].comments.push(commentData)

    await POSTS.put('POSTS', JSON.stringify(postsArray))

    return new Response(
        `New comment added to post with id ${postsArray[index].id} : ${commentData}`,
        {
            headers: myHeaders,
        }
    )
})

// Change rating of existing post
router.post('/rating', async request => {
    let posts = await POSTS.get('POSTS')
    let postsArray = JSON.parse(posts)
    let rating = await request.json()

    let index = postsArray.findIndex(x => x.id == rating.id)

    postsArray[index].rating += rating.rating

    await POSTS.put('POSTS', JSON.stringify(postsArray))

    return new Response(
        `Rating changed for post with id ${rating.id} : ${rating}`,
        {
            headers: myHeaders,
        }
    )
})

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', e => {
    e.respondWith(router.handle(e.request))
})
