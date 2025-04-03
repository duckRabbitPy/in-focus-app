import { SearchResponse, SearchResponseSchema } from "@/types/search";
import { fetchWithAuth } from "@/utils/auth";

type SearchPhotosByTagsParams = {
  user_id: string;
  tags: string[];
  searchTerm: string | null;
  page?: number;
  pageSize?: number;
};

export const searchPhotosByTags = async ({
  user_id,
  tags,
  searchTerm,
  page,
  pageSize,
}: SearchPhotosByTagsParams): Promise<SearchResponse> => {
  const queryParams = new URLSearchParams();
  tags.forEach((tag) => queryParams.append("tags", tag));
  queryParams.append("searchTerm", searchTerm || "");
  queryParams.append("page", page?.toString() || "1");
  queryParams.append("pageSize", pageSize?.toString() || "20");

  const url = `/api/user/${user_id}/search?${queryParams}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  const data = await response.json();
  return SearchResponseSchema.parse(data);
};
