async function updateGitHubData() {
    try {
        const response = await fetch('https://api.github.com/repos/Zimovit/TemplateMaster/releases');
        const releases = await response.json();
        
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
        
    } catch (error) {
        console.log('GitHub API unavailable');
    }
}

document.addEventListener('DOMContentLoaded', updateGitHubData);