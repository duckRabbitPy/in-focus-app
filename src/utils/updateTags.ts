import { query, queryOne } from "@/utils/db";

/**
 * Updates the tags for a photo
 * @param photoId - The ID of the photo
 * @param tags - Array of tag names to assign to the photo
 * @param userId - The user ID (for permissions)
 * @returns Array of tag names that were successfully assigned
 */

export async function updatePhotoTags(
  photoId: number,
  tags: string[] | undefined,
  userId: string
): Promise<string[]> {
  // If tags aren't provided or not an array, return empty array
  if (!Array.isArray(tags)) {
    return [];
  }

  // Delete existing photo_tags associations
  await query("DELETE FROM photo_tags WHERE photo_id = $1", [photoId]);

  // If there are no tags to add, return empty array
  if (tags.length === 0) {
    return [];
  }

  // Get tag IDs for the provided tag names, ensuring they belong to the user
  const tagRows = await query<{ id: number }>(
    "SELECT id FROM tags WHERE user_id = $1 AND name = ANY($2)",
    [userId, tags]
  );

  // Insert the new photo_tags associations
  if (tagRows.length > 0) {
    const tagValues = tagRows
      .map((tag) => `(${photoId}, ${tag.id})`)
      .join(", ");

    await query(
      `INSERT INTO photo_tags (photo_id, tag_id) VALUES ${tagValues}`
    );
  }

  // Get the updated tags
  const updatedTags = await query<{ name: string }>(
    `SELECT t.name FROM tags t
     JOIN photo_tags pt ON t.id = pt.tag_id
     WHERE pt.photo_id = $1`,
    [photoId]
  );

  return updatedTags.map((tag) => tag.name);
}

/**
 * Updates the lens for a photo
 * @param photoId - The ID of the photo
 * @param lensName - The name of the lens to assign
 * @param userId - The user ID (for permissions)
 * @returns The name of the lens that was assigned, or null if none
 */
export async function updatePhotoLens(
  photoId: number,
  lensName: string | undefined | null,
  userId: string
): Promise<string | null> {
  // Delete existing photo_lenses associations
  await query("DELETE FROM photo_lenses WHERE photo_id = $1", [photoId]);

  // If a lens name was not provided or is explicitly null, return null
  if (lensName === undefined || lensName === null) {
    return null;
  }

  // Get lens ID for the provided lens name, ensuring it belongs to the user
  const lensRow = await queryOne<{ id: number }>(
    "SELECT id FROM lenses WHERE user_id = $1 AND name = $2",
    [userId, lensName]
  );

  // If the lens exists and belongs to the user, insert the new association
  if (lensRow) {
    await query(
      "INSERT INTO photo_lenses (photo_id, lens_id) VALUES ($1, $2)",
      [photoId, lensRow.id]
    );
  }

  // Get the updated lens
  const updatedLens = await queryOne<{ name: string }>(
    `SELECT l.name FROM lenses l
     JOIN photo_lenses pl ON l.id = pl.lens_id
     WHERE pl.photo_id = $1
     LIMIT 1`,
    [photoId]
  );

  return updatedLens?.name || null;
}

/**
 * Fetches all tags for a photo
 * @param photoId - The ID of the photo
 * @returns Array of tag names
 */
export async function getPhotoTags(photoId: number): Promise<string[]> {
  const tagResults = await query<{ name: string }>(
    `SELECT t.name
     FROM tags t
     JOIN photo_tags pt ON t.id = pt.tag_id
     WHERE pt.photo_id = $1`,
    [photoId]
  );

  return tagResults.map((tag) => tag.name);
}

export async function getTagsForPhotos(
  photoIds: number[]
): Promise<Record<number, string[]>> {
  if (photoIds.length === 0) return {};

  const tagResults = await query<{ photo_id: number; name: string }>(
    `SELECT pt.photo_id, t.name
     FROM tags t
     JOIN photo_tags pt ON t.id = pt.tag_id
     WHERE pt.photo_id = ANY($1)
     ORDER BY pt.photo_id, t.name`,
    [photoIds]
  );

  const tagsByPhotoId: Record<number, string[]> = {};

  photoIds.forEach((id) => {
    tagsByPhotoId[id] = [];
  });

  tagResults.forEach((row) => {
    tagsByPhotoId[row.photo_id].push(row.name);
  });

  return tagsByPhotoId;
}

/**
 * Fetches the lens for a photo
 * @param photoId - The ID of the photo
 * @returns Lens name or null if no lens is assigned
 */
export async function getPhotoLens(photoId: number): Promise<string | null> {
  const lens = await queryOne<{ name: string }>(
    `SELECT l.name
     FROM lenses l
     JOIN photo_lenses pl ON l.id = pl.lens_id
     WHERE pl.photo_id = $1
     LIMIT 1`,
    [photoId]
  );

  return lens?.name || null;
}
