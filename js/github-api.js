async function updateGitHubData() {
    const cached = localStorage.getItem('github-data');
    const cacheTime = localStorage.getItem('github-cache-time');
    const now = Date.now();
    
    if (cached && cacheTime && (now - parseInt(cacheTime)) < 3600000) {
        console.log('Using cached GitHub data');
        const releases = JSON.parse(cached);
        updateDOMWithGitHubData(releases);
        return;
    }
    
    try {
        const response = await fetch('https://api.github.com/repos/Zimovit/TemplateMaster/releases');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const releases = await response.json();
        
        localStorage.setItem('github-data', JSON.stringify(releases));
        localStorage.setItem('github-cache-time', now.toString());
        
        console.log('Fetched fresh GitHub data');
        updateDOMWithGitHubData(releases);
        
    } catch (error) {
        console.log('GitHub API unavailable:', error.message);
        
        if (cached) {
            console.log('Using expired cache as fallback');
            const releases = JSON.parse(cached);
            updateDOMWithGitHubData(releases);
        } else {
            console.log('No cache available, using fallback values');
        }
    }
}

function updateDOMWithGitHubData(releases) {
    let totalDownloads = 0;
    releases.forEach(release => {
        release.assets.forEach(asset => {
            totalDownloads += asset.download_count;
        });
    });
    
    const latestRelease = releases[0];
    const latestVersion = releases[0]?.tag_name || 'v1.0.0';
    const downloadUrl = latestRelease?.assets[0]?.browser_download_url;
    
    const counter = document.querySelector('.footer--counter');
    const version = document.querySelector('.app--version');
    const downloadButtons = document.querySelectorAll('.download-button');
    
    if (counter) {
        counter.textContent = `Downloads: ${totalDownloads.toLocaleString()}`;
    }
    if (version) {
        version.textContent = latestVersion;
    }

    if (downloadUrl) {
        downloadButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.open(downloadUrl, '_blank');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', updateGitHubData);