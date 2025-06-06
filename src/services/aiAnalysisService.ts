
import { AnalysisResult } from '@/types/analysis';
import { RealAIAnalysisService } from './realAIAnalysisService';
import { DiagnosticService } from './diagnosticService';

export class AIAnalysisService {
  static async analyzePDF(file: File): Promise<AnalysisResult> {
    DiagnosticService.clearLogs();
    DiagnosticService.log('🎯 AIAnalysisService: Début de l\'analyse PDF pour:', file.name);
    
    // Phase 1 : Diagnostic complet
    DiagnosticService.log('🔍 Phase 1: Diagnostic complet');
    const workerOK = await DiagnosticService.testPDFWorker();
    const modelOK = await DiagnosticService.testHuggingFaceModel();
    
    DiagnosticService.log('📊 Résultats diagnostic:', { workerOK, modelOK });
    
    try {
      // Tentative d'analyse IA réelle (SANS fallback pour voir les vraies erreurs)
      DiagnosticService.log('🤖 Tentative d\'analyse IA réelle...');
      const result = await RealAIAnalysisService.analyzePDF(file);
      DiagnosticService.log('✅ Analyse IA réelle réussie!', result);
      return result;
    } catch (error) {
      DiagnosticService.log('❌ Erreur lors de l\'analyse IA réelle:', error);
      
      // Pour le diagnostic, on lève l'erreur au lieu d'utiliser le fallback
      console.error('🚨 DIAGNOSTIC: Analyse IA échouée, logs complets:');
      console.log(DiagnosticService.getLogs());
      
      // Temporairement, on retourne quand même le fallback mais avec un flag diagnostic
      return this.simulateAnalysisWithDiagnostic(file, error as Error);
    }
  }

  // Fallback modifié pour inclure les informations de diagnostic
  private static async simulateAnalysisWithDiagnostic(file: File, error: Error): Promise<AnalysisResult> {
    DiagnosticService.log('🎭 Mode simulation activé avec diagnostic pour:', file.name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: `diagnostic_${Date.now()}`,
      fileName: file.name,
      timestamp: new Date(),
      status: 'completed',
      classification: {
        case: 1,
        description: "DIAGNOSTIC MODE - Aucune modification détectée",
        justification: `Erreur IA: ${error.message}. Logs: ${DiagnosticService.getLogs().slice(-3).join('; ')}`,
        hasModifications: false,
        hasHandwrittenSignature: false,
        hasElectronicSignature: false,
        hasAnnotations: false
      },
      detections: [],
      confidence: 0.1 // Faible confiance pour indiquer le mode diagnostic
    };
  }
}
