package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<restaurant, Integer> {

    boolean existsByNameAndAddress(String name, String address);

    // 등록일 내림차순 전체 조회 (백오피스용)
    List<restaurant> findAllByOrderByRegDateDesc();

    // 활성(state=1) 점포 최신순 조회 (공개 API용)
    List<restaurant> findByStateOrderByRegDateDesc(Integer state);
}
