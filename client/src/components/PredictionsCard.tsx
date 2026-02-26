import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain as BrainIcon } from 'lucide-react';

interface TaskPredictionData {
  taskId: string;
  successProbability: number;
  estimatedExecutionTime: number;
  recommendedResources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  riskFactors: string[];
  optimizationTips: string[];
}

interface PredictionsCardProps {
  prediction: TaskPredictionData;
}

export const PredictionsCard: React.FC<PredictionsCardProps> = ({ prediction }) => {
  return (
    <Card className="bg-slate-800 border-slate-700 border-blue-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BrainIcon size={18} className="text-blue-400" />
          Predictive Analytics
        </CardTitle>
        <CardDescription className="text-slate-400">
          ML-powered predictions for task execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-700 rounded border border-slate-600">
            <div className="text-sm text-slate-400 mb-1">Success Probability</div>
            <div className="text-2xl font-bold text-green-400">
              {(prediction.successProbability * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-3 bg-slate-700 rounded border border-slate-600">
            <div className="text-sm text-slate-400 mb-1">Est. Execution Time</div>
            <div className="text-2xl font-bold text-blue-400">
              {prediction.estimatedExecutionTime}m
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-700 rounded border border-slate-600">
          <div className="text-sm text-slate-400 mb-2">Recommended Resources</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-slate-500">CPU</div>
              <div className="text-white font-medium">{prediction.recommendedResources.cpu}%</div>
            </div>
            <div>
              <div className="text-slate-500">Memory</div>
              <div className="text-white font-medium">{prediction.recommendedResources.memory}MB</div>
            </div>
            <div>
              <div className="text-slate-500">Storage</div>
              <div className="text-white font-medium">{prediction.recommendedResources.storage}MB</div>
            </div>
          </div>
        </div>

        {prediction.riskFactors.length > 0 && (
          <div className="p-3 bg-slate-700 rounded border border-yellow-600">
            <div className="text-sm text-yellow-400 font-medium mb-2">⚠️ Risk Factors</div>
            <ul className="text-sm text-slate-300 space-y-1">
              {prediction.riskFactors.map((risk: string, idx: number) => (
                <li key={idx}>• {risk}</li>
              ))}
            </ul>
          </div>
        )}

        {prediction.optimizationTips.length > 0 && (
          <div className="p-3 bg-slate-700 rounded border border-green-600">
            <div className="text-sm text-green-400 font-medium mb-2">💡 Optimization Tips</div>
            <ul className="text-sm text-slate-300 space-y-1">
              {prediction.optimizationTips.map((tip: string, idx: number) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
