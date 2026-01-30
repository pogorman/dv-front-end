// Contact / Customer entity
export interface Customer {
  contactid?: string;
  firstname: string;
  lastname: string;
  emailaddress1: string;
  telephone1: string;
  jobtitle: string;
  // Add more Dataverse contact fields as needed
}

// High-Value Activity entity
// TODO: Map to actual Dataverse entity/fields once confirmed
export interface HighValueActivity {
  id?: string;
  activitytype: string;
  subject: string;
  description: string;
  customername: string;
  customerid?: string;
  scheduleddate: string;
  status: string;
}

// Task / Action Item entity
// TODO: Map to actual Dataverse entity/fields once confirmed
export interface TaskItem {
  id?: string;
  title: string;
  description: string;
  duedate: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
  assignedto: string;
  relatedcustomer?: string;
}

export const ACTIVITY_TYPES = [
  "Demo",
  "Presentation",
  "Workshop",
  "Executive Briefing",
  "Proof of Concept",
  "Architecture Review",
  "Training",
  "Other",
];

export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;
export const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
] as const;
