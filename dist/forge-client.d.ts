import { AuthenticationClient } from "./authentication";
import { Region } from "./common";
export declare type IAuthOptions = {
    client_id: string;
    client_secret: string;
} | {
    token: string;
};
export declare abstract class ForgeClient {
    protected auth?: AuthenticationClient;
    protected token?: string;
    protected root: string;
    protected host: string;
    protected region: Region;
    /**
     * Initializes new client with specific authentication method.
     * @param {string} root Root path for all endpoints.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(root: string, auth: IAuthOptions, host?: string, region?: Region);
    protected setAuthorizationHeader(headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<void>;
    protected get(endpoint: string, headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<any>;
    protected post(endpoint: string, data: any, headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<any>;
    protected put(endpoint: string, data: any, headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<any>;
    protected patch(endpoint: string, data: any, headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<any>;
    protected delete(endpoint: string, headers: {
        [name: string]: string;
    } | undefined, scopes: string[]): Promise<any>;
}
//# sourceMappingURL=forge-client.d.ts.map