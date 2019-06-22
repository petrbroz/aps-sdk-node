import { RequestInit } from 'node-fetch';
export declare const DefaultHost = "https://developer.api.autodesk.com";
export declare function rawFetch(url: string, options: RequestInit): Promise<import("node-fetch").Response>;
export declare function get(url: string, headers?: {
    [name: string]: string;
}): Promise<any>;
export declare function post(url: string, data: any, headers?: {
    [name: string]: string;
}): Promise<any>;
export declare function put(url: string, data: any, headers?: {
    [name: string]: string;
}): Promise<any>;
export declare function patch(url: string, data: any, headers?: {
    [name: string]: string;
}): Promise<any>;
export declare type IAuthOptions = {
    client_id: string;
    client_secret: string;
} | {
    token: string;
};
//# sourceMappingURL=common.d.ts.map