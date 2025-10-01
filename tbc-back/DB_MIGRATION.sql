-- ============================================
-- 실시간 채팅 기능 DB 마이그레이션
-- ============================================

-- 1. chat_message 테이블에 필드 추가
ALTER TABLE chat_message
ADD COLUMN sender_nickname VARCHAR(200),
ADD COLUMN sender_profile_image VARCHAR(500),
ADD COLUMN read_by_json JSON DEFAULT '[]';

-- 2. chat_room_presence 테이블 생성 (온라인 상태 관리)
CREATE TABLE IF NOT EXISTS chat_room_presence (
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    presence_status VARCHAR(16) NOT NULL DEFAULT 'OFFLINE',
    last_seen_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    INDEX idx_room_status (room_id, presence_status),
    INDEX idx_user_room (user_id, room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 인덱스 추가 (성능 최적화)
ALTER TABLE chat_message
ADD INDEX idx_room_created (room_id, created_at DESC),
ADD INDEX idx_sender (sender_id);

-- 4. 기존 데이터 마이그레이션 (선택사항)
-- 기존 메시지에 닉네임 채우기 (프로필 정보가 있는 경우)
-- UPDATE chat_message cm
-- LEFT JOIN profile p ON cm.sender_id = p.user_id
-- SET cm.sender_nickname = COALESCE(p.display_name, CONCAT('사용자 ', cm.sender_id))
-- WHERE cm.sender_nickname IS NULL;

-- ============================================
-- 롤백 스크립트 (필요 시 사용)
-- ============================================
-- DROP TABLE IF EXISTS chat_room_presence;
-- ALTER TABLE chat_message 
--   DROP COLUMN sender_nickname,
--   DROP COLUMN sender_profile_image,
--   DROP COLUMN read_by_json;

