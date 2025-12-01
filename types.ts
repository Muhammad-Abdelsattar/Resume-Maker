
export type SocialPlatform = 'LinkedIn' | 'GitHub' | 'Email' | 'Phone' | 'Location' | 'Portfolio' | 'Other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform; // Used for icon selection
  label?: string; // e.g. "Portfolio"
  value: string; // The displayed text
  url?: string; // The hyperlink
}

export type SectionType = 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom';

export interface SectionBase {
  id: string;
  title: string;
  type: SectionType;
}

export interface SummarySection extends SectionBase {
  type: 'summary';
  content: string; // HTML-like string
}

export interface ExperienceItem {
  id: string;
  title: string;       
  subtitle: string;    
  location: string;
  date: string;
  description?: string;
  bullets: string[];
}

export interface ExperienceSection extends SectionBase {
  type: 'experience' | 'education';
  items: ExperienceItem[];
}

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  links: ProjectLink[]; // Replaces fixed link/demoLink
  skills: string;
  tools: string;
  bullets: string[];
}

export interface ProjectSection extends SectionBase {
  type: 'projects';
  items: ProjectItem[];
}

export interface SkillItem {
  id: string;
  category: string;
  items: string;
}

export interface SkillsSection extends SectionBase {
  type: 'skills';
  items: SkillItem[];
}

// --- Enhanced Custom Section ---
export interface CustomColumn {
  id: string;
  content: string; // Rich text
  width: number; // Percentage 1-100
  alignment: 'left' | 'center' | 'right';
}

export interface CustomRow {
  id: string;
  columns: CustomColumn[];
  hasBullet: boolean;
}

export interface CustomSection extends SectionBase {
  type: 'custom';
  items: CustomRow[];
}

export type ResumeSection = SummarySection | ExperienceSection | ProjectSection | SkillsSection | CustomSection;

export interface ResumeSettings {
  themeColor: string;
  fontFamily: 'Helvetica' | 'Arial' | 'Verdana' | 'Roboto' | 'Garamond' | 'Georgia' | 'Times' | 'Courier';
  fontSize: '10pt' | '11pt' | '12pt';
  documentMargin: 'compact' | 'standard' | 'relaxed';
  lineHeight: 'compact' | 'standard' | 'relaxed';
}

export interface ResumeData {
  id: string;
  profileName: string;
  fullName: string;
  roleTitle: string;
  socials: SocialLink[];
  sections: ResumeSection[];
  // Footer fields are now dynamic lists
  additionalInfo: { id: string, content: string }[]; 
  settings: ResumeSettings;
}
