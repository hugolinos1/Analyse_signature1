
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiagnosticService } from '@/services/diagnosticService';
import { Terminal, RefreshCw, Bug } from 'lucide-react';

const DiagnosticPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const refreshLogs = () => {
    setLogs([...DiagnosticService.getLogs()]);
  };

  const clearLogs = () => {
    DiagnosticService.clearLogs();
    setLogs([]);
  };

  useEffect(() => {
    // Rafraîchir les logs toutes les secondes quand le panel est visible
    if (isVisible) {
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => {
            setIsVisible(true);
            refreshLogs();
          }}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Diagnostic
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-40">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Terminal className="h-4 w-4 mr-2" />
              Diagnostic IA
              <Badge variant="secondary" className="ml-2">{logs.length}</Badge>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" onClick={refreshLogs}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={clearLogs}>
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-black text-green-400 p-3 rounded-lg text-xs font-mono max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Aucun log de diagnostic...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticPanel;
