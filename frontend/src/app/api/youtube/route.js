export async function POST(req) {
    const { topic } = await req.json();
  
    const API_KEY = process.env.YOUTUBE_API_KEY;
  
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${topic}+education&type=video&maxResults=6&key=${API_KEY}`
    );
  
    const data = await response.json();
  
    const videos =
      data.items?.map((item) => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        videoId: item.id.videoId,
      })) || [];
  
    return Response.json(videos);
  }