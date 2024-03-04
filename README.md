# arv-rest
A very easy rest (express like) api tool which allows you to create http api's with bun

A very simple example of how you can use it:

```ts
import { BodyType, RestAPI } from "arv-rest";

const api = new RestAPI()
api.get('/', async (c) => {

    c.setHeader('content-type', 'text/html')
    const page = await Bun.file('home.html').text();

    return c.send(page, 200);
});

api.start(3030)
```

More examples
```ts
import { RestAPI } from "arv-rest";

const api = new RestAPI();
// add default headers to all responses
api.setDefaultHeader('powered-by', 'arv-rest');
api.notFound((c) => c.send('Not found!', 404));
api.use((c) => {

    const auth = c.headers.get('authorization');
    if(!auth || !auth.startsWith('Basic')) { return c.send('Unauthorized!', 401)}
    //! do some logic here
    return c.next();
})
api.get('/', async (c) => {

    c.setHeader('content-type', 'text/html')
    const page = await Bun.file('home.html').text();

    return c.send(page, 200);
})
.post('/', async (c) => {

    const body = await c.body(BodyType.ArrayBuffer);

    return c.send('OK'); // will use status 200 by default
})
.put('/', async (c) => c.send('Too lazy to add full example'))
.delete('/posts/:post_id', (c) => {

    const { post_id } = c.params();
    const { is_mock } = c.query();

    return c.send('OK');
})
api.start(3030)
```