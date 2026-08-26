package org.cloud.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "file")
public record FileStorageProperties(
        String uploadDir) {
}
