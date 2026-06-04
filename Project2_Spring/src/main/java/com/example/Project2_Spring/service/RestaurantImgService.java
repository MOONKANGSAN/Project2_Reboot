package com.example.Project2_Spring.service;

import com.example.Project2_Spring.entity.RestaurantImg;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.repository.RestaurantImgRepository;
import com.example.Project2_Spring.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantImgService {

    private final RestaurantImgRepository restaurantImgRepository;
    private final RestaurantRepository restaurantRepository;

    @Value("${app.upload.restaurant.dir}")
    private String uploadDir;

    // 허용된 이미지 확장자
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    @Transactional
    public List<RestaurantImg> uploadImages(Integer restaurantIdx, List<MultipartFile> files) throws IOException {
        restaurant r = restaurantRepository.findById(restaurantIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));

        // 업로드 디렉토리 생성 (없으면)
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 현재 해당 점포 이미지 중 가장 큰 순서 값 조회
        int maxOrder = restaurantImgRepository
                .findByRestaurantEntityIdxOrderByImgOrderAsc(restaurantIdx)
                .stream()
                .mapToInt(RestaurantImg::getImgOrder)
                .max()
                .orElse(-1);

        List<RestaurantImg> savedList = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file.isEmpty()) continue;

            String originalFilename = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "image"
            );

            // 확장자 추출 및 검증
            int dotIdx = originalFilename.lastIndexOf('.');
            String ext = (dotIdx >= 0) ? originalFilename.substring(dotIdx).toLowerCase() : "";
            if (!ALLOWED_EXTENSIONS.contains(ext)) {
                throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + ext);
            }

            // UUID 기반 파일명으로 저장 (충돌 방지)
            String savedFilename = UUID.randomUUID() + ext;
            Path targetPath = uploadPath.resolve(savedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            RestaurantImg img = new RestaurantImg();
            img.setRestaurantEntity(r);
            img.setImgUrl("/uploads/restaurant/" + savedFilename);
            img.setImgOrder(maxOrder + 1 + i);
            img.setState(1);

            savedList.add(restaurantImgRepository.save(img));
        }

        // 대표 이미지가 아직 없으면 첫 번째 업로드 이미지로 자동 설정
        if (r.getImgIdx() == null && !savedList.isEmpty()) {
            r.setImgIdx(savedList.get(0).getIdx());
            restaurantRepository.save(r);
        }

        return savedList;
    }
}
