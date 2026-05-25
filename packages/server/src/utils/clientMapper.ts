export function toClientTrack(db: any) {
  if (!db) return null;
  return {
    id: db.id,
    videoId: db.video_id,
    title: db.title,
    artist: db.artist,
    duration: db.duration,
    thumbnail: db.thumbnail,
    position: db.position,
    addedBy: db.added_by,
    addedAt: db.added_at,
  };
}
export function toClientMember(m: any) {
  return {
    id: m.id,
    userId: m.user_id,
    nickname: m.nickname,
    isHost: m.is_host,
    joinedAt: m.joined_at,
  };
}