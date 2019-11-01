import { Region } from './common';
import { ForgeClient, IAuthOptions } from './common';

const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:write'];

interface IHub {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IProject {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IFolder {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IItem {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IVersion {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IIssue {
    id: string; // Unique issue ID. Can be used in other API calls.
    answer?: string; // The suggested answer for the issue.
    answered_at?: string; // The date and time the issue was answered, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    answered_by?: string; // The user who suggested an answer for the issue.
    assigned_to_type?: string; // The type of subject this issue is assigned to. Possible values: user, company, role.
    assigned_to?: string; // The Autodesk ID of the user, role, or company the issue was assigned to.
    attachment_count?: number; // The number of attachments added to the issue.
    attachments_attributes?: any[];
    close_version?: string; // The version of the issue when it was closed.
    closed_at?: string; // The timestamp of the data and time the issue was closed, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    closed_by?: string; // The Autodesk ID of the user who closed the issue.
    collection_urn?: string;
    comment_count?: number; // The number of comments added to the issue.
    comments_attributes?: any[];
    created_at?: string; // The timestamp of the client when the issue was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    created_by?: string; // The Autodesk ID of the user who created the issue.
    custom_attributes?: any[];
    description?: string; // The description of the purpose of the issue.
    due_date?: string; // The timestamp of the issue’s specified due date, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    identifier?: number; // The identifier of the issue.
    issue_sub_type?: number;
    issue_type_id?: string;
    issue_type?: number;
    lbs_location?: string; // The ID of the location that relates to the issue.
    location_description?: string; // The location of the issue.
    markup_metadata?: string;
    ng_issue_subtype_id?: string; // The ID of the issue subtype. To find the issue subtype that corresponds to the ID, call GET ng-issue-types, with the include=subtypes query string parameter.
    ng_issue_type_id?: string; // The ID of the issue type. To find the issue type that corresponds to the ID, call GET ng-issue-types. (Note that issues that were created in the Document issues module prior to the release of the latest version of the Issues API, are automatically assigned the design issue type. For more details, see the changelog.)
    owner?: string; // The Autodesk ID of the user who owns this issue.
    permitted_attributes?: any[]; // A list of attributes accessible to the current user.
    permitted_statuses?: any[]; // A list of statuses accessible to the current user.
    pushpin_attributes?: object; // The type and location of the pushpin. Only relevant for pushpin issues. A pushpin is a visual marker that denotes the location of a issue in a document.
    quality_urns?: object; // The resource in the Checklists service that this issue is related to.
    resource_urns?: object;
    root_cause_id?: string; // The ID of the type of root cause for the issue. To verify the type of root cause, see GET root-causes.
    root_cause?: string;
    sheet_metadata?: object; // Information about the document associated with the pushpin issue. Only relevant for pushpin issues. A pushpin is a visual marker that denotes the location of a issue in a document.
    snapshot_urn?: string;
    starting_version?: number; // The first version of the issue.
    status?: string; // The current status of the issue. Possible values: draft, open, close.
    synced_at?: string; // The timestamp of the server when the issue was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    tags?: object
    target_urn_page?: string;
    target_urn?: string; // The item ID of the document associated with the issue. Identifies whether this is a pushpin issue or a project-related issue. A pushpin is a visual marker that denotes the location of an issue in a document. A project-related issue is assigned a null value, and a pushpin issue is assigned the item ID of the document associated with the pushpin.
    title?: string; // The title of the issue.
    trades?: any[];
    updated_at?: string; // The last time the issue’s attributes were updated, in the following format: YYYY-MM-DDThh:mm:ss.sz.
}

interface INewIssue {
    title: string; // The title of the issue.
    ng_issue_subtype_id: string; // The ID of the issue subtype. To find the issue subtype that corresponds to the ID, call GET ng-issue-types, with the include=subtypes query string parameter.
    ng_issue_type_id: string; // The ID of the issue type. To find the issue type that corresponds to the ID, call GET ng-issue-types. (Note that issues that were created in the Document issues module prior to the release of the latest version of the Issues API, are automatically assigned the design issue type. For more details, see the changelog.)

