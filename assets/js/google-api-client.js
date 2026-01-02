// ========================================
// GOOGLE API CLIENT - FRONTEND
// ========================================

class GoogleAPIClient {
  constructor(workerUrl) {
    this.workerUrl = workerUrl;
  }

  // ========================================
  // YOUTUBE SEARCH
  // ========================================
  async searchYouTube(query, maxResults = 10, order = 'relevance') {
    try {
      const url = `${this.workerUrl}/youtube/search?` +
        `q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=${order}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'YouTube search failed');
      }

      return {
        totalResults: data.pageInfo.totalResults,
        videos: data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        }))
      };
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  // ========================================
  // YOUTUBE VIDEO DETAILS
  // ========================================
  async getVideoDetails(videoId) {
    try {
      const url = `${this.workerUrl}/youtube/video?id=${videoId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
        duration: video.contentDetails.duration,
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount),
        commentCount: parseInt(video.statistics.commentCount)
      };
    } catch (error) {
      console.error('Video details error:', error);
      throw error;
    }
  }

  // ========================================
  // GOOGLE CUSTOM SEARCH
  // ========================================
  async search(query, start = 1, num = 10) {
    try {
      const url = `${this.workerUrl}/search?` +
        `q=${encodeURIComponent(query)}&start=${start}&num=${num}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      return {
        totalResults: data.searchInformation.totalResults,
        searchTime: data.searchInformation.searchTime,
        results: data.items ? data.items.map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          image: item.pagemap?.cse_image?.[0]?.src
        })) : []
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}

// ========================================
// INITIALISATION
// ========================================
const googleAPI = new GoogleAPIClient('https://google-apis-proxy.TonUsername.workers.dev');