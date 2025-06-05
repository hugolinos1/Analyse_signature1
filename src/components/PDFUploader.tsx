
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIAnalysisService } from '@/services/aiAnalysisService';
import { RealAIAnalysisService } from '@/services/realAIAnalysisService';
import { AnalysisResult } from '@/types/analysis';

interface PDFUploaderProps {
  onAnalysisStart: (file: File) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pré-charger le modèle au démarrage
    const initModel = async () => {
      setIsLoadingModel(true);
      try {
        await RealAIAnalysisService.initializeModel();
        setModelReady(true);
      } catch (err) {
        console.warn('Impossible de charger le modèle IA:', err);
        setModelReady(false);
      } finally {
        setIsLoadingModel(false);
      }
    };

    initModel();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);
    onAnalysisStart(file);

    try {
      const result = await AIAnalysisService.analyzePDF(file);
      onAnalysisComplete(result);
    } catch (err) {
      setError('Erreur lors de l\'analyse du document. Veuillez réessayer.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisStart, onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isAnalyzing || isLoadingModel
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-8">
        {/* Statut du modèle IA */}
        {isLoadingModel && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-blue-800 font-medium">Chargement du modèle IA YOLO...</p>
              <p className="text-blue-600 text-sm">Première utilisation - cela peut prendre quelques instants</p>
            </div>
          </div>
        )}

        {modelReady && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <Brain className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Modèle IA YOLO prêt pour l'analyse</p>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isAnalyzing || isLoadingModel ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-lg font-medium">Analyse IA en cours...</p>
                <p className="text-sm text-gray-600">Détection YOLO des signatures et annotations</p>
              </>
            ) : isLoadingModel ? (
              <>
                <Brain className="h-12 w-12 text-blue-400 animate-pulse" />
                <p className="text-lg font-medium">Chargement du modèle IA...</p>
                <p className="text-sm text-gray-600">Préparation du système de détection</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Déposez le fichier PDF ici' : 'Glissez-déposez un contrat PDF'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ou cliquez pour sélectionner un fichier
                  </p>
                </div>
                <Button variant="outline" className="mt-4" disabled={!modelReady}>
                  <FileText className="h-4 w-4 mr-2" />
                  Sélectionner un PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">L'IA YOLO analysera automatiquement :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Intégrité du document (modifications)</li>
            <li>Présence de signatures manuscrites</li>
            <li>Présence de signatures électroniques</li>
            <li>Annotations et modifications</li>
          </ul>
          {modelReady && (
            <p className="text-green-600 mt-2 font-medium">✓ Modèle de détection prêt</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;
