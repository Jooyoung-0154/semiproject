package org.cloud.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.mock.web.MockMultipartFile;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void savesFileBelowConfiguredRootAndReturnsPublicRelativePath() throws Exception {
        FileStorageProperties properties = new FileStorageProperties(tempDir.toString());
        FileStorageService storage = new FileStorageService(properties);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "dish.JPG",
                "image/jpeg",
                "image-content".getBytes());

        String savedPath = storage.save(file, ImageType.PROFILE);

        assertThat(savedPath).matches("uploads/profile/[0-9a-f]{24}\\.jpg");
        assertThat(Files.readString(tempDir.resolve(savedPath.substring("uploads/".length()))))
                .isEqualTo("image-content");
    }

    @ParameterizedTest
    @MethodSource("imageLocations")
    void storesEachImageTypeInItsFixedDirectory(ImageType imageType, String expectedDirectory)
            throws Exception {
        FileStorageProperties properties = new FileStorageProperties(tempDir.toString());
        FileStorageService storage = new FileStorageService(properties);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                new byte[] { 1, 2, 3 });

        String savedPath = storage.save(file, imageType);

        assertThat(savedPath).startsWith("uploads/" + expectedDirectory + "/");
        assertThat(Files.exists(tempDir.resolve(expectedDirectory)
                .resolve(Path.of(savedPath).getFileName())))
                .isTrue();
    }

    private static Stream<Arguments> imageLocations() {
        return Stream.of(
                Arguments.of(ImageType.PROFILE, "profile"),
                Arguments.of(ImageType.PROFILE_BACKGROUND, "profilebackground"),
                Arguments.of(ImageType.RECIPE, "recipe/image"),
                Arguments.of(ImageType.COOKING_STEP, "recipe/cookingdc"),
                Arguments.of(ImageType.REVIEW, "reviews"),
                Arguments.of(ImageType.POST, "posts"));
    }
}
