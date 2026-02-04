// Account entity
export interface Account {
  accountid?: string;
  name: string;
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

// Action Item entity (tdvsp_actionitem table)
export interface ActionItem {
  tdvsp_actionitemid?: string;
  tdvsp_name: string;
  tdvsp_date: string;
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
}

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
}
