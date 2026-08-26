package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Tag {
    private int tagId;
    private String tagName;

    public Tag() {
    }

    public Tag(int tagId, String tagName) {
        this.tagId = tagId;
        this.tagName = tagName;
    }
}
