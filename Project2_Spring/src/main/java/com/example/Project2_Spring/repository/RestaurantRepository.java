package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<restaurant, Integer> {

    boolean existsByNameAndAddress(String name, String address);

    List<restaurant> findAllByOrderByRegDateDesc();

    List<restaurant> findByStateOrderByRegDateDesc(Integer state);

    // 점포명 또는 지역명으로 활성 점포 검색 (대소문자 무시, 최대 10건)
    @Query("SELECT r FROM restaurant r " +
           "WHERE r.state = 1 " +
           "AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "  OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY r.name ASC")
    List<restaurant> searchByKeyword(@Param("keyword") String keyword);
}
