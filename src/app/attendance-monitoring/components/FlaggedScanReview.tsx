'use client';
import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { FlaggedScan, mockFlaggedScans } from '../data/mockAttendanceData';
import Badge from '@/components/ui/Badge';
import AppImage from '@/components/ui/AppImage';

function ScoreBar({ score, threshold }: { score: number; threshold: number }) {
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
            <p className="text-xs text-muted-foreground">{scan.trade} · {scan.project} · {scan.scanType.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="red">Score {Math.round(scan.serverScore * 100)}%</Badge>
          <span className="text-muted-foreground">{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Reference Photo</p>
              <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-border">
                <AppImage
                  src={scan.referencePhotoUrl}
                  alt={`Reference photo for ${scan.workerName} — registered face scan`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">Registered reference</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Scan Photo</p>
              <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-red-500/30">
                <AppImage
                  src={scan.scanPhotoUrl}
                  alt={`Scan photo for ${scan.workerName} — flagged face scan at ${scan.scannedAt}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">{scan.scannedAt}</p>
            </div>
          </div>

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
  const [scans, setScans] = useState<FlaggedScan[]>(mockFlaggedScans);

  const handleApprove = (id: string) => {
    // BACKEND: POST /scans/flagged/:id/approve — sets face_verified=true
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReject = (id: string) => {
    // BACKEND: POST /scans/flagged/:id/reject — marks for re-scan
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

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