    description?: string; // The description of the purpose of the issue.
    status?: string; // The current status of the issue. Possible values: draft, open, close.
    starting_version?: number; // The first version of the issue.
    due_date?: string; // The timestamp of the issue’s specified due date, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    location_description?: string; // The location of the issue.
    created_at?: string; // The timestamp of the client when the issue was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    lbs_location?: string; // The ID of the location that relates to the issue.
    assigned_to_type?: string; // The type of subject this issue is assigned to. Possible values: user, company, role.
    assigned_to?: string; // The Autodesk ID of the user, role, or company the issue was assigned to.
    owner?: string; // The Autodesk ID of the user who owns this issue.
    root_cause_id?: string; // The ID of the type of root cause for the issue. To verify the type of root cause, see GET root-causes.
    quality_urns?: object; // The resource in the Checklists service that this issue is related to.
}

interface IUpdateIssue {
    title: string; // The title of the issue.

    ng_issue_subtype_id?: string; // The ID of the issue subtype. To find the issue subtype that corresponds to the ID, call GET ng-issue-types, with the include=subtypes query string parameter.
    ng_issue_type_id?: string; // The ID of the issue type. To find the issue type that corresponds to the ID, call GET ng-issue-types. (Note that issues that were created in the Document issues module prior to the release of the latest version of the Issues API, are automatically assigned the design issue type. For more details, see the changelog.)
    description?: string; // The description of the purpose of the issue.
    status?: string; // The current status of the issue. Possible values: draft, open, close.
    starting_version?: number; // The first version of the issue.
    due_date?: string; // The timestamp of the issue’s specified due date, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    location_description?: string; // The location of the issue.
    created_at?: string; // The timestamp of the client when the issue was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    lbs_location?: string; // The ID of the location that relates to the issue.
    assigned_to_type?: string; // The type of subject this issue is assigned to. Possible values: user, company, role.
    assigned_to?: string; // The Autodesk ID of the user, role, or company the issue was assigned to.
    owner?: string; // The Autodesk ID of the user who owns this issue.
    root_cause_id?: string; // The ID of the type of root cause for the issue. To verify the type of root cause, see GET root-causes.
    quality_urns?: object; // The resource in the Checklists service that this issue is related to.
}

interface IIssueComment {
    id: string;

    body?: string; // The content of the comment.
    created_at?: string; // The timestamp of the date and time the comment was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    created_by?: string;
    issue_id?: string; // The ID of the issue associated with the comment.
    synced_at?: string; // The date and time the comment was synced with BIM 360, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    updated_at?: string; // The last time the comment’s attributes were updated, in the following format: YYYY-MM-DDThh:mm:ss.sz.
}

interface IIssueAttachment {
    id: string;

