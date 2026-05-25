CREATE TABLE IF NOT EXISTS queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  video_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) DEFAULT '',
  duration INTEGER NOT NULL,
  thumbnail TEXT,
  position INTEGER NOT NULL,
  is_played BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_items_room_id ON queue_items(room_id);
CREATE INDEX idx_queue_items_position ON queue_items(room_id, position);
CREATE INDEX idx_queue_items_added_by ON queue_items(added_by);
