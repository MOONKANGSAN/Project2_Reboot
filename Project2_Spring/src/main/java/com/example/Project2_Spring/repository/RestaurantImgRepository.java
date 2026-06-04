package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.RestaurantImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantImgRepository extends JpaRepository<RestaurantImg, Integer> {

    // 특정 점포의 활성 이미지 목록을 순서대로 조회
    List<RestaurantImg> findByRestaurantEntityIdxAndStateOrderByImgOrderAsc(Integer restaurantIdx, Integer state);

    // 특정 점포의 전체 이미지 목록 조회 (관리용)
    List<RestaurantImg> findByRestaurantEntityIdxOrderByImgOrderAsc(Integer restaurantIdx);
}
