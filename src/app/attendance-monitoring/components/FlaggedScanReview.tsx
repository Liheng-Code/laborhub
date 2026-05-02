'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api/client';

interface FlaggedScan {
  id: string;
  workerId: string;
  workerName: string;
  scanType: string;
  scannedAt: string;
  serverScore: number;
  localScore: number;
  status: 'flagged';
}

interface ScoreBarProps {
  score: number;
  threshold: number;
}

function ScoreBar({ score, threshold }: ScoreBarProps) {
  const pct = Math.round(score * 100);
  const passing = score >= threshold;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: passing ? 'var(--status-green)' : 'var(--status-red)',
          }}
        />
      </div>
      <span className={`text-xs font-mono font-semibold tabular-nums ${passing ? 'text-green-400' : 'text-red-400'}`}>
        {pct}%
      </span>
    </div>
  );
}

interface FlaggedCardProps {
  scan: FlaggedScan;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function FlaggedCard({ scan, onApprove, onReject }: FlaggedCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-card border border-red-500/30 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-red-950/10 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">{scan.workerName}</p>
            <p className="text-xs text-muted-foreground">{scan.scanType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="red">Score {Math.round(scan.serverScore * 100)}%</Badge>
          <span className="text-muted-foreground">{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Local match score</p>
              <ScoreBar score={scan.localScore} threshold={0.75} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Server match score (AWS Rekognition)</p>
              <ScoreBar score={scan.serverScore} threshold={0.80} />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onReject(scan.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-semibold rounded-md hover:bg-red-950/50 transition-colors active:scale-95"
            >
              <XCircle size={14} />
              Reject Scan
            </button>
            <button
              onClick={() => onApprove(scan.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-950/30 border border-green-500/30 text-green-400 text-xs font-semibold rounded-md hover:bg-green-950/50 transition-colors active:scale-95"
            >
              <CheckCircle2 size={14} />
              Confirm Worker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlaggedScanReview() {
  const [scans, setScans] = useState<FlaggedScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlaggedScans() {
      try {
        const response = await api.get<any[]>('/scans/flagged');

        if (response.data) {
          const flagged = response.data.map((r) => ({
            id: r.id,
            workerId: r.worker_id,
            workerName: r.worker_name || 'Unknown Worker',
            scanType: r.scan_type.replace('_', ' '),
            scannedAt: new Date(r.scanned_at).toLocaleString(),
            serverScore: r.face_match_score_server || 0.65,
            localScore: r.face_match_score_local || 0.70,
            status: 'flagged' as const,
          }));

          setScans(flagged);
        }
      } catch (error) {
        console.error('Error fetching flagged scans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFlaggedScans();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await api.post(`/scans/${id}/verify-face`, { score: 0.95 });

      if (!response.error) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error approving scan:', error);
    }
  };

  const handleReject = (id: string) => {
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading flagged scans...</div>;
  }

  if (scans.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center py-10">
        <CheckCircle2 size={32} className="text-green-400 mb-3" />
        <p className="text-sm font-semibold text-foreground">All scans verified</p>
        <p className="text-xs text-muted-foreground mt-1">No flagged face scans require review</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.map((scan) => (
        <FlaggedCard key={`flag-${scan.id}`} scan={scan} onApprove={handleApprove} onReject={handleReject} />
      ))}
    </div>
  );
}
