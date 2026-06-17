document.addEventListener('DOMContentLoaded', () => {
    const scrapeBtn = document.getElementById('scrape-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resultsContainer = document.getElementById('results-container');
    const btnText = scrapeBtn.querySelector('.btn-text');
    const loader = scrapeBtn.querySelector('.loader');

    let currentVideos = [];

    scrapeBtn.addEventListener('click', async () => {
        // UI State: Loading
        setLoading(true);
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch('/api/trends?limit=5');
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Server returned an error' }));
                throw new Error(errData.message || `Server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                currentVideos = result.data;
                renderVideos(result.data);
                downloadBtn.classList.remove('hidden');
            } else {
                showError(result.message || 'Failed to fetch trends');
                downloadBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error.message.includes('fetch') 
                ? 'Connection timeout. The scraper is still working in the background, please try again in a minute.' 
                : error.message);
        } finally {
            setLoading(false);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (currentVideos.length === 0) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentVideos, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `youtube_trends_${new Date().getTime()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    function setLoading(isLoading) {
        scrapeBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Analysing YouTube (may take 1-2 mins)...';
            loader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Refresh Trends';
            loader.classList.add('hidden');
        }
    }

    function renderVideos(videos) {
        if (!videos || videos.length === 0) {
            resultsContainer.innerHTML = '<div class="empty-state"><p>No trends found for the selected period.</p></div>';
            return;
        }

        const html = videos.map(video => `
            <article class="video-card">
                <div class="thumbnail-wrapper">
                    <img src="${video.thumbnailUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}" alt="${video.title}">
                    <span class="duration-tag">${video.duration}</span>
                </div>
                <div class="video-info">
                    <a href="${video.url}" target="_blank" class="video-title" title="${video.title}">${video.title}</a>
                    <div class="video-stats">
                        <span>👁️ ${formatNumber(video.viewCount)} views</span>
                        ${video.likes ? `<span>👍 ${formatNumber(video.likes)} likes</span>` : ''}
                    </div>
                    <p class="video-desc">${video.description || 'No description available.'}</p>
                    <div class="channel-info">
                        <div class="channel-avatar">🎬</div>
                        <a href="${video.channelUrl}" target="_blank" class="channel-name">${video.channelName}</a>
                    </div>
                </div>
            </article>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="empty-state" style="border-color: #ef4444;">
                <p style="color: #ef4444; font-weight: 600;">Error</p>
                <p>${message}</p>
            </div>
        `;
    }

    function formatNumber(num) {
        if (num === undefined || num === null || isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
});
