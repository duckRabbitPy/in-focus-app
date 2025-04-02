# Search Query explanation

This SQL query is designed to retrieve distinct photo records from a database, along with associated metadata, based on specific filtering criteria. Here's a breakdown of its functionality:

1. **Columns Selected**: The query retrieves several fields:

   - `p.id`: The unique identifier for each photo.
   - `p.roll_id`: The identifier for the roll (or collection) the photo belongs to.
   - `p.subject`: The subject or title of the photo.
   - `p.photo_url`: The URL where the photo is stored.
   - `p.created_at`: The timestamp when the photo was created.
   - `r.name as roll_name`: The name of the roll, retrieved from the `rolls` table.
   - `ARRAY_AGG(t.name) as tags`: An aggregated array of tag names associated with the photo, collected from the `tags` table.

2. **Tables and Joins**:

   - The query starts with the `photos` table (`p`) as the primary source of data.
   - It joins the `rolls` table (`r`) on the condition that the `roll_id` in `photos` matches the `id` in `rolls`. This allows the query to fetch the roll name for each photo.
   - It further joins the `photo_tags` table (`pt`) to link photos with their associated tags.
   - Finally, it joins the `tags` table (`t`) to retrieve the actual tag names.

3. **Filtering with `WHERE` Clause**:

   - The query filters photos to include only those belonging to a specific user (`r.user_id = $1`). The `$1` is a parameter placeholder, typically replaced with a user ID at runtime.
   - Additionally, the query uses an `EXISTS` subquery to ensure that the photo has at least one tag matching a list of requested tags. The subquery:
     - Checks the `photo_tags` table (`pt2`) for tags associated with the current photo (`pt2.photo_id = p.id`).
     - Joins the `tags` table (`t2`) to access tag names.
     - Filters tags to include only those matching any of the names in the provided list (`t2.name = ANY($2)`). The `$2` is another parameter placeholder, replaced with an array of tag names at runtime.

4. **Distinct Results**:

   - The `SELECT DISTINCT` ensures that duplicate rows are eliminated from the result set, even if a photo is associated with multiple tags.

5. **Aggregating Tags**:
   - The `ARRAY_AGG(t.name)` function collects all tag names associated with a photo into a single array, making it easier to work with tags in the application layer.
