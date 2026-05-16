// src/components/main/ShopCard.tsx
import type { Restaurant }  from '@/types/index.tsx'; // 절대 경로 @/ 사용 

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const ShopCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="shop-card shadow-sm border rounded-lg overflow-hidden bg-white">
      {/* 이미지 및 태그 영역 */}
      <div className="relative h-48 overflow-hidden">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.isHot && <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">🔥 HOT</span>}
        {restaurant.isNew && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">🆕 NEW</span>}
        <button className="absolute top-2 right-2 text-white text-xl">❤️</button>
      </div>

      {/* 정보 영역 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            {restaurant.category}
          </span>
          <span className="text-gray-400 text-xs">₩₩</span>
        </div>
        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
        <div className="flex items-center text-sm mb-2">
          <span className="text-yellow-400 mr-1">★★★★★</span>
          <span className="font-bold">{restaurant.rating}</span>
          <span className="text-gray-400 ml-1">({restaurant.reviewCount})</span>
        </div>
        <p className="text-gray-500 text-xs mb-2">📍 {restaurant.location} · {restaurant.distance}</p>
        <div className="flex gap-1">
          {restaurant.tags.map(tag => (
            <span key={tag} className="text-gray-400 text-xs">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopCard;