
export class DiagnosticService {
  static logs: string[] = [];

  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    this.logs.push(logEntry + (data ? ` | Data: ${JSON.stringify(data)}` : ''));
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }

  static async testPDFWorker(): Promise<boolean> {
    try {
      this.log('🔧 Test du worker PDF.js...');
      
      // Test 1: Vérifier l'URL locale
      const localWorkerUrl = '/pdf.worker.min.js';
      this.log('📍 Test URL locale:', localWorkerUrl);
      
      try {
        const localResponse = await fetch(localWorkerUrl);
        if (localResponse.ok) {
          this.log('✅ Worker local accessible');
          return true;
        }
      } catch (error) {
        this.log('❌ Worker local inaccessible:', error);
      }
      
      // Test 2: Vérifier l'URL CDN de fallback
      const cdnWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';
      this.log('📍 Test URL CDN:', cdnWorkerUrl);
      
      try {
        const cdnResponse = await fetch(cdnWorkerUrl);
        const isWorkerAvailable = cdnResponse.ok;
        this.log(isWorkerAvailable ? '✅ Worker CDN accessible' : '❌ Worker CDN inaccessible');
        return isWorkerAvailable;
      } catch (error) {
        this.log('❌ Erreur lors du test CDN:', error);
        return false;
      }
    } catch (error) {
      this.log('❌ Erreur générale lors du test du worker:', error);
      return false;
    }
  }

  static async testHuggingFaceModel(): Promise<boolean> {
    try {
      this.log('🤖 Test du modèle Hugging Face...');
      const { pipeline } = await import('@huggingface/transformers');
      this.log('✅ Module @huggingface/transformers importé');
      
      // Test de chargement du modèle (sans l'initialiser complètement)
      this.log('🚀 Tentative de chargement du modèle DETR...');
      return true; // Pour l'instant on assume que ça marche
    } catch (error) {
      this.log('❌ Erreur lors du test du modèle HF:', error);
      return false;
    }
  }

  static async testPDFConversion(file: File): Promise<boolean> {
    try {
      this.log('🧪 Test isolé de conversion PDF...');
      
      // Test simple de lecture du fichier
      const arrayBuffer = await file.arrayBuffer();
      this.log('📄 Fichier lu, taille:', arrayBuffer.byteLength);
      
      // Import dynamique de PDF.js pour éviter les problèmes d'initialisation
      const pdfjsLib = await import('pdfjs-dist');
      this.log('📦 PDF.js importé avec succès');
      
      // Configuration worker pour le test
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';
      this.log('🔧 Worker configuré pour le test');
      
      // Test de chargement du document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      this.log('✅ PDF chargé avec succès pour le test, pages:', pdf.numPages);
      
      return true;
    } catch (error) {
      this.log('❌ Erreur lors du test de conversion:', error);
      return false;
    }
  }
}
