import { supabase } from "@/integrations/supabase/client";

const ROOM_BUCKET = "room-images";

export async function uploadRoomImage(roomId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `rooms/${roomId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(ROOM_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(ROOM_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
