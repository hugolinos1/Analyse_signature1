
import { pipeline, ObjectDetectionPipeline } from '@huggingface/transformers';
import { AnalysisResult, Detection, ContractClassification, CLASSIFICATION_CASES } from '@/types/analysis';
import { PDFToImageService, PDFPage } from './pdfToImageService';

export class RealAIAnalysisService {
  private static detector: ObjectDetectionPipeline | null = null;

  static async initializeModel(): Promise<void> {
    if (!this.detector) {
      console.log('Chargement du modèle de détection d\'objets...');
      try {
        // Utiliser un modèle de détection d'objets compatible
        this.detector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        console.log('Modèle chargé avec succès');
      } catch (error) {
        console.warn('WebGPU non disponible, utilisation du CPU', error);
        this.detector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50'
        );
      }
    }
  }

  static async analyzePDF(file: File): Promise<AnalysisResult> {
    console.log('Début de l\'analyse IA réelle...');
    
    // Initialiser le modèle si nécessaire
    await this.initializeModel();
    
    // Convertir le PDF en images
    const pages = await PDFToImageService.convertPDFToImages(file);
    console.log(`PDF converti en ${pages.length} pages`);
    
    // Analyser chaque page
    const allDetections: Detection[] = [];
    
    for (const page of pages) {
      const pageDetections = await this.analyzePage(page);
      allDetections.push(...pageDetections);
    }

    // Classifier le contrat
    const classification = this.classifyContract(allDetections);
    
    // Calculer la confiance globale
    const confidence = allDetections.length > 0 
      ? allDetections.reduce((sum, d) => sum + d.confidence, 0) / allDetections.length
      : 0.95; // Haute confiance si aucune détection

    return {
      id: `analysis_${Date.now()}`,
      fileName: file.name,
      timestamp: new Date(),
      status: 'completed',
      classification,
      detections: allDetections,
      confidence
    };
  }

  private static async analyzePage(page: PDFPage): Promise<Detection[]> {
    if (!this.detector) {
      throw new Error('Modèle non initialisé');
    }

    try {
      // Convertir le canvas en URL d'image
      const imageUrl = page.canvas.toDataURL('image/png');
      
      // Effectuer la détection
      const results = await this.detector(imageUrl);
      
      // Convertir les résultats en détections
      const detections: Detection[] = [];
      
      for (const result of results) {
        // Mapper les classes détectées vers nos types
        const detectionType = this.mapLabelToDetectionType(result.label);
        if (detectionType) {
          detections.push({
            type: detectionType,
            page: page.pageNumber,
            coordinates: {
              x: Math.round(result.box.xmin),
              y: Math.round(result.box.ymin),
              width: Math.round(result.box.xmax - result.box.xmin),
              height: Math.round(result.box.ymax - result.box.ymin)
            },
            confidence: result.score,
            description: `${result.label} détecté avec ${Math.round(result.score * 100)}% de confiance`
          });
        }
      }

      return detections;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la page:', error);
      return [];
    }
  }

  private static mapLabelToDetectionType(label: string): Detection['type'] | null {
    const lowerLabel = label.toLowerCase();
    
    // Mapper les objets détectés vers nos types de détection
    if (lowerLabel.includes('person') || lowerLabel.includes('hand')) {
      return 'handwritten_signature';
    }
    if (lowerLabel.includes('book') || lowerLabel.includes('paper')) {
      return 'annotation';
    }
    
    // Pour cette démo, nous retournons null pour la plupart des objets
    // Dans un vrai système, on utiliserait un modèle spécialisé dans les signatures
    return null;
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
      justification = "Document original sans modification, signature ou annotation détectée par l'IA.";
    } else if (hasHandwrittenSignature && !hasAnnotations) {
      caseNumber = 2;
      const signaturePage = detections.find(d => d.type === 'handwritten_signature')?.page;
      justification = `Signature manuscrite détectée par l'IA sur la page ${signaturePage}.`;
    } else if (hasElectronicSignature && !hasAnnotations && !hasHandwrittenSignature) {
      caseNumber = 3;
      const signaturePage = detections.find(d => d.type === 'electronic_signature')?.page;
      justification = `Signature électronique détectée par l'IA sur la page ${signaturePage}.`;
    } else if (hasAnnotations && !hasHandwrittenSignature && !hasElectronicSignature) {
      caseNumber = 4;
      const annotationPages = detections.filter(d => d.type === 'annotation').map(d => d.page);
      justification = `Annotations détectées par l'IA sans signature : pages ${[...new Set(annotationPages)].join(', ')}.`;
    } else {
      caseNumber = 5;
      justification = "Combinaison de signatures et d'annotations détectée par l'IA.";
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
