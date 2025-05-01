/**
 * Maria Ruoro Website - Encryption Module
 * 
 * This file handles client-side encryption for the secure photo backup feature.
 * It uses the Web Crypto API to perform AES-256-GCM encryption.
 */

// Encryption configuration
const encryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256, // bits
    ivLength: 12, // bytes
    saltLength: 16, // bytes
    iterations: 100000, // for key derivation
    tagLength: 128, // bits
};

// DOM elements
let uploadBtn;
let createFolderBtn;
let logoutBtn;
let uploadModal;
let closeModalBtn;
let cancelUploadBtn;
let dropZone;
let fileInput;
let fileList;
let selectedFilesContainer;
let additionalPasswordCheckbox;
let passwordInputContainer;
let filePasswordInput;
let startUploadBtn;

/**
 * Initialize encryption features when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the secure backup page
    if (!window.location.pathname.includes('secure-backup.html')) {
        return;
    }
    
    // Initialize UI elements
    initUIElements();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize UI elements
 */
function initUIElements() {
    // Dashboard buttons
    uploadBtn = document.getElementById('uploadBtn');
    createFolderBtn = document.getElementById('createFolderBtn');
    logoutBtn = document.getElementById('logoutBtn');
    
    // Modal elements
    uploadModal = document.getElementById('uploadModal');
    closeModalBtn = document.querySelector('.close-modal');
    cancelUploadBtn = document.querySelector('.cancel-upload');
    
    // File upload elements
    dropZone = document.getElementById('dropZone');
    fileInput = document.getElementById('fileInput');
    fileList = document.getElementById('fileList');
    selectedFilesContainer = document.getElementById('selectedFiles');
    
    // Encryption options
    additionalPasswordCheckbox = document.getElementById('additionalPassword');
    passwordInputContainer = document.getElementById('passwordInputContainer');
    filePasswordInput = document.getElementById('filePassword');
    
    // Upload button
    startUploadBtn = document.getElementById('startUploadBtn');
}

/**
 * Set up event listeners for encryption-related UI
 */
function setupEventListeners() {
    if (!uploadBtn) return; // Exit if elements aren't found
    
    // Dashboard buttons
    uploadBtn.addEventListener('click', showUploadModal);
    createFolderBtn.addEventListener('click', handleCreateFolder);
    logoutBtn.addEventListener('click', logoutUser);
    
    // Modal controls
    closeModalBtn.addEventListener('click', hideUploadModal);
    cancelUploadBtn.addEventListener('click', hideUploadModal);
    
    // File upload
    fileInput.addEventListener('change', handleFileSelection);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Encryption options
    additionalPasswordCheckbox.addEventListener('change', togglePasswordInput);
    
    // Upload button
    startUploadBtn.addEventListener('click', handleEncryptAndUpload);
}

/**
 * Show the upload modal
 */
function showUploadModal() {
    uploadModal.style.display = 'block';
    // Reset the form
    fileInput.value = '';
    fileList.innerHTML = '';
    selectedFilesContainer.style.display = 'none';
    additionalPasswordCheckbox.checked = false;
    passwordInputContainer.style.display = 'none';
    startUploadBtn.disabled = true;
}

/**
 * Hide the upload modal
 */
function hideUploadModal() {
    uploadModal.style.display = 'none';
}

/**
 * Handle file selection from the file input
 * @param {Event} event - Change event
 */
function handleFileSelection(event) {
    const files = event.target.files;
    if (files.length > 0) {
        displaySelectedFiles(files);
    }
}

/**
 * Handle drag over event for the drop zone
 * @param {Event} event - Drag event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('drag-over');
}

/**
 * Handle drag leave event for the drop zone
 * @param {Event} event - Drag event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('drag-over');
}

/**
 * Handle file drop event for the drop zone
 * @param {Event} event - Drop event
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        displaySelectedFiles(files);
    }
}

/**
 * Display selected files in the UI
 * @param {FileList} files - Selected files
 */
