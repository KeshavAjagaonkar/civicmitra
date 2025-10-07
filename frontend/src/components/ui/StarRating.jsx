
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const StarRating = ({ rating, onRatingChange, size = 24, className }) => {
  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={ratingValue}
            size={size}
            className={cn(
              "cursor-pointer transition-colors",
              ratingValue <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
            )}
            onClick={() => onRatingChange && onRatingChange(ratingValue)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
