
import React from 'react';
import { AnalysisResult, Detection } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, FileText, Eye } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onViewPage: (pageNumber: number) => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onViewPage }) => {
  const { classification, detections, confidence } = result;

  const getStatusIcon = (caseNumber: number) => {
    switch (caseNumber) {
      case 1:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 2:
      case 3:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 4:
      case 5:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (caseNumber: number) => {
    switch (caseNumber) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-200';
      case 2:
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 4:
      case 5:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDetectionTypeLabel = (type: Detection['type']) => {
    switch (type) {
      case 'handwritten_signature':
        return 'Signature manuscrite';
      case 'electronic_signature':
        return 'Signature électronique';
      case 'annotation':
        return 'Annotation';
      case 'modification':
        return 'Modification';
      default:
        return type;
    }
  };

  const getDetectionColor = (type: Detection['type']) => {
    switch (type) {
      case 'handwritten_signature':
        return 'bg-green-100 text-green-800';
      case 'electronic_signature':
        return 'bg-blue-100 text-blue-800';
      case 'annotation':
        return 'bg-yellow-100 text-yellow-800';
      case 'modification':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Résultat principal */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            {getStatusIcon(classification.case)}
            <span>Résultat de l'analyse</span>
            <Badge variant="outline" className="ml-auto">
              Confiance: {Math.round(confidence * 100)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${getStatusColor(classification.case)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Cas {classification.case}</span>
              <FileText className="h-4 w-4" />
            </div>
            <p className="font-semibold mb-2">{classification.description}</p>
            <p className="text-sm">{classification.justification}</p>
          </div>

          {/* Résumé des détections */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${classification.hasHandwrittenSignature ? 'text-green-600' : 'text-gray-400'}`}>
                {classification.hasHandwrittenSignature ? '✓' : '✗'}
              </div>
              <p className="text-sm">Signature manuscrite</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${classification.hasElectronicSignature ? 'text-blue-600' : 'text-gray-400'}`}>
                {classification.hasElectronicSignature ? '✓' : '✗'}
              </div>
              <p className="text-sm">Signature électronique</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${classification.hasAnnotations ? 'text-yellow-600' : 'text-gray-400'}`}>
                {classification.hasAnnotations ? '✓' : '✗'}
              </div>
              <p className="text-sm">Annotations</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${classification.hasModifications ? 'text-red-600' : 'text-gray-400'}`}>
                {classification.hasModifications ? '✓' : '✗'}
              </div>
              <p className="text-sm">Modifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détections détaillées */}
      {detections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détections détaillées ({detections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detections.map((detection, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDetectionColor(detection.type)}>
                      {getDetectionTypeLabel(detection.type)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Page {detection.page} • {Math.round(detection.confidence * 100)}% confiance
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewPage(detection.page)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{detection.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Position: x={detection.coordinates.x}, y={detection.coordinates.y} 
                    ({detection.coordinates.width}×{detection.coordinates.height}px)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults;