function displaySelectedFiles(files) {
    // Clear previous list
    fileList.innerHTML = '';
    
    // Create list items for each file
    Array.from(files).forEach(file => {
        const listItem = document.createElement('li');
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        listItem.innerHTML = `
            <div class="file-preview">
                <i class="fas fa-image"></i>
            </div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
        `;
        
        // If it's an image, show a thumbnail
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                listItem.querySelector('.file-preview').innerHTML = '';
                listItem.querySelector('.file-preview').appendChild(img);
            };
            reader.readAsDataURL(file);
        }
        
        fileList.appendChild(listItem);
    });
    
    // Show the selected files container
    selectedFilesContainer.style.display = 'block';
    
    // Enable the upload button
    startUploadBtn.disabled = false;
}

/**
 * Format file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Toggle the password input field based on checkbox state
 */
function togglePasswordInput() {
    passwordInputContainer.style.display = additionalPasswordCheckbox.checked ? 'block' : 'none';
}

/**
 * Handle folder creation
 */
function handleCreateFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        // In a real implementation, you would send this to the server
        // For now, we'll just simulate creating a folder
        alert(`Folder "${folderName}" created successfully.`);
        
        // Simulate adding the folder to the UI
        const filesContainer = document.querySelector('.files-container');
        const newFolder = document.createElement('div');
        newFolder.className = 'file-item folder';
        newFolder.innerHTML = `
            <div class="file-icon"><i class="fas fa-folder"></i></div>
            <div class="file-name">${folderName}</div>
            <div class="file-info">Last updated: Just now</div>
        `;
        filesContainer.insertBefore(newFolder, filesContainer.firstChild);
    }
}

/**
 * Handle the encrypt and upload process
 */
