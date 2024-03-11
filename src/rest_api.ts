import { Server } from "bun";
import { Context } from "./context";
import { EventEmitter } from "./event_emitter";
import { EventMap, ExtractRouteParams, Method, MiddlewareHandler, RouteHandler } from "./types";

class Route<R extends string = string, Params extends ExtractRouteParams<R> = ExtractRouteParams<R>> {
    
    public constructor(private handle: RouteHandler<R, Params>, private route: R = "" as R, private method: Method = Method.Get, private hostname?: string) {}

    public getMethod() { return this.method }
    public getRoute() { return this.route }
    public getHandler() { return this.handle; }
}

class Middleware {
    public constructor(private handle: MiddlewareHandler) {}

    public getHandler() { return this.handle; }
}

class RestAPI {

    private _routes: unknown[] = [];
    private middlewares: Middleware[] = [];
    private hostname: string = 'http://localhost/';
    private not_found_route: Route<""> | undefined;
    private _default_headers = new Headers();
    private _server!: Server;
    private events = new EventEmitter<EventMap>();

    public start(port: number) {

        this._server = Bun.serve({
            port,
            fetch: this.handleRequest.bind(this)
        });
    }

    public get server() {
        return this._server;
    }

    public get routes() {
        return this._routes;
    }

    /**
     * Set default headers on all requests
     * @param header 
     * @param value 
     */
    public setDefaultHeader(header: string, value: string) {
        this._default_headers.append(header, value);
        return this;
    }

    private registerRoute<Route extends string>(method: Method, path: Route, handler: RouteHandler<Route>) {
        this._routes.push(new Route(handler, path, method, this.hostname));
    }

    private async handleRequest(request: Request) {

        const url = new URL(request.url);
        const route = (this._routes as Route[]).find((r) => {
            const segments = url.pathname.split('/').filter(Boolean);
            const defined_segments = r.getRoute().split('/').filter(Boolean);

            const check_segments = defined_segments.filter((s) => !s.includes(':')).some((s, i) => s === segments[i]) || defined_segments.length === 0;

            return r.getMethod() === request.method && defined_segments.length === segments.length && check_segments;
        });

        let halted = false, halted_res!: Response;
        const context = new Context<"", "">(request, this.events, "", this._default_headers as Headers)

        for(const middleware of this.middlewares) {
            const result = await middleware.getHandler()(context);
            if(typeof result !== 'boolean') {
                halted = true;
                halted_res = result
                break;
            }
        }

        if(halted) { this.events.emit('response_sent'); return halted_res }

        if(route) {
            const custom_req = new Context(request, this.events, route.getRoute(), this._default_headers as Headers)
            const response = await route.getHandler()(custom_req);
            this.events.emit('response_sent'); 
            return response as Response;
        } else {
            const route = this.not_found_route ?? new Route((req) => req.send("Not found", 404))
            const response = await route.getHandler()(new Context(request, this.events, route.getRoute(), this._default_headers as Headers))
            this.events.emit('response_sent');
            return response as Response
        }
    }

    public notFound(handler: RouteHandler<"">) {
        this.not_found_route = new Route(handler);
        return this;
    }

    public use(middleware: MiddlewareHandler) {

        this.middlewares.push(new Middleware(middleware));
        return this;
    }

    public get<Route extends string>(path: Route, handler: RouteHandler<Route>) {
        this.registerRoute(Method.Get, path, handler);
        return this;
    }

    public post<Route extends string>(path: Route, handler: RouteHandler<Route>) {
        this.registerRoute(Method.Post, path, handler);
        return this;
    }

    public put<Route extends string>(path: Route, handler: RouteHandler<Route>) {
        this.registerRoute(Method.Put, path, handler);
        return this;
    }

    public delete<Route extends string>(path: Route, handler: RouteHandler<Route>) {
        this.registerRoute(Method.Delete, path, handler);
        return this;
    }
}

export { Context, RestAPI, Route };