    created_at?: string; // The timestamp of the date and time the attachment was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    synced_at?: string; // The date and time the attachment was synced with BIM 360, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    updated_at?: string; // The last time the attachment’s attributes were updated, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    attachment_type?: string; // The type of attachment; will always be document.
    created_by?: string; // The BIM 360 ID of the user who created the attachment.
    issue_id?: string; // The BIM 360 ID of the issue associated with the attachment.
    markup_metadata?: object;
    name?: string; // The name of the attachment.
    resource_urns?: any[];
    url?: string; // The URL of the storage location for the attachment.
    urn?: string; // The URN of the file that is attached to the issue.
    urn_page?: string; // The URN of the page that is attached to the issue. The default is null.
    urn_type?: string; // The type of attachment. Possible values: dm - a BIM 360 Document Management file, oss - a local file.
    urn_version?: number; // The URN of the version of the file that is attached to the issue.
    permitted_actions?: any[]; // A list of actions that are permitted for the current user.
}

interface INewIssueAttachment {
    name: string; // The name of the attachment.
    urn: string; // The URN of the file you are attaching to the issue.
    urn_type: string; // The type of attachment. Possible value: dm.
    issue_id: string; // The ID of the issue associated with the attachment.
}

interface IIssueRootCause {
    key: string; // The unique key of the root cause.
    title: string; // The name of the root cause.
}

interface IIssueType {
    id: string; // The ID of the issue type for the project.
    containerId?: string; // The ID of the container for the project.
    title?: string; // The name of the issue type.
    createdAt?: string; // The timestamp of the date and time the issue type was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    updatedAt?: string; // The last time the issue type was updated, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    deletedAt?: string; // The timestamp of the date and time the issue type was deleted, in the following format: YYYY-MM-DDThh:mm:ss.sz.
    statusSet?: string; // The set of statuses available for the issue. Possible values: basic (Draft, Open Answered, Closed, Void), field (Draft, Open, Work completed, Ready to inspect, Not approved, In dispute, Closed, Void).
    isActive?: boolean; // True if the issue type is active. False if the issue type is not active.
    orderIndex?: number; // The order the issue type appears in the UI.
    isReadOnly?: boolean; // True if the issue type is read only. False if you can edit the issue type.
    permittedActions?: any[]; // A list of actions that are permitted for the issue type.
    permittedAttributes?: any[]; // A list of attributes accessible for the issue type.
    subtypes?: any[]; // An array of data about the issue subtypes associated with the issue type.
}

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
export class BIM360Client extends ForgeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(auth: IAuthOptions, host?: string, region?: Region) {
        super('', auth, host, region);
    }

