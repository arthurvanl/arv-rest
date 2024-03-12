import { Context } from "../context";
export * from '../rest_api'

export type ExtractRouteParams<T extends string> = string extends T
  ? {} : T extends `${string}:${infer Param}/${infer Rest}` ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : T extends `${string}:${infer Param}` ? { [k in Param]: string } : {};

export enum Method {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Delete = "DELETE"
}

export enum BodyType {
    JSON,
    Text,
    Blob,
    ArrayBuffer
}

export type EventMap = {
    response_sent: []
}

export type RouteHandler<Route extends string, Params extends ExtractRouteParams<Route> = ExtractRouteParams<Route>> = (req: Context<Route, Params>) => PromiseLike<Response | true> | Response | true;
export type MiddlewareHandler = (req: Context<"", "">) => PromiseLike<Response | true> | Response | true;
