package org.cloud.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Member {
    private String id;
    private String password;
    private int balance;
    private String nickname;
    private String profileImg;
    private String intro;
    private LocalDate birthDate;
    private String gender;
    private String status;
    private String role;
    private List<String> followerIds;
    private List<String> followingIds;
    private List<Review> myReviews;
    private List<Post> myPosts;
    private int followingCount;
    private int followerCount;
    private int recipeCount;
    private boolean scrapPublic = true;
    private String snsYoutube;
    private String snsInstagram;
    private String snsFacebook;
}
