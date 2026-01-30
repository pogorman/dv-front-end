import { dataverseConfig } from "../auth/msalConfig";
import { Customer, HighValueActivity, TaskItem } from "../types";

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

// ─── High-Value Activities ───────────────────────────────────────────────────
// TODO: Replace with actual Dataverse entity name and field mappings

export async function getActivities(): Promise<HighValueActivity[]> {
  // STUB: Replace endpoint and fields with actual Dataverse entity
  // Example: /cr_highvalueactivities?$select=...
  console.warn("getActivities: Using stub data — wire up Dataverse entity");
  return STUB_ACTIVITIES;
}

export async function createActivity(
  activity: Omit<HighValueActivity, "id">
): Promise<HighValueActivity> {
  // STUB: Replace with actual API call
  console.warn("createActivity: Using stub — wire up Dataverse entity");
  return { ...activity, id: crypto.randomUUID() };
}

export async function updateActivity(
  id: string,
  activity: Partial<HighValueActivity>
): Promise<HighValueActivity> {
  console.warn("updateActivity: Using stub — wire up Dataverse entity");
  return { id, ...activity } as HighValueActivity;
}

export async function deleteActivity(id: string): Promise<void> {
  console.warn("deleteActivity: Using stub — wire up Dataverse entity");
}

// ─── Tasks / Action Items ────────────────────────────────────────────────────
// TODO: Replace with actual Dataverse entity name and field mappings

export async function getTasks(): Promise<TaskItem[]> {
  console.warn("getTasks: Using stub data — wire up Dataverse entity");
  return STUB_TASKS;
}

export async function createTask(
  task: Omit<TaskItem, "id">
): Promise<TaskItem> {
  console.warn("createTask: Using stub — wire up Dataverse entity");
  return { ...task, id: crypto.randomUUID() };
}

export async function updateTask(
  id: string,
  task: Partial<TaskItem>
): Promise<TaskItem> {
  console.warn("updateTask: Using stub — wire up Dataverse entity");
  return { id, ...task } as TaskItem;
}

export async function deleteTask(id: string): Promise<void> {
  console.warn("deleteTask: Using stub — wire up Dataverse entity");
}

// ─── Stub data for development ───────────────────────────────────────────────

const STUB_ACTIVITIES: HighValueActivity[] = [
  {
    id: "1",
    activitytype: "Demo",
    subject: "Product Demo for Contoso",
    description: "Full platform demo including analytics module",
    customername: "Jane Smith",
    scheduleddate: "2026-02-15",
    status: "Scheduled",
  },
  {
    id: "2",
    activitytype: "Presentation",
    subject: "Q1 Strategy Presentation",
    description: "Executive briefing on Q1 roadmap",
    customername: "John Doe",
    scheduleddate: "2026-02-10",
    status: "Completed",
  },
  {
    id: "3",
    activitytype: "Workshop",
    subject: "Integration Workshop",
    description: "Hands-on workshop for API integrations",
    customername: "Acme Corp",
    scheduleddate: "2026-02-20",
    status: "Scheduled",
  },
];

const STUB_TASKS: TaskItem[] = [
  {
    id: "1",
    title: "Follow up with Contoso",
    description: "Send proposal after demo",
    duedate: "2026-02-05",
    priority: "High",
    status: "In Progress",
    assignedto: "Me",
    relatedcustomer: "Jane Smith",
  },
  {
    id: "2",
    title: "Prepare workshop materials",
    description: "Create hands-on lab guide for integration workshop",
    duedate: "2026-02-18",
    priority: "Medium",
    status: "Not Started",
    assignedto: "Me",
  },
  {
    id: "3",
    title: "Update CRM records",
    description: "Ensure all Q1 contacts are up to date",
    duedate: "2026-02-01",
    priority: "Low",
    status: "Not Started",
    assignedto: "Me",
  },
  {
    id: "4",
    title: "Schedule executive briefing",
    description: "Coordinate with leadership for Fabrikam briefing",
    duedate: "2026-02-12",
    priority: "High",
    status: "Not Started",
    assignedto: "Me",
    relatedcustomer: "John Doe",
  },
];
