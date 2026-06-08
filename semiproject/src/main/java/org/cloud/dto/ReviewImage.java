package org.cloud.dto;

import lombok.Data;

@Data
public class ReviewImage {
    private int imageId;
    private int reviewId;
    private String imageUrl;
}
