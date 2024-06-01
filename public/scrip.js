document.addEventListener('DOMContentLoaded', loadRandomVideos);

async function loadRandomVideos() {
  try {
    const response = await fetch('/random-videos');
    const videos = await response.json();
    displayVideos(videos);
  } catch (error) {
    console.error('Error fetching random videos:', error);
  }
}

async function searchVideos() {
  const query = document.getElementById('searchQuery').value;
  if (!query) {
    alert('Please enter a search query');
    return;
  }

  try {
    const response = await fetch(`/download?q=${encodeURIComponent(query)}`);
    const videos = await response.json();
    displayVideos(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}

function displayVideos(videos) {
  const videoList = document.getElementById('videoList');
  videoList.innerHTML = '';

  videos.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card neon';

    videoCard.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <div class="info">
        <h3>${video.title}</h3>
        <p>${video.channelTitle}</p>
        <p>${new Date(video.publishDate).toLocaleDateString()}</p>
        <p>Views: ${video.viewCount}</p>
        <p>Likes: ${video.likeCount}</p>
        <p>Dislikes: ${video.dislikeCount || 0}</p>
        <p>${video.description.substring(0, 100)}...</p>
        <div class="download-link">
          <a href="${video.downloadLinkMp4}" target="_blank">Download MP4</a>
          <a href="${video.downloadLinkMp3}" target="_blank">Download MP3</a>
        </div>
        <a href="https://www.youtube.com/watch?v=${video.videoId}" class="watch-link" target="_blank">Watch</a>
      </div>
    `;

    videoList.appendChild(videoCard);
  });
}
