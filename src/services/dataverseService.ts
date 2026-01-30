import { dataverseConfig } from "../auth/msalConfig";
import { Account, Customer, HighValueActivity, ActionItem, Impact } from "../types";

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
    "/accounts?$select=accountid,name&$orderby=name asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createAccount(
  account: Omit<Account, "accountid">
): Promise<Account> {
  return apiRequest("/accounts", "POST", account);
}

export async function updateAccount(
  id: string,
  account: Partial<Account>
): Promise<Account> {
  return apiRequest(`/accounts(${id})`, "PATCH", account);
}

export async function deleteAccount(id: string): Promise<void> {
  await apiRequest(`/accounts(${id})`, "DELETE");
}

// ─── Customers (Contact entity) ──────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  // TODO: Adjust $select fields to match actual Dataverse schema
  const result = await apiRequest(
    "/contacts?$select=contactid,firstname,lastname,emailaddress1,telephone1,jobtitle&$orderby=lastname asc&$top=100"
  );
  return result?.value ?? [];
}

export async function createCustomer(
  customer: Omit<Customer, "contactid">
): Promise<Customer> {
  return apiRequest("/contacts", "POST", customer);
}

export async function updateCustomer(
  id: string,
  customer: Partial<Customer>
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
    "/tdvsp_actionitems?$select=tdvsp_actionitemid,tdvsp_name,tdvsp_date,_tdvsp_customer_value&$expand=tdvsp_Customer($select=accountid,name)&$orderby=tdvsp_date desc&$top=100"
  );
  return result?.value ?? [];
}

export async function createActionItem(
  item: {
    tdvsp_name: string;
    tdvsp_date: string;
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
