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
  // Add more Dataverse contact fields as needed
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
