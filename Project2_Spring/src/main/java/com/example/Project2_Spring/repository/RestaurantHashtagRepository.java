package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.RestaurantHashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantHashtagRepository extends JpaRepository<RestaurantHashtag, Integer> {

    // 특정 점포의 활성 해시태그 목록 조회
    List<RestaurantHashtag> findByRestaurantEntityIdxAndState(Integer restaurantIdx, Integer state);

    // 특정 해시태그가 등록된 점포 목록 조회 (태그 검색 시 사용)
    List<RestaurantHashtag> findByHashtagIdxAndState(Integer hashtagIdx, Integer state);

    // 점포에 특정 해시태그가 이미 존재하는지 확인
    boolean existsByRestaurantEntityIdxAndHashtagIdx(Integer restaurantIdx, Integer hashtagIdx);

    // 단일 점포의 활성 해시태그 목록 (관리 모달용, Lazy 로딩 방지)
    @Query("SELECT rh FROM RestaurantHashtag rh " +
           "JOIN FETCH rh.hashtag " +
           "WHERE rh.restaurantEntity.idx = :restaurantIdx AND rh.state = 1 " +
           "ORDER BY rh.regDate ASC")
    List<RestaurantHashtag> findActiveHashtagsWithTagByRestaurantIdx(
            @Param("restaurantIdx") Integer restaurantIdx
    );

    // 여러 점포 idx의 활성 해시태그 일괄 조회 (메인 페이지 목록 성능 최적화)
    @Query("SELECT rh FROM RestaurantHashtag rh " +
           "JOIN FETCH rh.hashtag " +
           "WHERE rh.restaurantEntity.idx IN :restaurantIdxList AND rh.state = 1")
    List<RestaurantHashtag> findActiveHashtagsByRestaurantIdxIn(
            @Param("restaurantIdxList") List<Integer> restaurantIdxList
    );
}
