# arv-rest
A very easy rest (express like) api tool which allows you to create http api's with bun

A very simple example of how you can use it:

```ts
import { RestAPI } from "arv-rest";

const api = new RestAPI()
api.get('/', async (c) => {

    c.setHeader('content-type', 'text/html')
    const page = await Bun.file('home.html').text();

    return c.send(page, 200);
});

api.start(3030)
```