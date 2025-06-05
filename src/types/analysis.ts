
export interface AnalysisResult {
  id: string;
  fileName: string;
  timestamp: Date;
  status: 'analyzing' | 'completed' | 'error';
  classification: ContractClassification;
  detections: Detection[];
  confidence: number;
}

export interface Detection {
  type: 'handwritten_signature' | 'electronic_signature' | 'annotation' | 'modification';
  page: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  description: string;
}

export interface ContractClassification {
  case: 1 | 2 | 3 | 4 | 5;
  description: string;
  justification: string;
  hasModifications: boolean;
  hasHandwrittenSignature: boolean;
  hasElectronicSignature: boolean;
  hasAnnotations: boolean;
}

export const CLASSIFICATION_CASES = {
  1: "Aucune modification du document",
  2: "Présence d'une signature manuscrite",
  3: "Présence d'une signature électronique", 
  4: "Présence d'annotations différentes d'une signature",
  5: "Présence d'annotation et d'une signature"
} as const;