async function handleEncryptAndUpload() {
    const files = fileInput.files;
    if (files.length === 0) return;
    
    // Show loading state
    startUploadBtn.disabled = true;
    startUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
    
    try {
        // Get the password if additional protection is enabled
        let additionalPassword = null;
        if (additionalPasswordCheckbox.checked) {
            additionalPassword = filePasswordInput.value;
            if (!additionalPassword) {
                alert('Please enter the additional password.');
                startUploadBtn.disabled = false;
                startUploadBtn.innerHTML = 'Encrypt & Upload';
                return;
            }
        }
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Read the file
            const fileBuffer = await readFileAsArrayBuffer(file);
            
            // Encrypt the file
            const encryptedData = await encryptFile(fileBuffer, additionalPassword);
            
            // In a real implementation, you would upload the encrypted data to the server
            // For now, we'll just simulate the upload
            await simulateUpload(file.name, encryptedData);
            
            // Update progress in UI
            const progress = Math.round(((i + 1) / files.length) * 100);
            startUploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading... ${progress}%`;
        }
        
        // Show success message
        startUploadBtn.innerHTML = '<i class="fas fa-check"></i> Upload Complete';
        startUploadBtn.style.backgroundColor = '#4CAF50';
        
        // Reset after 2 seconds
        setTimeout(() => {
            hideUploadModal();
            startUploadBtn.disabled = false;
            startUploadBtn.innerHTML = 'Encrypt & Upload';
            startUploadBtn.style.backgroundColor = '';
            
            // Simulate adding files to the UI
            addFilesToUI(files);
        }, 2000);
        
    } catch (error) {
        console.error('Encryption or upload error:', error);
        alert('An error occurred during encryption or upload. Please try again.');
        startUploadBtn.disabled = false;
        startUploadBtn.innerHTML = 'Encrypt & Upload';
    }
}

/**
 * Read a file as ArrayBuffer
 * @param {File} file - File to read
 * @returns {Promise<ArrayBuffer>} - File contents as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Encrypt a file using AES-GCM
 * @param {ArrayBuffer} fileBuffer - File contents
 * @param {string|null} password - Optional additional password
 * @returns {Promise<Object>} - Encrypted data object
 */
async function encryptFile(fileBuffer, password = null) {
    try {
        // Generate a random encryption key
        const encryptionKey = await generateEncryptionKey();
        
        // Generate a random IV (Initialization Vector)
        const iv = crypto.getRandomValues(new Uint8Array(encryptionConfig.ivLength));
        
        // Encrypt the file
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: encryptionConfig.algorithm,
                iv: iv,
                tagLength: encryptionConfig.tagLength
            },
            encryptionKey,
            fileBuffer
        );
        
        // Export the key
        const exportedKey = await crypto.subtle.exportKey('raw', encryptionKey);
        
        // If additional password is provided, encrypt the key with it
        let protectedKey = new Uint8Array(exportedKey);
        let keySalt = null;
        
        if (password) {
            // Generate a salt for key derivation
            keySalt = crypto.getRandomValues(new Uint8Array(encryptionConfig.saltLength));
            
            // Derive a key from the password
            const passwordKey = await deriveKeyFromPassword(password, keySalt);
            
            // Generate a new IV for key encryption
            const keyIv = crypto.getRandomValues(new Uint8Array(encryptionConfig.ivLength));
            
            // Encrypt the file encryption key with the password-derived key
            const encryptedKeyBuffer = await crypto.subtle.encrypt(
                {
                    name: encryptionConfig.algorithm,
                    iv: keyIv,
                    tagLength: encryptionConfig.tagLength
                },
                passwordKey,
                exportedKey
            );
            
            // Store the encrypted key
            protectedKey = new Uint8Array(encryptedKeyBuffer);
            
            // Return the encrypted data with key encryption info
            return {
                encryptedData: new Uint8Array(encryptedBuffer),
                encryptedKey: protectedKey,
                iv: iv,
                keyIv: keyIv,
                keySalt: keySalt,
                isKeyProtected: true
            };
        }
        
        // Return the encrypted data
        return {
            encryptedData: new Uint8Array(encryptedBuffer),
            encryptedKey: protectedKey,
            iv: iv,
            isKeyProtected: false
        };
        
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt file');
    }
}

/**
 * Generate a random encryption key
 * @returns {Promise<CryptoKey>} - Generated encryption key
 */
async function generateEncryptionKey() {
    return crypto.subtle.generateKey(
        {
            name: encryptionConfig.algorithm,
            length: encryptionConfig.keyLength
        },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Derive a key from a password using PBKDF2
 * @param {string} password - Password to derive key from
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} - Derived key
 */
async function deriveKeyFromPassword(password, salt) {
    // Convert password to buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    
    // Derive a key using PBKDF2
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: encryptionConfig.iterations,
            hash: 'SHA-256'
        },
        passwordKey,
        {
            name: encryptionConfig.algorithm,
            length: encryptionConfig.keyLength
        },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Simulate uploading a file to the server
 * @param {string} fileName - Name of the file
 * @param {Object} encryptedData - Encrypted file data
 * @returns {Promise<void>} - Resolves when upload is complete
 */
function simulateUpload(fileName, encryptedData) {
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            console.log(`File "${fileName}" encrypted and ready for upload:`, encryptedData);
            resolve();
        }, 500 + Math.random() * 1000); // Random delay between 500ms and 1500ms
    });
}

/**
 * Add uploaded files to the UI
 * @param {FileList} files - Uploaded files
 */
function addFilesToUI(files) {
    const filesContainer = document.querySelector('.files-container');
    
    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item file';
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-icon"><i class="fas fa-image"></i></div>
            <div class="file-name">${file.name}</div>
            <div class="file-info">${fileSize} • Added just now</div>
        `;
        
        filesContainer.appendChild(fileItem);
    });
    
    // Update storage usage
    updateStorageUsage(files);
}

/**
 * Update storage usage display
 * @param {FileList} files - Newly added files
 */
function updateStorageUsage(files) {
    const usedStorageElement = document.getElementById('usedStorage');
    const totalStorageElement = document.getElementById('totalStorage');
    const usageFillElement = document.querySelector('.usage-fill');
    
    if (!usedStorageElement || !totalStorageElement || !usageFillElement) return;
    
    // Get current values
    const currentUsed = parseFloat(usedStorageElement.textContent);
    const total = parseFloat(totalStorageElement.textContent);
    
    // Calculate total size of new files in GB
    let newFilesSize = 0;
    Array.from(files).forEach(file => {
        newFilesSize += file.size;
    });
    const newFilesSizeGB = newFilesSize / (1024 * 1024 * 1024);
    
    // Update used storage
    const newUsed = currentUsed + newFilesSizeGB;
    usedStorageElement.textContent = newUsed.toFixed(1) + ' GB';
    
    // Update usage bar
    const usagePercentage = (newUsed / total) * 100;
    usageFillElement.style.width = usagePercentage + '%';
} 