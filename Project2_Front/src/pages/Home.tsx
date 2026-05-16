import ShopCard from '@/components/main/ShopCard';
import ReviewCard from '@/components/main/ReviewCard';
import { MOCK_LATEST_REVIEWS, MOCK_RESTAURANTS } from '@/data/mockData';

const Home = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#FF5C00' }}>맛집 예약 시스템</h1>
      </header>

      {/* 최신 리뷰 섹션 */}
      <section style={{ marginBottom: '40px' }}>
        <h3>최신 리뷰 ✍️</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
          {MOCK_LATEST_REVIEWS.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      {/* 주변 맛집 섹션 */}
      <section>
        <h3>내 주변 맛집 📍</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {MOCK_RESTAURANTS.map(restaurant => (
            <ShopCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;