import * as querystring from 'querystring';
import axios, { AxiosRequestConfig } from 'axios';

const RootPath = `authentication/v2`;

interface ITokenCache {
    promise: Promise<string>;
    expires_at: number;
}

export interface ITwoLeggedToken {
    access_token: string;
    expires_in: number;
}

export interface IThreeLeggedToken extends ITwoLeggedToken {
    refresh_token: string;
}

export interface IUserProfile {
    sub: string; // Oxygen id of the user
    name: string; // Full name of the user
    given_name: string; // First name of the user
    family_name: string; // Last name of the user
    preferred_username: string; // Username of the user
    email: string; // Primary email of the user
    email_verified: boolean; // Flag that shows if the user's email is verified or not
    profile: string; // URL for the profile of the user
    picture: string; // Profile image of the user (x120 thumbnail)
    locale: string; // End-User's locale, represented as a BCP47 standard (eg, en-US)
    updated_at: number; // The second-precision Unix timestamp of last modification on the user profile
    is_2fa_enabled: boolean; // Flag is true if two factor authentication is enabled for this profile.
    country_code: string; // The country code assigned to the account at creation.
    address: object; // object containing contact address information
    phone_number: string; // The primary phone number of the user profile with country code and extension in the format: "+(countryCode) (phoneNumber) #(Extension)"
    phone_number_verified: boolean; // Flag to tell whether or not above phone number was verified
    ldap_enabled: boolean; // Flag for the LDAP/SSO Status of the user, true if is ldap user.
    ldap_domain: string; // Domain name for the LDAP user null if non LDAP user
    job_title: string; // The job title selected on the user profile.
    industry: string; // The industry selected on the user profile.
    industry_code: string; // The industry code associated on the user profile
    about_me: string; // The about me text on the user profile
    language: string; // The language selected by the user
    company: string; // The company on the user profile
    created_date: string; // The datetime (UTC) the user was created
    last_login_date: string; // The last login date (UTC) of the user.
    eidm_guid: string; // Eidm Identifier.`
    opt_in: boolean; // The flag that indicates if user opts in the marketing information.
    social_userinfo_list: object[]; // Social provider name and provider identifier when the user is a social user or else empty list.
    thumbnails: object; // Object with profile image thumbnail urls for each size by key.
}

/**
 * Client providing access to APS Authentication API ({@link https://aps.autodesk.com/en/docs/oauth/v2/reference/http}).
 * @tutorial authentication
 */
export class AuthenticationClient {
    private client_id: string;
    private client_secret: string;
    private host: string;
    private _cached: { [key: string]: ITokenCache };

    get clientId() { return this.client_id; }

    /**
     * Initializes new client with specific APS app credentials.
     * @param {string} client_id APS application client ID. 
     * @param {string} client_secret APS application client secret.
     * @param {string} [host="https://developer.api.autodesk.com"] APS host.
     */
    constructor(client_id: string, client_secret: string, host: string = 'https://developer.api.autodesk.com') {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.host = host;
        this._cached = {};
    }

    // Helper method for POST requests with urlencoded params
    protected async post(endpoint: string, params: any, config?: AxiosRequestConfig) {
        return axios.post(this.host + '/' + RootPath + '/' + endpoint, querystring.stringify(params), config);
    }

    /**
     * Retrieves 2-legged access token for a specific set of scopes
     * ({@link https://aps.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST/}).
     * Unless the {@see force} parameter is used, the access tokens are cached
     * based on their scopes and the 'expires_in' field in the response.
     * @param {string[]} scopes List of requested {@link https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
     * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
     * @returns {Promise<ITwoLeggedToken>} Promise of 2-legged authentication object containing two fields,
     * 'access_token' with the actual token, and 'expires_in' with expiration time (in seconds).
     */
    authenticate(scopes: string[], force: boolean = false): Promise<ITwoLeggedToken> {
        // Check if there's a cached token, unexpired, and with the same scopes
        const key = 'two-legged/' + scopes.join('/');
        if (!force && key in this._cached) {
            const cache = this._cached[key];
            if (cache.expires_at > Date.now()) {
                return cache.promise.then((token) => ({
                    access_token: token,
                    expires_in: Math.floor((cache.expires_at - Date.now()) / 1000)
                }));
            }
        }

        const params = {
            'grant_type': 'client_credentials',
            'scope': scopes.join(' ')
        };
        const headers = {
            'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`
        };
        const cache = this._cached[key] = {
            expires_at: Number.MAX_VALUE,
            promise: this.post('token', params, { headers }).then((resp) => {
                const { data } = resp;
                this._cached[key].expires_at = Date.now() + data.expires_in * 1000;
                return data.access_token;
            })
        };
        return cache.promise.then((token) => ({
            access_token: token,
            expires_in: Math.floor((cache.expires_at - Date.now()) / 1000)
        }));
    }

    /**
     * Generates a URL for 3-legged authentication
     * ({@link https://aps.autodesk.com/en/docs/oauth/v2/reference/http/authorize-GET/}).
     * @param {string[]} scopes List of requested {@link https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/scopes/}.
     * @param {string} redirectUri Same redirect URI as defined by the APS app.
     * @returns {string} Autodesk login URL.
     */
    getAuthorizeRedirect(scopes: string[], redirectUri: string): string {
        return `${this.host}/${RootPath}/authorize?response_type=code&client_id=${this.client_id}&redirect_uri=${redirectUri}&scope=${scopes.join(' ')}`;
    }

    /**
     * Exchanges 3-legged authentication code for an access token
     * ({@link https://aps.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST/}).
     * @async
     * @param {string} code Authentication code returned from the Autodesk login process.
     * @param {string} redirectUri Same redirect URI as defined by the APS app.
     * @returns {Promise<IThreeLeggedToken>} Promise of 3-legged authentication object containing
     * 'access_token', 'refresh_token', and 'expires_in' with expiration time (in seconds).
     */
    async getToken(code: string, redirectUri: string): Promise<IThreeLeggedToken> {
        const params = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirectUri
        };
        const headers = {
            'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`
        };
        const resp = await this.post(`token`, params, { headers });
        return resp.data;
    }

    /**
     * Refreshes 3-legged access token
     * ({@link https://aps.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST/}).
     * @async
     * @param {string[]} scopes List of requested {@link https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
     * @param {string} refreshToken Refresh token.
     * @returns {Promise<IThreeLeggedToken>} Promise of 3-legged authentication object containing
     * 'access_token', 'refresh_token', and 'expires_in' with expiration time (in seconds).
     */
    async refreshToken(scopes: string[], refreshToken: string): Promise<IThreeLeggedToken> {
        const params = {
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'scope': scopes.join(' ')
        };
        const headers = {
            'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`
        };
        const resp = await this.post(`token`, params, { headers });
        return resp.data;
    }

    /**
     * Gets profile information for a user based on their 3-legged auth token
     * ({@link https://aps.autodesk.com/en/docs/profile/v1/reference/profile/oidcuserinfo/}).
     * @async
     * @param {string} token 3-legged authentication token.
     * @returns {Promise<IUserProfile>} User profile information.
     */
    async getUserProfile(token: string): Promise<IUserProfile> {
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const resp = await axios.get('https://api.userprofile.autodesk.com/userinfo', { headers });
        return resp.data;
    }
}
