
import * as pdfjsLib from 'pdfjs-dist';

// Configuration simplifiée du worker PDF.js
if (typeof window !== 'undefined') {
  // Utiliser la version bundlée qui inclut le worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export class PDFToImageService {
  static async convertPDFToImages(file: File): Promise<PDFPage[]> {
    console.log('🔄 Début de la conversion PDF vers images...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('📄 Fichier PDF lu avec succès, taille:', arrayBuffer.byteLength, 'bytes');
      
      // Configuration optimisée pour le navigateur
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableAutoFetch: true,
        disableStream: true
      });
      
      console.log('🚀 Chargement du document PDF...');
      const pdf = await loadingTask.promise;
      console.log('✅ PDF chargé avec succès, nombre de pages:', pdf.numPages);
      
      const pages: PDFPage[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          console.log(`📄 Rendu de la page ${pageNum}/${pdf.numPages}...`);
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
          console.log(`✅ Page ${pageNum} rendue avec succès (${viewport.width}x${viewport.height})`);

          pages.push({
            pageNumber: pageNum,
            canvas,
            width: viewport.width,
            height: viewport.height
          });
          
          // Nettoyer la page pour libérer la mémoire
          page.cleanup();
        } catch (pageError) {
          console.error(`❌ Erreur lors du rendu de la page ${pageNum}:`, pageError);
          // Continuer avec les autres pages même si une page échoue
        }
      }

      if (pages.length === 0) {
        throw new Error('Aucune page n\'a pu être convertie');
      }

      console.log(`🎉 Conversion terminée avec succès: ${pages.length} pages converties`);
      return pages;
    } catch (error) {
      console.error('❌ Erreur lors de la conversion PDF vers images:', error);
      throw new Error(`Impossible de convertir le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
