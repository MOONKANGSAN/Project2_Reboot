// src/components/main/ReviewCard.tsx
import React from 'react';
import type { Review } from '@/types/index.tsx'; // 절대 경로 @/ 사용 

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="review-card border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* 리뷰 이미지 */}
      <div className="h-40 bg-gray-100">
        <img src={review.imageUrl} alt={review.restaurantName} className="w-full h-full object-cover" />
      </div>

      {/* 리뷰 콘텐츠 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
              {review.userNickname.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{review.userNickname}</p>
              <p className="text-gray-400">{review.createdAt}</p>
            </div>
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">한식</span>
        </div>

        <h4 className="font-bold text-md mb-1">{review.restaurantName}</h4>
        <div className="text-yellow-400 text-xs mb-2">★★★★★ <span className="text-black font-bold ml-1">{review.rating.toFixed(1)}</span></div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {review.content}
        </p>

        <div className="flex items-center text-gray-400 text-xs">
          <span className="mr-1">❤️</span> {review.likeCount}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;