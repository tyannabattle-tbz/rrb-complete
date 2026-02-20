import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface FlaggedContent {
  id: string;
  contentType: 'comment' | 'message' | 'video' | 'playlist';
  content: string;
  reason: string;
  reportCount: number;
  userName: string;
  flaggedAt: Date;
}

export const ModerationQueue: React.FC = () => {
  const [queue, setQueue] = useState<FlaggedContent[]>([
    {
      id: '1',
      contentType: 'comment',
      content: 'Spam content...',
      reason: 'spam',
      reportCount: 3,
      userName: 'User123',
      flaggedAt: new Date(),
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleApprove = (id: string) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const handleReject = (id: string) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Moderation Queue</h1>
      <div className="space-y-3">
        {queue.map(item => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <Badge>{item.reason}</Badge>
                  <p className="text-sm font-medium mt-2">By: {item.userName}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" className="bg-green-600" onClick={() => handleApprove(item.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>Reject</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
