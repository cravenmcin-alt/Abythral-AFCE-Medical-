
export enum ConstraintDomain {
  Cellular = 'Cellular',
  Immune = 'Immune',
  Metabolic = 'Metabolic',
  Vascular = 'Vascular',
  Epigenetic = 'Epigenetic',
  Neural = 'Neural'
}

export interface MedicalImage {
  data: string; // base64
  mimeType: string;
  label: string;
}

export interface DomainMetric {
  domain: ConstraintDomain;
  flexibility: number; // 0-100
  rigidity: number; // 0-100
  collapseRisk: number; // 0-100
  currentValue: number;
  deviceSource?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: MedicalImage;
}

export interface PatientState {
  id: string;
  name: string;
  age: number;
  lastAssessment: string;
  domains: DomainMetric[];
  recoveryHalfLife: number; // seconds
  stateSpaceVolume: number; // relative units
  variabilityIndex: number; // 0-1
  chatHistory: ChatMessage[];
}

export interface AssessmentResult {
  summary: string;
  risks: {
    domain: ConstraintDomain;
    finding: string;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
  }[];
  interventions: string[];
  visualGrounding?: string;
}
