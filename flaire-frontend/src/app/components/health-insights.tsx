import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface InsightsResponse {
  summary: {
    totalSymptoms: number;
    totalMedications: number;
    totalMeals: number;
    latestPain: number | null;
    latestEnergy: number | null;
    averageSymptomSeverity: string | null;
    flareRisk: string;
  };
  tips: string[];
}

export function HealthInsights() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await api.getInsights();
        setData(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return <div className="p-4">Loading insights...</div>;
  }

  if (!data) {
    return <div className="p-4">Unable to load insights.</div>;
  }

  const { summary, tips } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Health Insights</h2>
        <p className="text-muted-foreground">
          A quick summary of your recent health activity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Symptoms Logged</p>
            <p className="text-2xl font-semibold">{summary.totalSymptoms}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Medications Added</p>
            <p className="text-2xl font-semibold">{summary.totalMedications}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Meals Logged</p>
            <p className="text-2xl font-semibold">{summary.totalMeals}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Latest Pain</p>
            <p className="text-2xl font-semibold">
              {summary.latestPain ?? '-'}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Latest Energy</p>
            <p className="text-2xl font-semibold">
              {summary.latestEnergy ?? '-'}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Average Symptom Severity</p>
            <p className="text-2xl font-semibold">
              {summary.averageSymptomSeverity ?? '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Flare Risk</h3>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Current status</p>
          <p className="text-2xl font-semibold">{summary.flareRisk}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Suggestions</h3>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}