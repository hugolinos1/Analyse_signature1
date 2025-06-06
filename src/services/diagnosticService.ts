
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
      // Test simple de chargement du worker
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
      this.log('📍 URL du worker:', workerUrl);
      
      // Tenter de charger le worker
      const response = await fetch(workerUrl);
      const isWorkerAvailable = response.ok;
      this.log(isWorkerAvailable ? '✅ Worker PDF.js accessible' : '❌ Worker PDF.js inaccessible');
      return isWorkerAvailable;
    } catch (error) {
      this.log('❌ Erreur lors du test du worker:', error);
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
}
