'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPromptHistory, clearPromptHistory, deletePromptHistoryItem, PromptHistoryItem } from '@/lib/prompt-history';

interface PromptHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptHistoryDialog({ open, onOpenChange }: PromptHistoryDialogProps) {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Load history when dialog opens
  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const loadHistory = () => {
    const items = getPromptHistory();
    setHistory(items);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearPromptHistory();
      setHistory([]);
      toast.success('History cleared');
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleDeleteItem = (id: string) => {
    deletePromptHistoryItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success('Item deleted');
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle>Prompt History</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Maximum 20 items stored locally</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No history yet</p>
              <p className="text-sm mt-2">Generate prompts to see them here</p>
            </div>
          ) : (
            history.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const shouldTruncate = item.prompt.length > 200;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{formatDate(item.timestamp)}</span>
                        {item.model && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{item.model}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPrompt(item.prompt)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">
                    {isExpanded || !shouldTruncate
                      ? item.prompt
                      : truncateText(item.prompt)}
                  </p>

                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-sm text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
                    >
                      {isExpanded ? '▼ Collapse' : '▶ Expand'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
