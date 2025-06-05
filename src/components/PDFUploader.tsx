
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIAnalysisService } from '@/services/aiAnalysisService';
import { AnalysisResult } from '@/types/analysis';

interface PDFUploaderProps {
  onAnalysisStart: (file: File) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    disabled: isAnalyzing
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isAnalyzing ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-lg font-medium">Analyse IA en cours...</p>
                <p className="text-sm text-gray-600">Détection des signatures et annotations</p>
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
                <Button variant="outline" className="mt-4">
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
          <p className="font-medium mb-2">L'IA analysera automatiquement :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Intégrité du document (modifications)</li>
            <li>Présence de signatures manuscrites</li>
            <li>Présence de signatures électroniques</li>
            <li>Annotations et modifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;
