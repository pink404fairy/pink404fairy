/**
 * Photo Backup Solution for Maria Ruoro's website
 * Handles secure photo backup, encryption, and organization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const API_BASE_URL = 'https://api.mariaruoro.com/api';
    const LOCAL_API_URL = 'http://localhost:3000/api';
    
    // Use local API in development, production API in production
    const apiUrl = window.location.hostname === 'localhost' ? LOCAL_API_URL : API_BASE_URL;
    
    // Cache DOM elements
    const loginForm = document.querySelector('.login-form');
    const fileUploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('fileInput');
    const fileBrowser = document.querySelector('.file-browser');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // State management
    let currentUser = null;
    let currentFolder = null;
    let selectedFiles = [];
    let viewMode = 'grid';
    
    // Check if user is already logged in
    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Verify token validity and get user info
            fetch(`${apiUrl}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Token expired or invalid');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    currentUser = data.user;
                    showDashboard();
                    loadUserFiles();
                } else {
                    showLoginForm();
                }
            })
            .catch(error => {
                console.error('Auth error:', error);
                localStorage.removeItem('authToken');
                showLoginForm();
            });
        } else {
            showLoginForm();
        }
    };
    
    // Show login form
    const showLoginForm = () => {
        // Toggle visibility of login form vs dashboard
        if (loginForm) {
            document.querySelector('.secure-content')?.classList.add('hidden');
            loginForm.parentElement.classList.remove('hidden');
            
            // Set up login form submission
            loginForm.addEventListener('submit', handleLogin);
        }
    };
    
    // Handle login form submission
    const handleLogin = (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        // Send login request to API
        fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                currentUser = data.user;
                
                // Show dashboard
                showDashboard();
                loadUserFiles();
            } else {
                showError(data.message || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showError('A server error occurred. Please try again later.');
        });
    };
    
    // Show error message
    const showError = (message) => {
        const errorEl = document.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    };
    
    // Show dashboard after successful login
    const showDashboard = () => {
        if (loginForm) {
            loginForm.parentElement.classList.add('hidden');
            
            const secureContent = document.querySelector('.secure-content');
            if (secureContent) {
                secureContent.classList.remove('hidden');
                
                // Update user info in the dashboard
                const userNameEl = document.querySelector('.user-name');
                const storageUsed = document.querySelector('.storage-used');
                const storageTotal = document.querySelector('.storage-total');
                const usageFill = document.querySelector('.usage-fill');
                
                if (userNameEl) userNameEl.textContent = currentUser.username;
                if (storageUsed) storageUsed.textContent = formatBytes(currentUser.storageUsed);
                if (storageTotal) storageTotal.textContent = formatBytes(currentUser.storageLimit);
                if (usageFill) {
                    const percentage = currentUser.storagePercentage || (currentUser.storageUsed / currentUser.storageLimit * 100);
                    usageFill.style.width = `${percentage}%`;
                }
            }
        }
    };
    
    // Load user files from API
    const loadUserFiles = (folderId = null) => {
        const token = localStorage.getItem('authToken');
        
        // Construct URL with optional folder ID
        let url = `${apiUrl}/files`;
        if (folderId) {
            url += `?folderId=${folderId}`;
            currentFolder = folderId;
        } else {
            currentFolder = null;
        }
        
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                renderFiles(data.files);
                renderFolders(data.folders || []);
                updateBreadcrumbs(data.currentPath);
            } else {
                showError(data.message || 'Failed to load files');
            }
        })
        .catch(error => {
            console.error('Error loading files:', error);
            showError('Failed to load your files. Please try again later.');
        });
    };
    
    // Render files in the browser
    const renderFiles = (files) => {
        if (!fileBrowser) return;
        
        const filesList = document.querySelector('.files-container');
        if (!filesList) return;
        
        // Clear existing files
        filesList.innerHTML = '';
        
        // Set view mode class
        filesList.className = `files-container ${viewMode}-view`;
        
        // Add files to the browser
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item file';
            fileItem.dataset.fileId = file.id;
            
            // Determine icon based on file type
            let fileIcon = 'fa-file';
            if (file.mimetype.startsWith('image/')) {
                fileIcon = 'fa-image';
            } else if (file.mimetype.startsWith('video/')) {
                fileIcon = 'fa-video';
            } else if (file.mimetype.startsWith('audio/')) {
                fileIcon = 'fa-music';
            }
            
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${fileIcon}"></i>
                </div>
                <div class="file-name">${file.originalFilename}</div>
                <div class="file-info">
                    <span class="file-size">${file.readableSize}</span>
                    <span class="file-date">${new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="file-actions">
                    <button class="file-action download" data-action="download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action delete" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click handlers
            fileItem.addEventListener('click', (e) => {
                if (e.target.closest('.file-action')) {
                    const action = e.target.closest('.file-action').dataset.action;
                    handleFileAction(action, file.id);
                } else {
                    // View file details
                    viewFileDetails(file.id);
                }
            });
            
            filesList.appendChild(fileItem);
        });
        
        // Show empty state if no files
        if (files.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No files in this location</p>
                    <button class="btn upload-btn">Upload Files</button>
                </div>
            `;
            
            const uploadBtn = filesList.querySelector('.upload-btn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => openUploadModal());
            }
        }
    };
    
    // Render folders in the browser
    const renderFolders = (folders) => {
        if (!fileBrowser) return;
        
        const filesList = document.querySelector('.files-container');
        if (!filesList) return;
        
        // Add folders before files
        folders.forEach(folder => {
            const folderItem = document.createElement('div');
            folderItem.className = 'file-item folder';
            folderItem.dataset.folderId = folder.id;
            
            folderItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas fa-folder" style="color: ${folder.color || '#ffc107'}"></i>
                </div>
                <div class="file-name">${folder.name}</div>
                <div class="file-info">
                    <span class="file-count">${folder.fileCount || 0} files</span>
                    <span class="file-date">${new Date(folder.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="folder-actions">
                    <button class="folder-action rename" data-action="rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="folder-action delete" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click handler
            folderItem.addEventListener('click', (e) => {
                if (e.target.closest('.folder-action')) {
                    const action = e.target.closest('.folder-action').dataset.action;
                    handleFolderAction(action, folder.id);
                } else {
                    // Navigate into folder
                    loadUserFiles(folder.id);
                }
            });
            
            // Insert folder at the beginning
            filesList.insertBefore(folderItem, filesList.firstChild);
        });
    };
    
    // Update breadcrumb navigation
    const updateBreadcrumbs = (path = []) => {
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (!breadcrumbs) return;
        
        // Clear existing breadcrumbs
        breadcrumbs.innerHTML = `
            <div class="breadcrumb-item" data-folder-id="null">
                <i class="fas fa-home"></i> Home
            </div>
        `;
        
        // Add path items
        if (Array.isArray(path)) {
            path.forEach(item => {
                const crumb = document.createElement('div');
                crumb.className = 'breadcrumb-item';
                crumb.dataset.folderId = item.id;
                crumb.innerHTML = `<i class="fas fa-chevron-right"></i> ${item.name}`;
                breadcrumbs.appendChild(crumb);
            });
        }
        
        // Add click handlers
        const crumbItems = breadcrumbs.querySelectorAll('.breadcrumb-item');
        crumbItems.forEach(item => {
            item.addEventListener('click', () => {
                const folderId = item.dataset.folderId === 'null' ? null : item.dataset.folderId;
                loadUserFiles(folderId);
            });
        });
    };
    
    // Handle file actions (download, delete)
    const handleFileAction = (action, fileId) => {
        const token = localStorage.getItem('authToken');
        
        switch (action) {
            case 'download':
                // Create a temporary link to download the file
                const downloadLink = document.createElement('a');
                downloadLink.href = `${apiUrl}/files/download/${fileId}`;
                downloadLink.download = true;
                downloadLink.target = '_blank';
                downloadLink.style.display = 'none';
                
                // Add auth token to the link as a query parameter
                downloadLink.href += `?token=${token}`;
                
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                break;
                
            case 'delete':
                if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
                    fetch(`${apiUrl}/files/${fileId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // Reload files
                            loadUserFiles(currentFolder);
                            showError('File deleted successfully');
                        } else {
                            showError(data.message || 'Failed to delete file');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting file:', error);
                        showError('Failed to delete file. Please try again later.');
                    });
                }
                break;
        }
    };
    
    // Handle folder actions (rename, delete)
    const handleFolderAction = (action, folderId) => {
        const token = localStorage.getItem('authToken');
        
        switch (action) {
            case 'rename':
                const newName = prompt('Enter new folder name:');
                if (newName && newName.trim()) {
                    fetch(`${apiUrl}/folders/${folderId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: newName.trim() })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // Reload folders
                            loadUserFiles(currentFolder);
                        } else {
                            showError(data.message || 'Failed to rename folder');
                        }
                    })
                    .catch(error => {
                        console.error('Error renaming folder:', error);
                        showError('Failed to rename folder. Please try again later.');
                    });
                }
                break;
                
            case 'delete':
                if (confirm('Are you sure you want to delete this folder and all its contents? This action cannot be undone.')) {
                    fetch(`${apiUrl}/folders/${folderId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // Reload folders
                            loadUserFiles(currentFolder);
                            showError('Folder deleted successfully');
                        } else {
                            showError(data.message || 'Failed to delete folder');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting folder:', error);
                        showError('Failed to delete folder. Please try again later.');
                    });
                }
                break;
        }
    };
    
    // View file details
    const viewFileDetails = (fileId) => {
        const token = localStorage.getItem('authToken');
        
        fetch(`${apiUrl}/files/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Display file details in a modal
                const fileDetails = data.file;
                
                const detailsModal = document.createElement('div');
                detailsModal.className = 'modal';
                detailsModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>File Details</h2>
                        <div class="file-details-content">
                            <div class="file-preview">
                                ${fileDetails.mimetype.startsWith('image/') ? 
                                  `<img src="${apiUrl}/files/thumbnail/${fileDetails.id}?token=${token}" alt="${fileDetails.originalFilename}">` : 
                                  `<i class="fas fa-file fa-4x"></i>`}
                            </div>
                            <div class="details-list">
                                <p><strong>Name:</strong> ${fileDetails.originalFilename}</p>
                                <p><strong>Size:</strong> ${fileDetails.readableSize}</p>
                                <p><strong>Type:</strong> ${fileDetails.mimetype}</p>
                                <p><strong>Uploaded:</strong> ${new Date(fileDetails.createdAt).toLocaleString()}</p>
                                ${fileDetails.isEncrypted ? '<p><strong>Encryption:</strong> <i class="fas fa-lock"></i> Encrypted</p>' : ''}
                                ${fileDetails.tags && fileDetails.tags.length ? `<p><strong>Tags:</strong> ${fileDetails.tags.join(', ')}</p>` : ''}
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn download-btn">Download</button>
                            <button class="btn rename-btn">Rename</button>
                            <button class="btn move-btn">Move</button>
                            <button class="btn delete-btn">Delete</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(detailsModal);
                
                // Add event listeners
                detailsModal.querySelector('.close-modal').addEventListener('click', () => {
                    document.body.removeChild(detailsModal);
                });
                
                detailsModal.querySelector('.download-btn').addEventListener('click', () => {
                    handleFileAction('download', fileId);
                });
                
                detailsModal.querySelector('.delete-btn').addEventListener('click', () => {
                    handleFileAction('delete', fileId);
                    document.body.removeChild(detailsModal);
                });
                
                detailsModal.querySelector('.rename-btn').addEventListener('click', () => {
                    const newName = prompt('Enter new file name:', fileDetails.originalFilename);
                    if (newName && newName.trim()) {
                        // Update file name
                        fetch(`${apiUrl}/files/${fileId}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ originalFilename: newName.trim() })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                document.body.removeChild(detailsModal);
                                loadUserFiles(currentFolder);
                            } else {
                                showError(data.message || 'Failed to rename file');
                            }
                        })
                        .catch(error => {
                            console.error('Error renaming file:', error);
                            showError('Failed to rename file. Please try again later.');
                        });
                    }
                });
            } else {
                showError(data.message || 'Failed to load file details');
            }
        })
        .catch(error => {
            console.error('Error loading file details:', error);
            showError('Failed to load file details. Please try again later.');
        });
    };
    
    // Open upload modal
    const openUploadModal = () => {
        if (uploadModal) {
            uploadModal.classList.remove('hidden');
            
            // Clear previous files
            selectedFiles = [];
            updateSelectedFilesList();
        }
    };
    
    // Extract metadata from images for thumbnails
    const extractImageMetadata = (file) => {
        return new Promise((resolve) => {
            // Only process image files
            if (!file.type.startsWith('image/')) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Create canvas to generate thumbnail
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set thumbnail dimensions (max 200px while preserving aspect ratio)
                    const maxDimension = 200;
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate thumbnail dimensions preserving aspect ratio
                    if (width > height) {
                        if (width > maxDimension) {
                            height = Math.round(height * (maxDimension / width));
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = Math.round(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }
                    
                    // Resize and draw image
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get thumbnail as Data URL
                    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    // Return metadata
                    resolve({
                        width: img.width,
                        height: img.height,
                        thumbnail: thumbnailDataUrl,
                        aspectRatio: img.width / img.height
                    });
                };
                
                img.onerror = () => {
                    resolve(null);
                };
                
                img.src = event.target.result;
            };
            
            reader.onerror = () => {
                resolve(null);
            };
            
            // Read image as data URL
            reader.readAsDataURL(file);
        });
    };
    
    // Update list of selected files for upload - with thumbnail preview
    const updateSelectedFilesList = () => {
        const selectedFilesList = document.querySelector('.file-list');
        if (!selectedFilesList) return;
        
        selectedFilesList.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            selectedFilesList.innerHTML = '<li class="no-files">No files selected</li>';
            document.getElementById('selectedFiles').style.display = 'none';
            document.getElementById('startUploadBtn').disabled = true;
            return;
        }
        
        // Show the files container
        document.getElementById('selectedFiles').style.display = 'block';
        document.getElementById('startUploadBtn').disabled = false;
        
        // Process each file and add to the list
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('li');
            
            if (file.type.startsWith('image/')) {
                // For images, extract thumbnail immediately or use cached one
                if (!file.metadata) {
                    // Extract metadata and update UI when done
                    extractImageMetadata(file).then(metadata => {
                        if (metadata) {
                            // Store metadata with file object
                            file.metadata = metadata;
                            
                            // Update the preview with the thumbnail
                            const imgPreview = fileItem.querySelector('.file-preview');
                            if (imgPreview) {
                                imgPreview.innerHTML = `<img src="${metadata.thumbnail}" alt="${file.name}">`;
                            }
                        }
                    });
                }
            }
            
            // Create file list item with basic info while thumbnail is loading
            fileItem.innerHTML = `
                <div class="file-preview">
                    ${file.type.startsWith('image/') ? 
                      (file.metadata ? `<img src="${file.metadata.thumbnail}" alt="${file.name}">` : '<div class="thumbnail-loading"><i class="fas fa-spinner fa-spin"></i></div>') : 
                      `<i class="fas fa-file"></i>`}
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatBytes(file.size)}</div>
                </div>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            selectedFilesList.appendChild(fileItem);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                selectedFiles.splice(index, 1);
                updateSelectedFilesList();
            });
        });
    };
    
    // Handle file uploads
    const handleFileUpload = () => {
        if (selectedFiles.length === 0) {
            showError('Please select files to upload');
            return;
        }
        
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        
        // Add all files to form data
        selectedFiles.forEach(file => {
            formData.append('files', file);
            
            // If we have metadata, add it as a JSON string
            if (file.metadata) {
                const metadataJson = JSON.stringify({
                    width: file.metadata.width,
                    height: file.metadata.height,
                    aspectRatio: file.metadata.aspectRatio,
                    takenAt: file.lastModified ? new Date(file.lastModified).toISOString() : null
                });
                
                formData.append('metadata', metadataJson);
                
                // We can also send the thumbnail separately if the server supports it
                if (file.metadata.thumbnail) {
                    // Convert data URL to blob
                    const thumbnailBlob = dataURLToBlob(file.metadata.thumbnail);
                    formData.append('thumbnails', thumbnailBlob, `${file.name}.thumb.jpg`);
                }
            }
        });
        
        // Add folder ID if we're in a subfolder
        if (currentFolder) {
            formData.append('folderId', currentFolder);
        }
        
        // Add encryption option if selected
        const encryptFiles = document.getElementById('encrypt-files')?.checked;
        if (encryptFiles) {
            const password = document.getElementById('encryption-password')?.value;
            
            if (!password) {
                showError('Please enter an encryption password');
                return;
            }
            
            formData.append('isEncrypted', 'true');
            
            // TODO: Implement client-side encryption before upload
            // This would typically involve Web Crypto API
        }
        
        // Show upload progress
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress';
        progressContainer.innerHTML = `
            <h3>Uploading Files</h3>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p class="progress-status">Preparing...</p>
        `;
        
        document.querySelector('.modal-content').appendChild(progressContainer);
        
        // Upload files with progress tracking
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${apiUrl}/files/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                progressContainer.querySelector('.progress-fill').style.width = `${percent}%`;
                progressContainer.querySelector('.progress-status').textContent = `Uploading: ${percent}%`;
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200 || xhr.status === 201) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 'success') {
                        // Close modal and reload files
                        closeUploadModal();
                        loadUserFiles(currentFolder);
                        showError(`${selectedFiles.length} file(s) uploaded successfully`);
                    } else {
                        showError(response.message || 'Upload failed');
                    }
                } catch (error) {
                    showError('Error processing server response');
                }
            } else {
                showError(`Upload failed with status: ${xhr.status}`);
            }
        });
        
        xhr.addEventListener('error', () => {
            showError('Upload failed due to network error');
        });
        
        xhr.send(formData);
    };
    
    // Close upload modal
    const closeUploadModal = () => {
        if (uploadModal) {
            uploadModal.classList.add('hidden');
            
            // Remove any progress indicators
            const progressContainer = document.querySelector('.upload-progress');
            if (progressContainer) {
                progressContainer.remove();
            }
        }
    };
    
    // Format bytes to human-readable size
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    // Helper function to convert data URL to Blob
    const dataURLToBlob = (dataURL) => {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    };
    
    // Set up event listeners
    const setupEventListeners = () => {
        // File upload area
        if (fileUploadArea) {
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });
            
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('drag-over');
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                
                if (e.dataTransfer.files.length > 0) {
                    // Add dropped files to selected files
                    Array.from(e.dataTransfer.files).forEach(file => {
                        selectedFiles.push(file);
                    });
                    
                    updateSelectedFilesList();
                }
            });
            
            fileUploadArea.addEventListener('click', () => {
                // Trigger file input click
                fileInput.click();
            });
        }
        
        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    // Add selected files to the array
                    Array.from(fileInput.files).forEach(file => {
                        selectedFiles.push(file);
                    });
                    
                    updateSelectedFilesList();
                    
                    // Reset input to allow selecting the same file again
                    fileInput.value = '';
                }
            });
        }
        
        // Open upload modal button
        const openUploadBtn = document.getElementById('uploadBtn');
        if (openUploadBtn) {
            openUploadBtn.addEventListener('click', openUploadModal);
        }
        
        // Upload button in modal
        const startUploadBtn = document.getElementById('startUploadBtn');
        if (startUploadBtn) {
            startUploadBtn.addEventListener('click', handleFileUpload);
        }
        
        // Close modal button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeUploadModal);
        }
        
        // Create folder button
        const createFolderBtn = document.getElementById('createFolderBtn');
        if (createFolderBtn) {
            createFolderBtn.addEventListener('click', () => {
                const folderName = prompt('Enter folder name:');
                if (folderName && folderName.trim()) {
                    const token = localStorage.getItem('authToken');
                    
                    fetch(`${apiUrl}/folders`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: folderName.trim(),
                            parentId: currentFolder
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            loadUserFiles(currentFolder);
                        } else {
                            showError(data.message || 'Failed to create folder');
                        }
                    })
                    .catch(error => {
                        console.error('Error creating folder:', error);
                        showError('Failed to create folder. Please try again later.');
                    });
                }
            });
        }
        
        // Additional password checkbox for encryption
        const additionalPasswordCheckbox = document.getElementById('additionalPassword');
        const passwordInputContainer = document.getElementById('passwordInputContainer');
        
        if (additionalPasswordCheckbox && passwordInputContainer) {
            additionalPasswordCheckbox.addEventListener('change', () => {
                passwordInputContainer.style.display = additionalPasswordCheckbox.checked ? 'block' : 'none';
            });
        }
        
        // Toggle view mode buttons
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                viewMode = button.dataset.view;
                
                // Update active button
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update the files container class
                const filesContainer = document.querySelector('.files-container');
                if (filesContainer) {
                    filesContainer.className = `files-container ${viewMode}-view`;
                }
            });
        });
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                currentUser = null;
                showLoginForm();
            });
        }
    };
    
    // Initialize the app
    const init = () => {
        checkAuth();
        setupEventListeners();
    };
    
    // Run initialization
    init();
}); 