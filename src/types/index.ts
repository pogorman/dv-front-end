// Account entity
export interface Account {
  accountid?: string;
  name: string;
  // Parent account lookup
  _parentaccountid_value?: string;
  parentaccountid?: { accountid: string; name: string };
}

// Contact / Customer entity
export interface Customer {
  contactid?: string;
  firstname: string;
  lastname: string;
  emailaddress1: string;
  telephone1: string;
  jobtitle: string;
  // Lookup to account table (parentcustomerid)
  _parentcustomerid_value?: string;
  parentcustomerid_account?: { accountid: string; name: string };
}

// High-Value Activity entity (tdvsp_hva table)
export interface HighValueActivity {
  tdvsp_hvaid?: string;
  tdvsp_name: string;
  tdvsp_description: string;
  tdvsp_date: string;
  // Lookup to account table
  _tdvsp_customer_value?: string;
  tdvsp_Customer?: { accountid: string; name: string };
}

// Task Status choice field (on Action Items)
export type TaskStatus =
  | 468510000 // Recognized/Pondering
  | 468510001 // In Progress
  | 468510002 // Pending Communication
  | 468510003 // On Hold
  | 468510004 // Wrapping Up
  | 468510005; // Complete

export const taskStatusLabels: Record<TaskStatus, string> = {
  468510000: "Recognized/Pondering",
  468510001: "In Progress",
  468510002: "Pending Communication",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

// Task Priority choice field (on Action Items)
export type TaskPriority =
  | 468510000 // Low... but on deck for sure
  | 468510001 // Eh... Get to it when you can
  | 468510002 // Top priority... no kidding!
  | 468510003; // High... next in line after top priority...

export const taskPriorityLabels: Record<TaskPriority, string> = {
  468510000: "Low... but on deck for sure",
  468510001: "Eh... Get to it when you can",
  468510002: "Top priority... no kidding!",
  468510003: "High... next in line after top priority...",
};

// Task Type choice field (on Action Items)
export type TaskType =
  | 468510000 // Personal
  | 468510001; // Work

export const taskTypeLabels: Record<TaskType, string> = {
  468510000: "Personal",
  468510001: "Work",
};

// Action Item entity (tdvsp_actionitem table)
export interface ActionItem {
  tdvsp_actionitemid?: string;
  tdvsp_name: string;
  tdvsp_date: string;
  tdvsp_description?: string;
  tdvsp_taskstatus?: TaskStatus;
  tdvsp_priority?: TaskPriority;
  tdvsp_tasktype?: TaskType;
  createdon?: string;
  _tdvsp_customer_value?: string;
  tdvsp_Customer?: { accountid: string; name: string };
}

// Impact entity (tdvsp_impact table)
export interface Impact {
  tdvsp_impactid?: string;
  tdvsp_name: string;
  tdvsp_date: string;
  tdvsp_description: string;
  _tdvsp_customer_value?: string;
  tdvsp_Customer?: { accountid: string; name: string };
}

// Annotation entity (notes table)
export interface Annotation {
  annotationid?: string;
  subject?: string;
  notetext: string;
  createdon?: string;
  _objectid_value?: string;
  // File attachment fields
  filename?: string;
  mimetype?: string;
  filesize?: number;
  isdocument?: boolean;
  documentbody?: string; // base64 - only fetched on demand
}

// Entity type for pinned notes
export type NoteEntityType = "account" | "project" | "actionitem" | "idea";

// Idea entity (tdvsp_idea table)
export type IdeaCategory =
  | 468510000 // Copilot Studio
  | 468510001 // Canvas Apps
  | 468510002 // Model-Driven Apps
  | 468510003 // Power Automate
  | 468510004 // Power Pages
  | 468510005 // Azure
  | 468510006 // AI General
  | 468510007 // App General
  | 468510008; // Other

export const ideaCategoryLabels: Record<IdeaCategory, string> = {
  468510000: "Copilot Studio",
  468510001: "Canvas Apps",
  468510002: "Model-Driven Apps",
  468510003: "Power Automate",
  468510004: "Power Pages",
  468510005: "Azure",
  468510006: "AI General",
  468510007: "App General",
  468510008: "Other",
};

export interface Idea {
  tdvsp_ideaid?: string;
  tdvsp_name: string;
  tdvsp_description?: string;
  tdvsp_category?: IdeaCategory;
  createdon?: string;
  // Lookup to account table
  _tdvsp_account_value?: string;
  tdvsp_Account?: { accountid: string; name: string };
  // Lookup to contact table
  _tdvsp_contact_value?: string;
  tdvsp_Contact?: { contactid: string; firstname: string; lastname: string };
}

// Meeting Summary entity (tdvsp_meetingsummary table)
export interface MeetingSummary {
  tdvsp_meetingsummaryid?: string;
  tdvsp_name: string;
  tdvsp_date?: string;
  tdvsp_summary?: string;
  // Lookup to account table
  _tdvsp_account_value?: string;
  tdvsp_Account?: { accountid: string; name: string };
}

// Project entity (tdvsp_project table)
export interface Project {
  tdvsp_projectid?: string;
  tdvsp_name: string;
  tdvsp_description?: string;
  // Lookup to account table
  _tdvsp_account_value?: string;
  tdvsp_Account?: { accountid: string; name: string };
}
