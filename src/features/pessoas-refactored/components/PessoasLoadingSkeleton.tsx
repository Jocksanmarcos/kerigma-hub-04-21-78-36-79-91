import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PessoasLoadingSkeletonProps {
  viewMode: 'list' | 'grid';
}

export const PessoasLoadingSkeleton: React.FC<PessoasLoadingSkeletonProps> = ({ viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-1 mt-2">
                      <div className="h-5 bg-muted rounded w-12" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="animate-pulse border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded mb-2 w-48" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-16" />
              <div className="h-6 bg-muted rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};