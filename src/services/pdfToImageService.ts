
import * as pdfjsLib from 'pdfjs-dist';

// Configuration alternative pour PDF.js qui évite les problèmes de worker
if (typeof window !== 'undefined') {
  // Essayer d'abord avec le CDN, puis fallback vers une version locale
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (error) {
    console.warn('Impossible de charger le worker PDF.js depuis le CDN, utilisation du fallback');
    // Fallback : utiliser le worker intégré (peut être plus lent mais fonctionne)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
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
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Configuration pour éviter les problèmes de worker
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      
      const pdf = await loadingTask.promise;
      const pages: PDFPage[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 }); // Réduire l'échelle pour améliorer les performances
          
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

          pages.push({
            pageNumber: pageNum,
            canvas,
            width: viewport.width,
            height: viewport.height
          });
          
          // Nettoyer la page pour libérer la mémoire
          page.cleanup();
        } catch (pageError) {
          console.error(`Erreur lors du rendu de la page ${pageNum}:`, pageError);
          // Continuer avec les autres pages même si une page échoue
        }
      }

      if (pages.length === 0) {
        throw new Error('Aucune page n\'a pu être convertie');
      }

      return pages;
    } catch (error) {
      console.error('Erreur lors de la conversion PDF vers images:', error);
      throw new Error(`Impossible de convertir le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
