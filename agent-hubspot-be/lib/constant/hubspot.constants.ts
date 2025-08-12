export const HUBSPOT_OBJECT_TYPES = {
    CONTACTS: 'contact',
    DEALS: 'deal',
    TICKETS: 'ticket',
    COMPANIES: 'company'
} as const;

export type HubSpotObjectType = typeof HUBSPOT_OBJECT_TYPES[keyof typeof HUBSPOT_OBJECT_TYPES];


export interface FormatCustomField {
    name: string;
    label: string;
    description: string;
    type: string;
}

export interface PropertyConfig {
    name: string;
    label: string;
    type: string;
    fieldType: string;
    groupName: string;
    objectType: string;
}

export interface GroupConfig {
    objectType: string;
    name: string;
    label: string;
    displayOrder: number;
}
