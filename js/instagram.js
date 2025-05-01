/**
 * Blue Rose Initiative - Instagram API Integration
 * 
 * This file handles the integration with Instagram Graph API to display
 * posts and stories from the client's Instagram account.
 */

// Instagram API Configuration Object
const instagramConfig = {
    // Your Instagram App ID from Facebook Developer account
    appId: 'YOUR_APP_ID',
    // Your Instagram App Secret from Facebook Developer account
    appSecret: 'YOUR_APP_SECRET',
    // The Instagram Business/Creator Account ID
    instagramAccountId: 'YOUR_INSTAGRAM_ACCOUNT_ID',
    // Access token from Facebook Developer account (with instagram_basic permission)
    accessToken: 'YOUR_ACCESS_TOKEN',
    // Number of posts to fetch
    postLimit: 6,
    // Number of stories to fetch (if available in API)
    storyLimit: 5,
    // Endpoint for Instagram Graph API
    apiBaseUrl: 'https://graph.instagram.com/v13.0'
};

/**
 * Initialize Instagram integration when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initInstagramFeed();
});

/**
 * Initialize Instagram feed by fetching data and rendering it
 */
function initInstagramFeed() {
    // Check if the stories section exists on the page
    const storiesContainer = document.querySelector('.stories-container');
    if (storiesContainer) {
        fetchInstagramStories(storiesContainer);
    }
    
    // Check if gallery section exists
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        fetchInstagramPosts(galleryGrid);
    }
}

/**
 * Fetch Instagram posts using the Graph API
 * @param {HTMLElement} container - The container to render posts into
 */
function fetchInstagramPosts(container) {
    // In a real implementation, you would make an API call like this:
    // const endpoint = `${instagramConfig.apiBaseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${instagramConfig.postLimit}&access_token=${instagramConfig.accessToken}`;
    
    // For demonstration, we'll simulate a successful API response
    simulateInstagramPostsFetch(container);
}

/**
 * Fetch Instagram stories using the Graph API
 * Note: The standard Instagram Graph API has limitations for stories
 * A business account and additional permissions are required
 * @param {HTMLElement} container - The container to render stories into
 */
function fetchInstagramStories(container) {
    // In a real implementation, you would make an API call
    // Note: Stories require special permissions and a business account
    
    // For demonstration, we'll simulate a successful API response
    simulateInstagramStoriesFetch(container);
}

/**
 * Simulate a successful Instagram posts fetch for demonstration
 * In production, replace with actual API calls
 * @param {HTMLElement} container - The gallery container
 */
function simulateInstagramPostsFetch(container) {
    // Clear loading state or placeholder content
    container.innerHTML = '';
    
    // Simulated Instagram post data
    const mockPosts = [
        {
            id: '1',
            media_url: 'images/gallery1.jpg',
            caption: 'Supporting children in marginalized communities.',
            permalink: '#'
        },
        {
            id: '2',
            media_url: 'images/gallery2.jpg',
            caption: 'Our elder care program in action.',
            permalink: '#'
        },
        {
            id: '3',
            media_url: 'images/gallery3.jpg',
            caption: 'Building a better future together.',
            permalink: '#'
        },
        {
            id: '4',
            media_url: 'images/gallery4.jpg',
            caption: 'Community outreach and education.',
            permalink: '#'
        },
        {
            id: '5',
            media_url: 'images/gallery5.jpg',
            caption: 'Creating moments of joy and connection.',
            permalink: '#'
        },
        {
            id: '6',
            media_url: 'images/gallery6.jpg',
            caption: 'Celebrating our volunteers and supporters.',
            permalink: '#'
        }
    ];
    
    // Render each post
    mockPosts.forEach((post, index) => {
        const postItem = document.createElement('div');
        postItem.className = 'gallery-item';
        
        postItem.innerHTML = `
            <a href="${post.permalink}" target="_blank" rel="noopener" class="instagram-link">
                <div class="gallery-image img${index + 1}" title="${post.caption}">
                    <div class="instagram-overlay">
                        <i class="fab fa-instagram"></i>
                    </div>
                </div>
            </a>
        `;
        
        container.appendChild(postItem);
        
        // Add event listener to handle click
        postItem.querySelector('.instagram-link').addEventListener('click', (e) => {
            // If in demo mode without real links, prevent default and show message
            if (post.permalink === '#') {
                e.preventDefault();
                alert('This is a demo. In production, this would link to the actual Instagram post.');
            }
        });
    });
    
    // Update the "View More" link
    const galleryCtaLink = document.querySelector('.gallery-cta .btn');
    if (galleryCtaLink) {
        galleryCtaLink.href = 'https://www.instagram.com/BlueRoseInitiative';
        galleryCtaLink.target = '_blank';
        galleryCtaLink.rel = 'noopener';
    }
}

/**
 * Simulate a successful Instagram stories fetch for demonstration
 * In production, replace with actual API calls
 * @param {HTMLElement} container - The stories container
 */
