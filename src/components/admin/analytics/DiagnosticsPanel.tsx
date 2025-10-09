'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  timestamp: string;
  environment_variables: {
    [key: string]: {
      configured: boolean;
      value: string;
      starts_with_phc?: boolean;
      starts_with_phx?: boolean;
    };
  };
  issues: string[];
  recommendations: string[];
}

export function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/diagnose');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run diagnostics');
      }

      const data = await response.json();
      setDiagnostics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-text-primary">
            PostHog Configuration Diagnostics
          </h3>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Use this tool to verify your PostHog configuration and troubleshoot connection issues.
      </p>

      {error && (
        <div className="bg-error/10 border border-error/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {diagnostics && (
        <div className="space-y-4">
          {/* Environment Variables */}
          <div className="bg-background rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Environment Variables
            </h4>
            <div className="space-y-2">
              {Object.entries(diagnostics.environment_variables).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between text-sm py-2 border-b border-gray-800 last:border-0"
                >
                  <div className="flex-1">
                    <code className="text-primary font-mono text-xs">{key}</code>
                    <div className="text-text-secondary text-xs mt-1">{value.value}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {value.configured ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-error" />
                    )}
                    {value.starts_with_phc !== undefined && !value.starts_with_phc && value.configured && (
                      <span className="text-xs text-warning">Wrong prefix</span>
                    )}
                    {value.starts_with_phx !== undefined && !value.starts_with_phx && value.configured && (
                      <span className="text-xs text-warning">Wrong prefix</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          {diagnostics.issues.length > 0 && (
            <div className="bg-error/10 border border-error/50 rounded-lg p-4">
              <h4 className="font-semibold text-error mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Issues Found ({diagnostics.issues.length})
              </h4>
              <ul className="space-y-2">
                {diagnostics.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-error mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {diagnostics.recommendations.length > 0 && (
            <div className="bg-primary/10 border border-primary/50 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {diagnostics.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-0.5">
                      {rec.startsWith('✅') ? '✅' : rec.startsWith('🔑') ? '🔑' : rec.startsWith('📝') ? '📝' : rec.startsWith('❌') ? '❌' : '→'}
                    </span>
                    <span>{rec.replace(/^[✅🔑📝❌]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-text-secondary text-right">
            Last run: {new Date(diagnostics.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
