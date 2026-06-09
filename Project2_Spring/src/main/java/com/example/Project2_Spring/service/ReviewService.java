package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.BackofficeReviewListItemDto;
import com.example.Project2_Spring.dto.PublicReviewDto;
import com.example.Project2_Spring.entity.Review;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.repository.RestaurantImgRepository;
import com.example.Project2_Spring.repository.RestaurantRepository;
import com.example.Project2_Spring.repository.ReviewRepository;
import com.example.Project2_Spring.repository.UserInfoRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository      reviewRepository;
    private final RestaurantRepository  restaurantRepository;
    private final RestaurantImgRepository restaurantImgRepository;
    private final UserInfoRepository    userInfoRepository;

    @Value("${app.upload.review.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    // 공개 리뷰 목록 조회 (최신순, 활성 리뷰만)
    @Transactional(readOnly = true)
    public List<PublicReviewDto> getPublicList() {
        List<Review> reviews = reviewRepository.findByStateOrderByRegDateDesc(1);
        if (reviews.isEmpty()) return List.of();

        // 점포 대표 이미지 일괄 조회
        List<Integer> imgIdxList = reviews.stream()
                .map(rv -> rv.getRestaurantEntity().getImgIdx())
                .filter(imgIdx -> imgIdx != null)
                .distinct()
                .collect(Collectors.toList());

        Map<Integer, String> imgUrlMap = new HashMap<>();
        if (!imgIdxList.isEmpty()) {
            restaurantImgRepository.findAllById(imgIdxList)
                    .forEach(img -> imgUrlMap.put(img.getIdx(), img.getImgUrl()));
        }

        return reviews.stream().map(rv -> {
            restaurant r = rv.getRestaurantEntity();
            String restaurantImageUrl = (r.getImgIdx() != null && imgUrlMap.containsKey(r.getImgIdx()))
                    ? imgUrlMap.get(r.getImgIdx())
                    : r.getImageUrl();

            return new PublicReviewDto(
                    rv.getIdx(),
                    r.getIdx(),
                    r.getName(),
                    r.getCategory(),
                    r.getLocation(),
                    restaurantImageUrl,
                    rv.getUserEntity().getNickname(),
                    rv.getRating(),
                    rv.getContent(),
                    rv.getLikeCount(),
                    rv.getImageUrl(),
                    rv.getRegDate()
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public Review write(Integer restaurantIdx, String userId, Integer rating,
                        String content, MultipartFile image) throws IOException {

        restaurant r = restaurantRepository.findById(restaurantIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));

        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1~5 사이여야 합니다.");
        }

        // 이미지 저장 (선택)
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Review review = new Review();
        review.setRestaurantEntity(r);
        review.setUserEntity(user);
        review.setRating(rating);
        review.setContent(content);
        review.setImageUrl(imageUrl);

        return reviewRepository.save(review);
    }

    // ── 백오피스 전용 ──────────────────────────────────────

    // 전체 리뷰 목록 (활성+비활성, 최신순)
    @Transactional(readOnly = true)
    public List<BackofficeReviewListItemDto> getAdminList() {
        return reviewRepository.findAllByOrderByRegDateDesc()
                .stream()
                .map(rv -> new BackofficeReviewListItemDto(
                        rv.getIdx(),
                        rv.getRestaurantEntity().getIdx(),
                        rv.getRestaurantEntity().getName(),
                        rv.getUserEntity().getNickname(),
                        rv.getRating(),
                        rv.getContent(),
                        rv.getLikeCount(),
                        rv.getImageUrl() != null,
                        rv.getState(),
                        rv.getRegDate()
                ))
                .collect(Collectors.toList());
    }

    // 리뷰 상태 토글 (1→0, 0→1)
    @Transactional
    public Review toggleState(Integer reviewIdx) {
        Review review = reviewRepository.findById(reviewIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));
        review.setState(review.getState() == 1 ? 0 : 1);
        return reviewRepository.save(review);
    }

    private String saveImage(MultipartFile file) throws IOException {
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "image");
        int dot = original.lastIndexOf('.');
        String ext = (dot >= 0) ? original.substring(dot).toLowerCase() : "";

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + ext);
        }

        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/review/" + filename;
    }
}
