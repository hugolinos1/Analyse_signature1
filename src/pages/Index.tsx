
import React, { useState } from 'react';
import PDFUploader from '@/components/PDFUploader';
import AnalysisResults from '@/components/AnalysisResults';
import PDFViewer from '@/components/PDFViewer';
import { AnalysisResult } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Brain, Shield } from 'lucide-react';

const Index = () => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [viewingPage, setViewingPage] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisStart = (file: File) => {
    setCurrentFile(file);
    setAnalysisResult(null);
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleViewPage = (pageNumber: number) => {
    setViewingPage(pageNumber);
  };

  const handleCloseViewer = () => {
    setViewingPage(null);
  };

  const handleNewAnalysis = () => {
    setCurrentFile(null);
    setAnalysisResult(null);
    setViewingPage(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <FileCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analyseur de Contrats IA
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vérification automatique de l'intégrité et des signatures de vos contrats PDF 
            grâce à l'intelligence artificielle spécialisée
          </p>
          
          {/* Badges de fonctionnalités */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="px-3 py-1">
              <Brain className="h-4 w-4 mr-2" />
              IA YOLO-based
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-2" />
              Détection de signatures
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <FileCheck className="h-4 w-4 mr-2" />
              Analyse d'intégrité
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Visualiseur de page (modal overlay) */}
          {viewingPage && analysisResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <PDFViewer
                fileName={analysisResult.fileName}
                pageNumber={viewingPage}
                detections={analysisResult.detections}
                onClose={handleCloseViewer}
              />
            </div>
          )}

          {/* Interface principale */}
          <div className="space-y-8">
            {!analysisResult && !isAnalyzing && (
              <div className="flex justify-center">
                <PDFUploader 
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            )}

            {isAnalyzing && currentFile && (
              <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle className="text-center">Analyse en cours</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <div>
                      <p className="text-lg font-medium">{currentFile.name}</p>
                      <p className="text-sm text-gray-600">
                        L'IA analyse le document pour détecter les signatures et annotations...
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ⚡ Utilisation d'un modèle YOLO spécialisé dans la détection de signatures
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Résultats d'analyse</h2>
                    <p className="text-gray-600">
                      Fichier: {analysisResult.fileName} • 
                      Analysé le {analysisResult.timestamp.toLocaleDateString('fr-FR')} à {analysisResult.timestamp.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={handleNewAnalysis}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Nouvelle analyse
                  </button>
                </div>

                <AnalysisResults 
                  result={analysisResult}
                  onViewPage={handleViewPage}
                />
              </div>
            )}
          </div>

          {/* Section informative */}
          {!analysisResult && !isAnalyzing && (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔍 Détection précise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Notre IA utilise des modèles YOLO avancés pour détecter avec précision 
                    les signatures manuscrites, électroniques et toute annotation.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Classification automatique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Classification automatique selon 5 cas prédéfinis avec justification 
                    détaillée et localisation précise des éléments détectés.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">👁️ Visualisation interactive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Visualisez directement les pages concernées avec mise en évidence 
                    des zones d'intérêt détectées par l'IA.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
