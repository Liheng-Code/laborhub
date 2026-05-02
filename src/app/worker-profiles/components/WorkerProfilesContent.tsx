'use client';
import React, { useState } from 'react';
import WorkerListPanel from './WorkerListPanel';
import WorkerDetailTabs from './WorkerDetailTabs';
import { Users } from 'lucide-react';

export default function WorkerProfilesContent() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>('worker-001');

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)]">
      {/* Left panel — worker list */}
      <div className="w-80 xl:w-96 shrink-0 h-full">
        <WorkerListPanel selectedId={selectedWorkerId} onSelect={setSelectedWorkerId} />
      </div>

      {/* Right panel — worker detail */}
      <div className="flex-1 min-w-0 h-full">
        {selectedWorkerId ? (
          <WorkerDetailTabs workerId={selectedWorkerId} />
        ) : (
          <div className="bg-card border border-border rounded-xl h-full flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Users size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Select a worker</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              Choose a worker from the list to view their profile, session history, benchmarks, and payslips.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}