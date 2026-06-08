-- RECIPE 테이블에 WRITER_ID 컬럼 추가 (최초 1회 실행)
ALTER TABLE RECIPE ADD COLUMN WRITER_ID VARCHAR(50) NULL COMMENT '레시피 작성자 ID';

-- review_image 테이블 생성 (최초 1회 실행)
CREATE TABLE IF NOT EXISTS review_image (
    image_id  INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_review_image_review_id
        FOREIGN KEY (review_id) REFERENCES review (review_id)
        ON DELETE CASCADE
);
