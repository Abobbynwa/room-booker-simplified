import { supabase } from "@/integrations/supabase/client";

const ROOM_BUCKET = "room-images";
const RECEIPT_BUCKET = "guest-receipts";
const PAYMENT_BUCKET = "payment-proofs";
const STAFF_BUCKET = "staff-documents";

async function uploadToBucket(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadRoomImage(roomId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `rooms/${roomId}/${Date.now()}-${safeName}`;
  return uploadToBucket(ROOM_BUCKET, path, file);
}

export async function uploadGuestReceipt(guestId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `guests/${guestId}/${Date.now()}-${safeName}`;
  return uploadToBucket(RECEIPT_BUCKET, path, file);
}

export async function uploadPaymentProof(bookingId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `bookings/${bookingId}/${Date.now()}-${safeName}`;
  return uploadToBucket(PAYMENT_BUCKET, path, file);
}

export async function uploadPublicPaymentProof(guestEmail: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const emailSafe = guestEmail.replace(/[^a-zA-Z0-9]/g, "_");
  const path = `public/${emailSafe}/${Date.now()}-${safeName}`;
  return uploadToBucket(PAYMENT_BUCKET, path, file);
}

export async function uploadStaffDocument(staffId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `staff/${staffId}/${Date.now()}-${safeName}`;
  return uploadToBucket(STAFF_BUCKET, path, file);
}
