package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<restaurant, Integer> {

    boolean existsByNameAndAddress(String name, String address);
}
