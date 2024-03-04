import { EventEmitter } from "./event_emitter";
import { ExtractRouteParams, BodyType, EventMap } from "./types";

export class Context<Route extends string, Params extends ExtractRouteParams<Route>> {

    public constructor(private original_req: Request, private events: EventEmitter<EventMap>, private _route: Route, private _headers: Headers) {}

    /**
     * Get the path params
     * @returns Returns an object with the path parameters provided from route.
     * 
     * Throws an error if the length of segments is not equal to the provided segments
     */
    public params(): Params {

        const url = new URL(this.original_req.url),
        defined_segments = this._route.split('/').filter(Boolean),
        segments = url.pathname.split('/').filter(Boolean);

        if(defined_segments.length !== segments.length) {
            throw new Error('Too many segments in route!', {cause: [{defined_segments, segments}]})
        }

        const params = segments.filter((_, i) => defined_segments[i].includes(':')).map<[string, string]>((p, i) => [defined_segments[i], p]);

        return params.reduce((pre, [key, value]) => ({...pre, [key]: value}), {} as Params)
    }

    /**
     * Get the url search params parsed into an object
     * @returns 
     */
    public query() {

        const url = new URL(this.original_req.url);
        return Object.fromEntries(Array.from(url.searchParams));
    }

    /**
     * Get the request headers
     * @returns 
     */
    public get headers() {
        return this.original_req.headers;
    }

    /**
     * Add a header to the response
     * 
     * **TIP** Overrides default headers
     * @param header - the header name
     * @param value - the header value
     */
    public setHeader(header: string, value: string) {
        this._headers.append(header, value);
    }

    /**
     * Get the request body
     * @param type - parse the body to a specific format - Default `json`
     * @returns 
     */
    public body<Body extends unknown>(type?: BodyType): Promise<Body> {
        if(!type) { type = BodyType.JSON }

        if(type === BodyType.JSON) {
            return this.original_req.json() as Promise<Body>;
        } else if(type === BodyType.Blob) {
            return this.original_req.blob() as Promise<Body>;
        } else if(type === BodyType.ArrayBuffer) {
            return this.original_req.arrayBuffer() as Promise<Body>;
        } else {
            return this.original_req.text() as Promise<Body>;
        }
    }

    public get route() {
        
        const url = new URL(this.original_req.url);
        return url.pathname;
    }

    public get method() {
        return this.raw.method;
    }

    public get raw() {
        return this.original_req;
    }
    
    /**
     * Send a response
     * @param body - The response body
     * @param status - The HTTP status. Default `200`
     * @returns 
     */
    public send<Body extends string | Record<string, unknown>>(body: Body, status: number): Response {
        const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
        const content_type = typeof body === 'object' ? 'application/json' : 'text/plain';

        return new Response(responseBody, { status, headers: {'content-type': content_type, ...this._headers.toJSON()} });
    }

    public next(): Promise<true> {

        return new Promise((resolve) => {

            this.events.on('response_sent', () => resolve(true))
        });
    }
}
