package org.cloud.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final String PUBLIC_ROOT = "uploads";

    private final Path uploadRoot;

    public FileStorageService(FileStorageProperties properties) {
        this.uploadRoot = Paths.get(properties.uploadDir()).toAbsolutePath().normalize();
    }

    public String save(MultipartFile file, ImageType imageType) throws IOException {
        Path directory = uploadRoot.resolve(imageType.getDirectory()).normalize();
        if (!directory.startsWith(uploadRoot)) {
            throw new IOException("Invalid upload directory");
        }

        Files.createDirectories(directory);

        String savedName = createSavedName(file.getOriginalFilename());
        Path target = directory.resolve(savedName).normalize();
        if (!target.startsWith(directory)) {
            throw new IOException("Invalid upload path");
        }

        file.transferTo(target);
        return PUBLIC_ROOT + "/" + imageType.getDirectory() + "/" + savedName;
    }

    private String createSavedName(String originalName) {
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            String candidate = originalName.substring(originalName.lastIndexOf('.'));
            if (candidate.matches("\\.[A-Za-z0-9]{1,10}")) {
                extension = candidate.toLowerCase(Locale.ROOT);
            }
        }

        // 게시글 이미지 5개의 경로가 POST_IMG VARCHAR(255)에 들어가도록 24자로 유지한다.
        String id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        return id + extension;
    }
}
