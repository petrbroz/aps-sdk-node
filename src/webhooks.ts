import { ForgeClient, IAuthOptions, Region } from './common';

const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write'];

/**
 * Available webhook systems.
 */
export enum WebhookSystem {
    Data = 'data',
    Derivative = 'derivative',
    RevitCloudWorksharing = 'adsk.c4r',
    FusionLifecycle = 'adsk.flc.production'
}

/**
 * Available webhook events.
 * Note that only certain events can be used with specific systems, for example,
 * `WebhookEvent.Data*` values can only be used with `WebhookSystem.Data`.
 */
export enum WebhookEvent {
    DataVersionAdded = 'dm.version.added',
    DataVersionModified = 'dm.version.modified',
    DataVersionDeleted = 'dm.version.deleted',
    DataVersionMoved = 'dm.version.moved',
    DataVersionCopied = 'dm.version.copied',
    DataFolderAdded = 'dm.folder.added',
    DataFolderModified = 'dm.folder.modified',
    DataFolderDeleted = 'dm.folder.deleted',
    DataFolderMoved = 'dm.folder.moved',
    DataFolderCopied = 'dm.folder.copied',

    DerivativeExtractionFinished = 'extraction.finished',
    DerivativeExtractionUpdated = 'extraction.updated',

    RevitModelPublish = 'model.publish',
    RevitModelSync = 'model.sync',

    FusionItemClone = 'item.clone',
    FusionItemCreate = 'item.create',
    FusionItemLock = 'item.lock',
    FusionItemRelease = 'item.release',
    FusionItemUnlock = 'item.Unlock',
    FusionItemUpdate = 'item.Update',
    FusionWorkflowTransition = 'workflow.transition'
}

export type WebhookScope = { folder: string; } | { workflow: string; } | { workspace: string; } | { 'workflow.transition': string; };

/**
 * Webhook descriptor.
 */
export interface IWebhook {
    hookId: string;
    tenant: string;
    callbackUrl: string;
    createdBy: string;
    event: string;
    createdDate: string;
    system: string;
    creatorType: string;
    status: string;
    scope: WebhookScope;
    urn: string;
}

interface ICreateWebhookParams {
    callbackUrl: string;
    scope: WebhookScope;
    hookAttribute?: object;
    filter?: string;
}

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/webhooks/v1/developers_guide/overview|webhooks APIs}.
 */
export class WebhooksClient extends ForgeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(auth: IAuthOptions, host?: string, region?: Region) {
        super('webhooks/v1', auth, host, region);
    }

    // Iterates (asynchronously) over pages of paginated results
    private async *_pager(endpoint: string) {
        let response = await this.get(endpoint, {}, ReadTokenScopes);
        yield response.data;

        while (response.links && response.links.next) {
            const next = new URL(response.links.next);
            const pageState = next.searchParams.get('pageState') || '';
            response = await this.get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}pageState=${pageState}`, {}, ReadTokenScopes);
            yield response.data;
        }
    }

    // Collects all pages of paginated results
    private async _collect(endpoint: string) {
        let response = await this.get(endpoint, {}, ReadTokenScopes);
        let results = response.data;

        while (response.links && response.links.next) {
            const next = new URL(response.links.next);
            const pageState = next.searchParams.get('pageState') || '';
            response = await this.get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}pageState=${pageState}`, {}, ReadTokenScopes);
            results = results.concat(response.items);
        }
        return results;
    }

    /**
     * Iterates over all webhooks, webhooks for specific system, or webhooks for specific system and event
     * ({@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/hooks-GET|docs},
     * {@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-hooks-GET|docs},
     * {@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-events-event-hooks-GET|docs}).
     * @async
     * @generator
     * @param {WebhookSystem} [system] Optional webhook system (e.g., "data") to filter the results.
     * @param {WebhookEvent} [event] Optional webhook event (e.g., "dm.version.copied") to filter the results.
     * @yields {AsyncIterable<IWebhook[]>} Single page of webhooks.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateHooks(system?: WebhookSystem, event?: WebhookEvent): AsyncIterable<IWebhook[]> {
        let endpoint = `hooks?region=${this.region}`;
        if (system && event) {
            endpoint = `systems/${system}/events/${event}/` + endpoint;
        } else if (system) {
            endpoint = `systems/${system}/` + endpoint;
        }
        for await (const hooks of this._pager(endpoint)) {
            yield hooks;
        }
    }

    /**
     * Lists all webhooks, webhooks for specific system, or webhooks for specific system and event
     * ({@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/hooks-GET|docs},
     * {@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-hooks-GET|docs},
     * {@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-events-event-hooks-GET|docs}).
     * @async
     * @param {WebhookSystem} [system] Optional webhook system (e.g., "data") to filter the results.
     * @param {WebhookEvent} [event] Optional webhook event (e.g., "dm.version.copied") to filter the results.
     * @returns {Promise<IWebhook[]>} List of all webhooks.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listHooks(system?: WebhookSystem, event?: WebhookEvent): Promise<IWebhook[]> {
        let endpoint = `hooks?region=${this.region}`;
        if (system && event) {
            endpoint = `systems/${system}/events/${event}/` + endpoint;
        } else if (system) {
            endpoint = `systems/${system}/` + endpoint;
        }
        return this._collect(endpoint);
    }

    /**
     * Provides details about a specific webhook
     * ({@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-events-event-hooks-hook_id-GET|docs}).
     * @async
     * @param {WebhookSystem} system Webhook system (e.g., "data").
     * @param {WebhookEvent} event Webhook event (e.g., "dm.version.copied").
     * @returns {Promise<IWebhook>} Webhook details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getHookDetails(system: WebhookSystem, event: WebhookEvent, id: string): Promise<IWebhook> {
        const hook = await this.get(`systems/${system}/events/${event}/hooks/${id}`, {}, ReadTokenScopes);
        return hook;
    }

    /**
     * Creates new webhook, either for entire webhook system, or for a specific event
     * ({@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-hooks-POST|docs},
     * {@link https://forge.autodesk.com/en/docs/webhooks/v1/reference/http/systems-system-events-event-hooks-POST|docs}).
     * @param {WebhookSystem} system Webhook system (e.g., "data").
     * @param {WebhookEvent | undefined} event Optional webhook event (e.g., "dm.version.copied").
     * If undefined, the webhook will be defined for the entire webhook system.
     * @param {string} callbackUrl Callback URL registered for the webhook.
     * @param {WebhookScope} scope An object that represents the extent to where the event is monitored.
     * For example, if the scope is folder, the webhooks service generates a notification for the specified event
     * occurring in any sub folder or item within that folder.
     * @param {object} [metadata] Optional JSON to be included as webhook metadata.
     * The maximum size of the JSON object (content) should be less than 1KB.
     * @param {string} [filter] Optional JsonPath expression to filter the callbacks you receive.
     * @returns {Promise<IWebhook[]>}
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async createHook(system: WebhookSystem, event: WebhookEvent | undefined, callbackUrl: string, scope: WebhookScope, metadata?: object, filter?: string): Promise<IWebhook[]> {
        const endpoint = event
            ? `systems/${system}/events/${event}/hooks?region=${this.region}`
            : `systems/${system}/hooks?region=${this.region}`;
        const params: ICreateWebhookParams = { callbackUrl, scope };
        if (metadata) {
            params.hookAttribute = metadata;
        }
        if (filter) {
            params.filter = filter;
        }
        const response = await this.post(endpoint, params, {}, WriteTokenScopes);
        return response.hooks;
    }
}
