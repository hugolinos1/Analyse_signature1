import { AnalysisResult } from '@/types/analysis';
import { RealAIAnalysisService } from './realAIAnalysisService';

export class AIAnalysisService {
  static async analyzePDF(file: File): Promise<AnalysisResult> {
    try {
      // Utiliser l'analyse IA réelle
      return await RealAIAnalysisService.analyzePDF(file);
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      
      // Fallback vers la simulation en cas d'erreur
      console.log('Utilisation du mode simulation en fallback');
      return this.simulateAnalysis(file);
    }
  }

  // Garde la simulation comme fallback
  private static async simulateAnalysis(file: File): Promise<AnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: `simulation_${Date.now()}`,
      fileName: file.name,
      timestamp: new Date(),
      status: 'completed',
      classification: {
        case: 1,
        description: "Aucune modification du document",
        justification: "Mode simulation - aucune détection réelle effectuée.",
        hasModifications: false,
        hasHandwrittenSignature: false,
        hasElectronicSignature: false,
        hasAnnotations: false
      },
      detections: [],
      confidence: 0.5
    };
  }
}
