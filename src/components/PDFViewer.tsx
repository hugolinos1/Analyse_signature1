
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Detection } from '@/types/analysis';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  fileName: string;
  pageNumber: number;
  detections: Detection[];
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileName, pageNumber, detections, onClose }) => {
  const pageDetections = detections.filter(d => d.page === pageNumber);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Visualisation - Page {pageNumber}</span>
            <Badge variant="outline">{fileName}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Simulation d'une page PDF */}
          <div className="w-full h-96 bg-white border border-gray-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50">
              {/* Contenu simulé du document */}
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="space-y-2 mt-8">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-11/12"></div>
                  <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                </div>
              </div>

              {/* Affichage des détections */}
              {pageDetections.map((detection, index) => (
                <div
                  key={index}
                  className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 rounded"
                  style={{
                    left: `${(detection.coordinates.x / 600) * 100}%`,
                    top: `${(detection.coordinates.y / 800) * 100}%`,
                    width: `${(detection.coordinates.width / 600) * 100}%`,
                    height: `${(detection.coordinates.height / 800) * 100}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {detection.type === 'handwritten_signature' ? 'Signature manuscrite' :
                     detection.type === 'electronic_signature' ? 'Signature électronique' :
                     detection.type === 'annotation' ? 'Annotation' : 'Modification'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Légende des détections */}
          {pageDetections.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Détections sur cette page :</h4>
              <div className="space-y-2">
                {pageDetections.map((detection, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="font-medium">
                      {detection.type === 'handwritten_signature' ? 'Signature manuscrite' :
                       detection.type === 'electronic_signature' ? 'Signature électronique' :
                       detection.type === 'annotation' ? 'Annotation' : 'Modification'}
                    </span>
                    <span className="text-gray-600">
                      • {Math.round(detection.confidence * 100)}% confiance
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
