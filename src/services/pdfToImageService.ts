
import * as pdfjsLib from 'pdfjs-dist';
import { DiagnosticService } from './diagnosticService';

// Configuration du worker PDF.js avec diagnostic
if (typeof window !== 'undefined') {
  try {
    DiagnosticService.log('🔧 Configuration du worker PDF.js...');
    
    // Approche 1: Essayer l'URL standard
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
    DiagnosticService.log('📍 Tentative URL worker:', workerUrl);
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    DiagnosticService.log('✅ Worker configuré avec succès');
  } catch (error) {
    DiagnosticService.log('❌ Erreur configuration worker:', error);
  }
}

export interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export class PDFToImageService {
  static async convertPDFToImages(file: File): Promise<PDFPage[]> {
    DiagnosticService.log('🔄 Début de la conversion PDF vers images...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      DiagnosticService.log('📄 Fichier PDF lu avec succès, taille:', arrayBuffer.byteLength);
      
      // Test de la configuration du worker
      DiagnosticService.log('🔧 Worker source actuel:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      // Configuration de chargement avec diagnostic
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableAutoFetch: true,
        disableStream: true
      });
      
      DiagnosticService.log('🚀 Tentative de chargement du document PDF...');
      const pdf = await loadingTask.promise;
      DiagnosticService.log('✅ PDF chargé avec succès, nombre de pages:', pdf.numPages);
      
      const pages: PDFPage[] = [];

      // Pour le diagnostic, on ne traite qu'une seule page
      const maxPages = Math.min(pdf.numPages, 1);
      DiagnosticService.log(`📄 Traitement de ${maxPages} page(s) pour le diagnostic`);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          DiagnosticService.log(`📄 Rendu de la page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Impossible de créer le contexte canvas');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext).promise;
          DiagnosticService.log(`✅ Page ${pageNum} rendue avec succès (${viewport.width}x${viewport.height})`);

          pages.push({
            pageNumber: pageNum,
            canvas,
            width: viewport.width,
            height: viewport.height
          });
          
          page.cleanup();
        } catch (pageError) {
          DiagnosticService.log(`❌ Erreur lors du rendu de la page ${pageNum}:`, pageError);
          throw pageError; // Pour le diagnostic, on propage l'erreur
        }
      }

      if (pages.length === 0) {
        throw new Error('Aucune page n\'a pu être convertie');
      }

      DiagnosticService.log(`🎉 Conversion terminée avec succès: ${pages.length} pages converties`);
      return pages;
    } catch (error) {
      DiagnosticService.log('❌ Erreur lors de la conversion PDF vers images:', error);
      throw new Error(`Impossible de convertir le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