function simulateInstagramStoriesFetch(container) {
    // Clear loading state or placeholder content
    container.innerHTML = '';
    
    // Simulated Instagram stories data
    const mockStories = [
        {
            id: '1',
            media_url: 'images/story1.jpg',
            caption: 'Community Day'
        },
        {
            id: '2',
            media_url: 'images/story2.jpg',
            caption: 'Helping Hands'
        },
        {
            id: '3',
            media_url: 'images/story3.jpg',
            caption: 'Elder Care'
        },
        {
            id: '4',
            media_url: 'images/story4.jpg',
            caption: 'Education'
        },
        {
            id: '5',
            media_url: 'images/story5.jpg',
            caption: 'Celebrations'
        }
    ];
    
    // Render each story
    mockStories.forEach((story, index) => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        
        storyItem.innerHTML = `
            <div class="story-circle">
                <div class="story-image si${index + 1}" title="${story.caption}"></div>
            </div>
            <p>${story.caption}</p>
        `;
        
        container.appendChild(storyItem);
        
        // Add click event to open story viewer
        storyItem.querySelector('.story-circle').addEventListener('click', () => {
            openStoryViewer(mockStories, index);
        });
    });
    
    // Update the Instagram username link
    const instaLink = document.querySelector('.insta-link');
    if (instaLink) {
        instaLink.href = 'https://www.instagram.com/BlueRoseInitiative';
        instaLink.target = '_blank';
        instaLink.rel = 'noopener';
    }
}

/**
 * Create and open a full-screen story viewer similar to Instagram's
 * @param {Array} stories - Array of story objects
 * @param {Number} startIndex - Index of story to start with
 */
function openStoryViewer(stories, startIndex = 0) {
    // Create story viewer container
    const viewer = document.createElement('div');
    viewer.className = 'instagram-story-viewer';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'story-close-btn';
    closeBtn.innerHTML = '&times;';
    viewer.appendChild(closeBtn);
    
    // Add story content
    const storyContent = document.createElement('div');
    storyContent.className = 'story-content';
    viewer.appendChild(storyContent);
    
    // Add navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'story-nav-btn prev-btn';
    prevBtn.innerHTML = '‹';
    viewer.appendChild(prevBtn);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'story-nav-btn next-btn';
    nextBtn.innerHTML = '›';
    viewer.appendChild(nextBtn);
    
    // Add progress indicators
    const progressContainer = document.createElement('div');
    progressContainer.className = 'story-progress-container';
    stories.forEach(() => {
        const progressBar = document.createElement('div');
        progressBar.className = 'story-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'story-progress-fill';
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
    });
    viewer.appendChild(progressContainer);
    
    // Add to DOM
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Current story index
    let currentIndex = startIndex;
    let progressTimeout;
    
    // Function to show a specific story
    function showStory(index) {
        // Clear any existing timeout
        if (progressTimeout) {
            clearTimeout(progressTimeout);
        }
        
        // Validate index
        if (index < 0) index = stories.length - 1;
        if (index >= stories.length) index = 0;
        
        currentIndex = index;
        
        // Update story content
        const story = stories[currentIndex];
        storyContent.innerHTML = `
            <div class="story-image-container" 
                 style="background-image: url('${story.media_url}');">
                <div class="story-caption">${story.caption}</div>
            </div>
        `;
        
        // Reset all progress bars
        const progressBars = document.querySelectorAll('.story-progress-fill');
        progressBars.forEach((bar, i) => {
            if (i < currentIndex) {
                bar.style.width = '100%';
            } else if (i === currentIndex) {
                bar.style.width = '0';
                // Animate the current progress bar
                bar.style.transition = 'width 5s linear';
                bar.style.width = '100%';
            } else {
                bar.style.width = '0';
                bar.style.transition = 'none';
            }
        });
        
        // Auto-advance after 5 seconds
        progressTimeout = setTimeout(() => {
            showStory(currentIndex + 1);
        }, 5000);
    }
    
    // Initialize with the first story
    showStory(currentIndex);
    
    // Event listeners
    closeBtn.addEventListener('click', () => {
        if (progressTimeout) {
            clearTimeout(progressTimeout);
        }
        document.body.removeChild(viewer);
        document.body.style.overflow = '';
    });
    
    prevBtn.addEventListener('click', () => {
        showStory(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        showStory(currentIndex + 1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function storyKeyNav(e) {
        if (e.key === 'Escape') {
            closeBtn.click();
            document.removeEventListener('keydown', storyKeyNav);
        } else if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });
}

/**
 * When in production, replace placeholder functions with real API calls:
 * 
 * Example of a real Instagram API fetch:
 * 
 * async function fetchFromInstagramAPI(endpoint) {
 *     try {
 *         const response = await fetch(endpoint);
 *         const data = await response.json();
 *         
 *         if (response.ok) {
 *             return data;
 *         } else {
 *             console.error('Instagram API error:', data);
 *             return null;
 *         }
 *     } catch (error) {
 *         console.error('Error fetching from Instagram API:', error);
 *         return null;
 *     }
 * }
 */ 

// // js/instagram.js
// async function loadInstagramFeed() {
//     try {
//       const response = await fetch('https://your-serverless-function.url/instagram');
//       const data = await response.json();
//       // Render gallery
//     } catch (error) {
//       console.error('Error loading Instagram:', error);
//     }
//   }