import { dataverseConfig } from "../auth/msalConfig";
import { Account, Customer, HighValueActivity, ActionItem, Impact, Annotation, Idea, IdeaCategory, MeetingSummary, Project } from "../types";

let getAccessToken: (() => Promise<string>) | null = null;

export function setTokenProvider(provider: () => Promise<string>) {
  getAccessToken = provider;
}

async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: unknown
) {
  if (!getAccessToken) {
    throw new Error("Token provider not set. Call setTokenProvider first.");
  }

  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (method === "POST" || method === "PATCH") {
    headers["Prefer"] = "return=representation";
  }

  const response = await fetch(`${dataverseConfig.baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dataverse API error ${response.status}: ${errorText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ─── Accounts (Account entity) ───────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const result = await apiRequest(
    "/accounts?$select=accountid,name,_parentaccountid_value&$expand=parentaccountid($select=accountid,name)&$orderby=name asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createAccount(
  account: {
    name: string;
    "parentaccountid@odata.bind"?: string | null;
  }
): Promise<Account> {
  return apiRequest("/accounts", "POST", account);
}

export async function updateAccount(
  id: string,
  account: {
    name?: string;
    "parentaccountid@odata.bind"?: string | null;
  }
): Promise<Account> {
  return apiRequest(`/accounts(${id})`, "PATCH", account);
}

export async function deleteAccount(id: string): Promise<void> {
  await apiRequest(`/accounts(${id})`, "DELETE");
}

// ─── Customers (Contact entity) ──────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const result = await apiRequest(
    "/contacts?$select=contactid,firstname,lastname,emailaddress1,telephone1,jobtitle,_parentcustomerid_value&$expand=parentcustomerid_account($select=accountid,name)&$orderby=lastname asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createCustomer(
  customer: {
    firstname: string;
    lastname: string;
    emailaddress1: string;
    telephone1: string;
    jobtitle: string;
    "parentcustomerid_account@odata.bind"?: string;
  }
): Promise<Customer> {
  return apiRequest("/contacts", "POST", customer);
}

export async function updateCustomer(
  id: string,
  customer: {
    firstname?: string;
    lastname?: string;
    emailaddress1?: string;
    telephone1?: string;
    jobtitle?: string;
    "parentcustomerid_account@odata.bind"?: string;
  }
): Promise<Customer> {
  return apiRequest(`/contacts(${id})`, "PATCH", customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiRequest(`/contacts(${id})`, "DELETE");
}

// ─── High-Value Activities (tdvsp_hva table) ────────────────────────────────

export async function getActivities(): Promise<HighValueActivity[]> {
  const result = await apiRequest(
    "/tdvsp_hvas?$select=tdvsp_hvaid,tdvsp_name,tdvsp_description,tdvsp_date,_tdvsp_customer_value&$expand=tdvsp_Customer($select=accountid,name)&$orderby=tdvsp_date desc&$top=100"
  );
  return result?.value ?? [];
}

export async function createActivity(
  activity: {
    tdvsp_name: string;
    tdvsp_description: string;
    tdvsp_date: string;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<HighValueActivity> {
  return apiRequest("/tdvsp_hvas", "POST", activity);
}

export async function updateActivity(
  id: string,
  activity: {
    tdvsp_name?: string;
    tdvsp_description?: string;
    tdvsp_date?: string;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<HighValueActivity> {
  return apiRequest(`/tdvsp_hvas(${id})`, "PATCH", activity);
}

export async function deleteActivity(id: string): Promise<void> {
  await apiRequest(`/tdvsp_hvas(${id})`, "DELETE");
}

// ─── Action Items (tdvsp_actionitem table) ──────────────────────────────────

export async function getActionItems(): Promise<ActionItem[]> {
  const result = await apiRequest(
    "/tdvsp_actionitems?$select=tdvsp_actionitemid,tdvsp_name,tdvsp_date,tdvsp_description,tdvsp_taskstatus,tdvsp_taskpriority,createdon,_tdvsp_customer_value&$expand=tdvsp_Customer($select=accountid,name)&$orderby=tdvsp_date desc&$top=100"
  );
  return result?.value ?? [];
}

export async function createActionItem(
  item: {
    tdvsp_name: string;
    tdvsp_date: string;
    tdvsp_description?: string;
    tdvsp_taskstatus?: number;
    tdvsp_taskpriority?: number;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<ActionItem> {
  return apiRequest("/tdvsp_actionitems", "POST", item);
}

export async function updateActionItem(
  id: string,
  item: {
    tdvsp_name?: string;
    tdvsp_date?: string;
    tdvsp_description?: string;
    tdvsp_taskstatus?: number;
    tdvsp_taskpriority?: number;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<ActionItem> {
  return apiRequest(`/tdvsp_actionitems(${id})`, "PATCH", item);
}

export async function deleteActionItem(id: string): Promise<void> {
  await apiRequest(`/tdvsp_actionitems(${id})`, "DELETE");
}

// ─── Impacts (tdvsp_impact table) ───────────────────────────────────────────

export async function getImpacts(): Promise<Impact[]> {
  const result = await apiRequest(
    "/tdvsp_impacts?$select=tdvsp_impactid,tdvsp_name,tdvsp_date,tdvsp_description,_tdvsp_customer_value&$expand=tdvsp_Customer($select=accountid,name)&$orderby=tdvsp_date desc&$top=100"
  );
  return result?.value ?? [];
}

export async function createImpact(
  impact: {
    tdvsp_name: string;
    tdvsp_date: string;
    tdvsp_description: string;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<Impact> {
  return apiRequest("/tdvsp_impacts", "POST", impact);
}

export async function updateImpact(
  id: string,
  impact: {
    tdvsp_name?: string;
    tdvsp_date?: string;
    tdvsp_description?: string;
    "tdvsp_Customer@odata.bind"?: string;
  }
): Promise<Impact> {
  return apiRequest(`/tdvsp_impacts(${id})`, "PATCH", impact);
}

export async function deleteImpact(id: string): Promise<void> {
  await apiRequest(`/tdvsp_impacts(${id})`, "DELETE");
}

// ─── Annotations (Notes) ─────────────────────────────────────────────────────

// Generic annotation retrieval by objectid (works for any entity)
export async function getAnnotations(objectId: string): Promise<Annotation[]> {
  const result = await apiRequest(
    `/annotations?$select=annotationid,subject,notetext,createdon,_objectid_value,filename,mimetype,filesize,isdocument&$filter=_objectid_value eq ${objectId}&$orderby=createdon desc&$top=50`
  );
  return result?.value ?? [];
}

// Legacy function for backward compatibility
export async function getAccountAnnotations(accountId: string): Promise<Annotation[]> {
  return getAnnotations(accountId);
}

// Generic annotation creation with polymorphic objectid binding
export async function createEntityAnnotation(
  annotation: {
    subject?: string;
    notetext: string;
    filename?: string;
    mimetype?: string;
    documentbody?: string;
    isdocument?: boolean;
    [key: string]: unknown; // for the objectid_xxx@odata.bind field
  }
): Promise<Annotation> {
  return apiRequest("/annotations", "POST", annotation);
}

// Legacy function for backward compatibility (accounts only)
export async function createAnnotation(
  annotation: {
    subject?: string;
    notetext: string;
    "objectid_account@odata.bind": string;
  }
): Promise<Annotation> {
  return apiRequest("/annotations", "POST", annotation);
}

export async function deleteAnnotation(id: string): Promise<void> {
  await apiRequest(`/annotations(${id})`, "DELETE");
}

// Fetch a single annotation WITH documentbody for download
export async function getAnnotationWithBody(annotationId: string): Promise<Annotation> {
  return apiRequest(
    `/annotations(${annotationId})?$select=annotationid,filename,mimetype,documentbody`
  );
}

export async function getAnnotationsByIds(ids: string[]): Promise<Annotation[]> {
  if (ids.length === 0) return [];
  const filter = ids.map((id) => `annotationid eq ${id}`).join(" or ");
  const result = await apiRequest(
    `/annotations?$select=annotationid,subject,notetext,createdon,_objectid_value,filename,mimetype,filesize,isdocument&$filter=${filter}`
  );
  return result?.value ?? [];
}

// ─── Ideas (tdvsp_idea table) ─────────────────────────────────────────────────

export async function getIdeas(): Promise<Idea[]> {
  const result = await apiRequest(
    "/tdvsp_ideas?$select=tdvsp_ideaid,tdvsp_name,tdvsp_description,tdvsp_category,_tdvsp_account_value,_tdvsp_contact_value&$expand=tdvsp_Account($select=accountid,name),tdvsp_Contact($select=contactid,firstname,lastname)&$orderby=tdvsp_name asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createIdea(
  idea: {
    tdvsp_name: string;
    tdvsp_description?: string;
    tdvsp_category?: IdeaCategory;
    "tdvsp_Account@odata.bind"?: string;
    "tdvsp_Contact@odata.bind"?: string;
  }
): Promise<Idea> {
  return apiRequest("/tdvsp_ideas", "POST", idea);
}

export async function updateIdea(
  id: string,
  idea: {
    tdvsp_name?: string;
    tdvsp_description?: string;
    tdvsp_category?: IdeaCategory;
    "tdvsp_Account@odata.bind"?: string;
    "tdvsp_Contact@odata.bind"?: string;
  }
): Promise<Idea> {
  return apiRequest(`/tdvsp_ideas(${id})`, "PATCH", idea);
}

export async function deleteIdea(id: string): Promise<void> {
  await apiRequest(`/tdvsp_ideas(${id})`, "DELETE");
}

// ─── Related Records for Account ──────────────────────────────────────────────

export async function getContactsByAccount(accountId: string): Promise<Customer[]> {
  const result = await apiRequest(
    `/contacts?$select=contactid,firstname,lastname,emailaddress1,telephone1,jobtitle&$filter=_parentcustomerid_value eq ${accountId}&$orderby=lastname asc`
  );
  return result?.value ?? [];
}

export async function getActivitiesByAccount(accountId: string): Promise<HighValueActivity[]> {
  const result = await apiRequest(
    `/tdvsp_hvas?$select=tdvsp_hvaid,tdvsp_name,tdvsp_description,tdvsp_date&$filter=_tdvsp_customer_value eq ${accountId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getActionItemsByAccount(accountId: string): Promise<ActionItem[]> {
  const result = await apiRequest(
    `/tdvsp_actionitems?$select=tdvsp_actionitemid,tdvsp_name,tdvsp_date,tdvsp_description&$filter=_tdvsp_customer_value eq ${accountId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getImpactsByAccount(accountId: string): Promise<Impact[]> {
  const result = await apiRequest(
    `/tdvsp_impacts?$select=tdvsp_impactid,tdvsp_name,tdvsp_date,tdvsp_description&$filter=_tdvsp_customer_value eq ${accountId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getIdeasByAccount(accountId: string): Promise<Idea[]> {
  const result = await apiRequest(
    `/tdvsp_ideas?$select=tdvsp_ideaid,tdvsp_name,tdvsp_description,tdvsp_category&$filter=_tdvsp_account_value eq ${accountId}&$orderby=tdvsp_name asc`
  );
  return result?.value ?? [];
}

export async function getMeetingSummariesByAccount(accountId: string): Promise<MeetingSummary[]> {
  const result = await apiRequest(
    `/tdvsp_meetingsummaries?$select=tdvsp_meetingsummaryid,tdvsp_name,tdvsp_date&$filter=_tdvsp_account_value eq ${accountId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

// ─── Related Records for Contact ──────────────────────────────────────────────

export async function getActivitiesByContact(contactId: string): Promise<HighValueActivity[]> {
  const result = await apiRequest(
    `/tdvsp_hvas?$select=tdvsp_hvaid,tdvsp_name,tdvsp_description,tdvsp_date&$filter=_tdvsp_contact_value eq ${contactId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getActionItemsByContact(contactId: string): Promise<ActionItem[]> {
  const result = await apiRequest(
    `/tdvsp_actionitems?$select=tdvsp_actionitemid,tdvsp_name,tdvsp_date,tdvsp_description&$filter=_tdvsp_contact_value eq ${contactId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getImpactsByContact(contactId: string): Promise<Impact[]> {
  const result = await apiRequest(
    `/tdvsp_impacts?$select=tdvsp_impactid,tdvsp_name,tdvsp_date,tdvsp_description&$filter=_tdvsp_contact_value eq ${contactId}&$orderby=tdvsp_date desc`
  );
  return result?.value ?? [];
}

export async function getIdeasByContact(contactId: string): Promise<Idea[]> {
  const result = await apiRequest(
    `/tdvsp_ideas?$select=tdvsp_ideaid,tdvsp_name,tdvsp_description,tdvsp_category&$filter=_tdvsp_contact_value eq ${contactId}&$orderby=tdvsp_name asc`
  );
  return result?.value ?? [];
}

// ─── Meeting Summaries (tdvsp_meetingsummary table) ───────────────────────────

export async function getMeetingSummaries(): Promise<MeetingSummary[]> {
  const result = await apiRequest(
    "/tdvsp_meetingsummaries?$select=tdvsp_meetingsummaryid,tdvsp_name,tdvsp_date,tdvsp_summary,_tdvsp_account_value&$expand=tdvsp_Account($select=accountid,name)&$orderby=tdvsp_date desc&$top=100"
  );
  return result?.value ?? [];
}

export async function createMeetingSummary(
  summary: {
    tdvsp_name: string;
    tdvsp_date?: string;
    tdvsp_summary?: string;
    "tdvsp_Account@odata.bind"?: string;
  }
): Promise<MeetingSummary> {
  return apiRequest("/tdvsp_meetingsummaries", "POST", summary);
}

export async function updateMeetingSummary(
  id: string,
  summary: {
    tdvsp_name?: string;
    tdvsp_date?: string;
    tdvsp_summary?: string;
    "tdvsp_Account@odata.bind"?: string;
  }
): Promise<MeetingSummary> {
  return apiRequest(`/tdvsp_meetingsummaries(${id})`, "PATCH", summary);
}

export async function deleteMeetingSummary(id: string): Promise<void> {
  await apiRequest(`/tdvsp_meetingsummaries(${id})`, "DELETE");
}

// ─── Projects (tdvsp_project table) ────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const result = await apiRequest(
    "/tdvsp_projects?$select=tdvsp_projectid,tdvsp_name,tdvsp_description,_tdvsp_account_value&$expand=tdvsp_Account($select=accountid,name)&$orderby=tdvsp_name asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createProject(
  project: {
    tdvsp_name: string;
    tdvsp_description?: string;
    "tdvsp_Account@odata.bind"?: string;
  }
): Promise<Project> {
  return apiRequest("/tdvsp_projects", "POST", project);
}

export async function updateProject(
  id: string,
  project: {
    tdvsp_name?: string;
    tdvsp_description?: string;
    "tdvsp_Account@odata.bind"?: string;
  }
): Promise<Project> {
  return apiRequest(`/tdvsp_projects(${id})`, "PATCH", project);
}

export async function deleteProject(id: string): Promise<void> {
  await apiRequest(`/tdvsp_projects(${id})`, "DELETE");
}

export async function getProjectsByAccount(accountId: string): Promise<Project[]> {
  const result = await apiRequest(
    `/tdvsp_projects?$select=tdvsp_projectid,tdvsp_name,tdvsp_description&$filter=_tdvsp_account_value eq ${accountId}&$orderby=tdvsp_name asc`
  );
  return result?.value ?? [];
}