    // Hub APIs

    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<IHub[]>} List of hubs.
     */
    async hubs(): Promise<IHub[]> {
        const response = await this.get(`project/v1/hubs`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<IHub>} Hub or null if there isn't one.
     */
    async hub(id: string): Promise<IHub> {
        const response = await this.get(`project/v1/hubs/${id}`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<IProject[]>} List of projects.
     */
    async projects(hub: string): Promise<IProject[]> {
        const response = await this.get(`project/v1/hubs/${hub}/projects`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets a list of top folders in a project.
     * @param {string} hub Hub ID.
     * @param {string} project Project ID.
     * @async
     * @returns {Promise<IFolder[]>} List of folder records.
     */
    async folders(hub: string, project: string): Promise<IFolder[]> {
        const response = await this.get(`project/v1/hubs/${hub}/projects/${project}/topFolders`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets contents of a folder.
     * @param {string} project Project ID.
     * @param {string} folder Folder ID.
     * @async
     * @returns {Promise<IItem[]>} List of folder contents.
     */
    async contents(project: string, folder: string): Promise<IItem[]> {
        const response = await this.get(`data/v1/projects/${project}/folders/${folder}/contents`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets versions of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<IVersion[]>} List of item versions.
     */
    async versions(project: string, item: string): Promise<IVersion[]> {
        const response = await this.get(`data/v1/projects/${project}/items/${item}/versions`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets specific version of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @param {string} id Version ID.
     * @async
     * @returns {Promise<IVersion>} Specific version of folder item.
     */
    async version(project: string, item: string, id: string): Promise<IVersion> {
        const response = await this.get(`data/v1/projects/${project}/items/${item}/versions/${id}`, {}, ReadTokenScopes);
        return response.data;
    }

    /**
     * Gets "tip" version of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<IVersion>} Tip version of the item.
     */
    async tip(project: string, item: string): Promise<IVersion> {
        const response = await this.get(`data/v1/projects/${project}/items/${item}/tip`, {}, ReadTokenScopes);
        return response.data;
    }

    // #region Issues

    /**
     * Lists all issues in a BIM360 project.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @returns {Promise<IIssue[]>} List of all issues.
     */
    async listIssues(containerId: string): Promise<IIssue[]> {
        // TODO: support 'filter', 'include', and 'fields' params
        const pageSize = 50;
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        let response = await this.get(`issues/v1/containers/${containerId}/quality-issues?page[limit]=${pageSize}`, headers, ReadTokenScopes);
        let results = response.data;
        while (response.links && response.links.next) {
            response = await this.get(response.links.next, headers, ReadTokenScopes);
            results = results.concat(response.data);
        }
        return results.map((result: any) => Object.assign(result.attributes, { id: result.id }));
    }

    /**
     * Obtains detail information about BIM360 issue.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-:id-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {string} issueId Issue ID.
     * @returns {Promise<IIssue>} Issue details.
    */
    async getIssueDetails(containerId: string, issueId: string): Promise<IIssue> {
        // TODO: support 'include', and 'fields' params
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        const response = await this.get(`issues/v1/containers/${containerId}/quality-issues/${issueId}`, headers, ReadTokenScopes);
        return Object.assign(response.data.attributes, { id: response.data.id });
    }

    /**
     * Creates new BIM360 issue.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-POST}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {INewIssue} attributes New issue attributes.
     * @returns {Promise<IIssue>} New issue details.
     */
    async createIssue(containerId: string, attributes: INewIssue): Promise<IIssue> {
        // TODO: support 'fields' param
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        const params = {
            data: {
                type: 'quality_issues',
                attributes
            }
        };
        const response = await this.post(`issues/v1/containers/${containerId}/quality-issues`, params, headers, WriteTokenScopes);
        return Object.assign(response.data.attributes, { id: response.data.id });
    }

    /**
     * Updates existing BIM360 issue.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-:id-PATCH}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {string} issueId ID of updated issue.
     * @param {IUpdateIssue} attributes Issue attributes to update.
     * @returns {Promise<IIssue>} Updated issue details.
     */
    async updateIssue(containerId: string, issueId: string, attributes: IUpdateIssue): Promise<IIssue> {
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        const params = {
            data: {
                type: 'quality_issues',
                id: issueId,
                attributes
            }
        };
        const response = await this.patch(`issues/v1/containers/${containerId}/quality-issues/${issueId}`, params, headers, WriteTokenScopes);
        return Object.assign(response.data.attributes, { id: response.data.id });
    }

    /**
     * Lists all comments associated with a BIM360 issue.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-:id-comments-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {string} issueId Issue ID.
     * @returns {Promise<IIssueComment[]>} Issue comments.
     */
    async listIssueComments(containerId: string, issueId: string): Promise<IIssueComment[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 50;
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        let response = await this.get(`issues/v1/containers/${containerId}/quality-issues/${issueId}/comments?page[limit]=${pageSize}`, headers, ReadTokenScopes);
        let results = response.data;
        while (response.links && response.links.next) {
            response = await this.get(response.links.next, headers, ReadTokenScopes);
            results = results.concat(response.data);
        }
        return results.map((result: any) => Object.assign(result.attributes, { id: result.id }));
    }

    /**
     * Creates new comment associated with a BIM360 issue.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-comments-POST}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {string} issueId Issue ID.
     * @returns {Promise<IIssueComment>} New issue comment.
     */
    async createIssueComment(containerId: string, issueId: string, body: string): Promise<IIssueComment> {
        // TODO: support 'fields' param
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        const params = {
            data: {
                type: 'comments',
                attributes: {
                    issue_id: issueId,
                    body
                }
            }
        };
        const response = await this.post(`issues/v1/containers/${containerId}/comments`, params, headers, WriteTokenScopes);
        return Object.assign(response.data.attributes, { id: response.data.id });
    }

    /**
     * Lists all attachments associated with a BIM360 issue.
     * Requires 3-legged token.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-attachments-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @param {string} issueId Issue ID.
     * @returns {Promise<IIssueAttachment[]>} Issue attachments.
     */
    async listIssueAttachments(containerId: string, issueId: string): Promise<IIssueAttachment[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 50;
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        let response = await this.get(`issues/v1/containers/${containerId}/quality-issues/${issueId}/attachments?page[limit]=${pageSize}`, headers, ReadTokenScopes);
        let results = response.data;
        while (response.links && response.links.next) {
            response = await this.get(response.links.next, headers, ReadTokenScopes);
            results = results.concat(response.data);
        }
        return results.map((result: any) => Object.assign(result.attributes, { id: result.id }));
    }

    /**
     * Creates new attachment associated with a BIM360 issue.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/field-issues-attachments-POST}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @returns {Promise<IIssueAttachment>} New issue attachment.
     */
    async createIssueAttachment(containerId: string, attributes: INewIssueAttachment): Promise<IIssueAttachment> {
        // TODO: support 'fields' param
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        const params = {
            data: {
                type: 'attachments',
                attributes
            }
        };
        const response = await this.post(`issues/v1/containers/${containerId}/attachments`, params, headers, WriteTokenScopes);
        return Object.assign(response.data.attributes, { id: response.data.id });
    }

    /**
     * Retrieves a list of supported root causes that you can allocate to an issue.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/root-causes-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @returns {Promise<IIssueRootCause[]>} Issue root causes.
     */
    async listIssueRootCauses(containerId: string): Promise<IIssueRootCause[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 50;
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        let response = await this.get(`issues/v1/containers/${containerId}/root-causes?page[limit]=${pageSize}`, headers, ReadTokenScopes);
        let results = response.data;
        return results.map((result: any) => Object.assign(result.attributes, { id: result.id }));
    }

    /**
     * Lists issue types in specific container.
     * {@link https://forge.autodesk.com/en/docs/bim360/v1/reference/http/ng-issue-types-GET}.
     * @async
     * @param {string} containerId ID of container storing all issues for a specific projects.
     * @returns {Promise<IIssueType[]>} List of issues types.
     */
    async listIssueTypes(containerId: string, includeSubtypes?: boolean): Promise<IIssueType[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 5;
        const headers = { 'Content-Type': 'application/vnd.api+json' };
        let response = await this.get(`issues/v1/containers/${containerId}/ng-issue-types?limit=${pageSize}${includeSubtypes ? '&include=subtypes' : ''}`, headers, ReadTokenScopes);
        let results = response.results;
        while (response.pagination && response.pagination.offset + response.pagination.limit < response.pagination.totalResults) {
            response = await this.get(`issues/v1/containers/${containerId}/ng-issue-types?offset=${response.pagination.offset + response.pagination.limit}&limit=${pageSize}${includeSubtypes ? '&include=subtypes' : ''}`, headers, ReadTokenScopes);
            results = results.concat(response.results);
        }
        return results;
    }

    async listIssueAttributeDefinitions(containerId: string): Promise<any[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 5;
        const headers = {};
        let response = await this.get(`issues/v2/containers/${containerId}/issue-attribute-definitions?limit=${pageSize}`, headers, ReadTokenScopes);
        let results = response.results;
        while (response.pagination && response.pagination.offset + response.pagination.limit < response.pagination.totalResults) {
            response = await this.get(`issues/v2/containers/${containerId}/issue-attribute-definitions?offset=${response.pagination.offset + response.pagination.limit}&limit=${pageSize}`, headers, ReadTokenScopes);
            results = results.concat(response.results);
        }
        return results;
    }

    async listIssueAttributeMappings(containerId: string): Promise<any[]> {
        // TODO: support 'filter', 'include', or 'fields' params
        const pageSize = 5;
        const headers = {};
        let response = await this.get(`issues/v2/containers/${containerId}/issue-attribute-mappings?limit=${pageSize}`, headers, ReadTokenScopes);
        let results = response.results;
        while (response.pagination && response.pagination.offset + response.pagination.limit < response.pagination.totalResults) {
            response = await this.get(`issues/v2/containers/${containerId}/issue-attribute-mappings?offset=${response.pagination.offset + response.pagination.limit}&limit=${pageSize}`, headers, ReadTokenScopes);
            results = results.concat(response.results);
        }
        return results;
    }

    // #endregion
}
