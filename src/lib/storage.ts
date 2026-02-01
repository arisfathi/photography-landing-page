import { supabase } from "@/lib/supabaseClient";

/**
 * Upload a file to Supabase Storage
 * @param bucket Bucket name (e.g., "site-assets")
 * @param folder Folder prefix (e.g., "logo", "hero")
 * @param file File object to upload
 * @returns Public URL of uploaded file or null if error
 */
export async function uploadToStorage(
  bucket: string,
  folder: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  if (!file) return null;

  try {
    // Create unique filename: folder/timestamp-originalname
    const timestamp = Date.now();
    const filename = `${file.name.split(".")[0]}-${timestamp}.${file.name.split(".").pop()}`;
    const filePath = `${folder}/${filename}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("Failed to get public URL");
      return null;
    }

    return {
      url: data.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Storage error:", error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket Bucket name
 * @param filePath Full path to file
 * @returns true if deleted, false if error
 */
export async function deleteFromStorage(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Storage error:", error);
    return false;
  }
}
