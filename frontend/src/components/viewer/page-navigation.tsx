import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageNavigation() {
  const { currentPage, totalPages, setCurrentPage, logActivity } = useSignatureStore();

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const nextPage = currentPage - 1;
      setCurrentPage(nextPage);
      logActivity(`Navigated to page ${nextPage}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      logActivity(`Navigated to page ${nextPage}`);
    }
  };

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/95 shadow-md p-1 backdrop-blur-xs">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1 px-1 text-xs font-semibold text-foreground select-none">
        <span>Page</span>
        <span className="inline-flex items-center justify-center bg-secondary text-primary font-bold rounded-md px-2 py-0.5 min-w-[20px]">
          {currentPage}
        </span>
        <span className="text-muted-foreground font-normal">of</span>
        <span className="text-muted-foreground">{totalPages}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
