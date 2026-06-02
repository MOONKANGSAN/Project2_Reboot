package com.example.Project2_Spring.service;

import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Transactional
    public restaurant register(restaurant r) {
        if (restaurantRepository.existsByNameAndAddress(r.getName(), r.getAddress())) {
            throw new IllegalStateException("동일한 이름과 주소의 점포가 이미 존재합니다.");
        }
        return restaurantRepository.save(r);
    }
}
