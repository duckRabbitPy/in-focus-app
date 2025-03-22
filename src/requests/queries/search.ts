import { SearchResponse, SearchResponseSchema } from "@/types/search";
import { fetchWithAuth } from "@/utils/auth";

type SearchPhotosByTagsParams = {
  user_id: string;
  tags: string[];
};

export const searchPhotosByTags = async ({
  user_id,
  tags,
}: SearchPhotosByTagsParams): Promise<SearchResponse> => {
  const queryParams = new URLSearchParams();
  tags.forEach((tag) => queryParams.append("tags", tag));

  const url = `/api/user/${user_id}/search?${queryParams}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  const data = await response.json();
  return SearchResponseSchema.parse(data);
};
