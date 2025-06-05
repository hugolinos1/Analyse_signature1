
import { AnalysisResult, Detection, ContractClassification, CLASSIFICATION_CASES } from '@/types/analysis';

// Simulation d'une API d'analyse IA (YOLO-like)
export class AIAnalysisService {
  static async analyzePDF(file: File): Promise<AnalysisResult> {
    // Simulation d'un délai d'analyse
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Génération de détections simulées basées sur le nom du fichier pour la démo
    const detections = this.generateMockDetections(file.name);
    const classification = this.classifyContract(detections);

    return {
      id: `analysis_${Date.now()}`,
      fileName: file.name,
      timestamp: new Date(),
      status: 'completed',
      classification,
      detections,
      confidence: Math.random() * 0.3 + 0.7 // Entre 70% et 100%
    };
  }

  private static generateMockDetections(fileName: string): Detection[] {
    const detections: Detection[] = [];
    
    // Simulation basée sur le nom du fichier pour différents scénarios
    if (fileName.toLowerCase().includes('signed')) {
      detections.push({
        type: 'handwritten_signature',
        page: 1,
        coordinates: { x: 400, y: 700, width: 150, height: 50 },
        confidence: 0.95,
        description: 'Signature manuscrite détectée avec haute confiance'
      });
    }

    if (fileName.toLowerCase().includes('electronic')) {
      detections.push({
        type: 'electronic_signature',
        page: 1,
        coordinates: { x: 300, y: 650, width: 200, height: 30 },
        confidence: 0.88,
        description: 'Signature électronique avec métadonnées de certification'
      });
    }

    if (fileName.toLowerCase().includes('annotated')) {
      detections.push({
        type: 'annotation',
        page: 1,
        coordinates: { x: 100, y: 200, width: 50, height: 20 },
        confidence: 0.92,
        description: 'Annotation manuscrite - correction ou note'
      });
    }

    // Ajout aléatoire de détections pour la démo
    if (Math.random() > 0.5) {
      detections.push({
        type: 'annotation',
        page: Math.floor(Math.random() * 3) + 1,
        coordinates: { 
          x: Math.random() * 400 + 100, 
          y: Math.random() * 500 + 100, 
          width: 80, 
          height: 20 
        },
        confidence: Math.random() * 0.3 + 0.6,
        description: 'Surlignage ou annotation détectée'
      });
    }

    return detections;
  }

  private static classifyContract(detections: Detection[]): ContractClassification {
    const hasModifications = detections.some(d => d.type === 'modification');
    const hasHandwrittenSignature = detections.some(d => d.type === 'handwritten_signature');
    const hasElectronicSignature = detections.some(d => d.type === 'electronic_signature');
    const hasAnnotations = detections.some(d => d.type === 'annotation');

    let caseNumber: 1 | 2 | 3 | 4 | 5;
    let justification: string;

    if (!hasModifications && !hasHandwrittenSignature && !hasElectronicSignature && !hasAnnotations) {
      caseNumber = 1;
      justification = "Document original sans modification, signature ou annotation détectée.";
    } else if (hasHandwrittenSignature && !hasAnnotations) {
      caseNumber = 2;
      justification = `Signature manuscrite détectée sur la page ${detections.find(d => d.type === 'handwritten_signature')?.page}.`;
    } else if (hasElectronicSignature && !hasAnnotations && !hasHandwrittenSignature) {
      caseNumber = 3;
      justification = `Signature électronique détectée sur la page ${detections.find(d => d.type === 'electronic_signature')?.page}.`;
    } else if (hasAnnotations && !hasHandwrittenSignature && !hasElectronicSignature) {
      caseNumber = 4;
      justification = `Annotations détectées sans signature : ${detections.filter(d => d.type === 'annotation').map(d => `page ${d.page}`).join(', ')}.`;
    } else {
      caseNumber = 5;
      justification = "Combinaison de signatures et d'annotations détectée.";
    }

    return {
      case: caseNumber,
      description: CLASSIFICATION_CASES[caseNumber],
      justification,
      hasModifications,
      hasHandwrittenSignature,
      hasElectronicSignature,
      hasAnnotations
    };
  }
}
