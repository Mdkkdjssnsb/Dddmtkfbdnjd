const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const path = require('path');

const app = express();
const PORT = 3000;
const YOUTUBE_API_KEY = 'AIzaSyBn7qBpnq1dy1RbPJ8t_BsIHz6ESoR00i4';  // Replace with your YouTube Data API key

app.use(express.static(path.join(__dirname, 'public')));

app.get('/random-videos', async (req, res) => {
  try {
    const randomSearches = ['music', 'news', 'sports', 'comedy', 'technology'];
    const randomQuery = randomSearches[Math.floor(Math.random() * randomSearches.length)];
    const searchResults = await yts(randomQuery);

    if (!searchResults || !searchResults.videos.length) {
      return res.status(404).send('No videos found');
    }

    const videos = searchResults.videos;
    const videoDetails = await fetchVideoDetails(videos);

    res.json(videoDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request');
  }
});

app.get('/download', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).send('Query parameter is missing');
  }

  try {
    const searchResults = await yts(query);
    if (!searchResults || !searchResults.videos.length) {
      return res.status(404).send('No videos found');
    }

    const videos = searchResults.videos;
    const videoDetails = await fetchVideoDetails(videos, req);

    res.json(videoDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request');
  }
});

app.get('/download-video', async (req, res) => {
  const videoId = req.query.id;
  const format = req.query.format || 'mp4';
  if (!videoId) {
    return res.status(400).send('Video ID is missing');
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    res.header('Content-Disposition', `attachment; filename="video.${format}"`);

    const formatOptions = format === 'mp3' ? { filter: 'audioonly' } : { format: 'mp4' };
    ytdl(videoUrl, formatOptions).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request');
  }
});

async function fetchVideoDetails(videos, req = null) {
  const videoDetails = await Promise.all(videos.map(async (video) => {
    const videoId = video.videoId;
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(youtubeApiUrl);
    const videoData = response.data.items[0];

    return {
      videoId: videoData.id,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      thumbnail: videoData.snippet.thumbnails.high.url,
      channelTitle: videoData.snippet.channelTitle,
      publishDate: videoData.snippet.publishedAt,
      viewCount: videoData.statistics.viewCount,
      likeCount: videoData.statistics.likeCount,
      dislikeCount: videoData.statistics.dislikeCount,
      downloadLinkMp4: `/download-video?id=${videoId}&format=mp4`,
      downloadLinkMp3: `/download-video?id=${videoId}&format=mp3`,
    };
  }));

  return videoDetails;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
