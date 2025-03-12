export interface ImageResult {
    link: string;
    title: string;
    snippet: string;
    image: {
      contextLink: string;
      height: number;
      width: number;
      thumbnailLink: string;
      thumbnailHeight: number;
      thumbnailWidth: number;
    };
  }
  
  export const searchImages = async (query: string): Promise<ImageResult[] | null> => {
    try {
      const searchQuery = `${query} advertisement`;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
  
      if (!apiKey || !searchEngineId) {
        console.error('Missing API key or Search Engine ID');
        return null;
      }
  
      // Make the API request
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=8`
      );
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(
          `Error fetching images: Status ${response.status} - ${response.statusText || "No status text provided"}`
        );
        console.error(`Error details: ${errorDetails}`);
        return null;
      }
  
      // Parse JSON response
      const data: { items: ImageResult[] } = await response.json();
  
      // Warn if no items are found
      if (!data.items || data.items.length === 0) {
        console.warn("No image results found.");
        return [];
      }
  
      return data.items; // Return the image results
    } catch (error) {
      // Handle unexpected errors
      if (error instanceof Error) {
        console.error("Error during API call:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
      return null;
    }
  };