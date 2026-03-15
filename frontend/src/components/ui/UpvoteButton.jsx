import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ThumbsUp } from 'lucide-react';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const UpvoteButton = ({ complaintId, initialCount = 0, initialHasUpvoted = false, disabled = false, className }) => {
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [count, setCount] = useState(initialCount);
  const { request } = useApi();
  const { toast } = useToast();

  const handleToggleUpvote = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const previousState = hasUpvoted;
    const previousCount = count;
    
    // Optimistic UI update
    setHasUpvoted(!previousState);
    setCount(previousState ? previousCount - 1 : previousCount + 1);

    try {
      if (!previousState) {
        await request(`/api/complaints/${complaintId}/upvote`, 'POST');
      } else {
        await request(`/api/complaints/${complaintId}/upvote`, 'DELETE');
      }
    } catch (error) {
      // Revert on error
      setHasUpvoted(previousState);
      setCount(previousCount);
      toast({
        title: "Error",
        description: error.message || "Failed to update upvote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      type="button"
      variant={hasUpvoted ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      className={cn("flex items-center gap-2 transition-all", className, hasUpvoted ? "bg-blue-600 hover:bg-blue-700" : "")}
      onClick={handleToggleUpvote}
    >
      <ThumbsUp className={cn("h-4 w-4", hasUpvoted ? "fill-current" : "")} />
      <span>{count}</span>
    </Button>
  );
};

export default UpvoteButton;