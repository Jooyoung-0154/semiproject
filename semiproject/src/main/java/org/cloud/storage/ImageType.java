package org.cloud.storage;

public enum ImageType {
    PROFILE("profile"),
    PROFILE_BACKGROUND("profilebackground"),
    RECIPE("recipe/image"),
    COOKING_STEP("recipe/cookingdc"),
    REVIEW("reviews"),
    POST("posts");

    private final String directory;

    ImageType(String directory) {
        this.directory = directory;
    }

    public String getDirectory() {
        return directory;
    }
}
