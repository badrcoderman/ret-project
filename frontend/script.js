function updateFileName() {
    const input = document.getElementById('fileToUpload');
    const display = document.getElementById('file-name-display');
    if (input && input.files.length > 0) {
        display.innerText = input.files[0].name;
        display.style.opacity = '1';
    } else {
        if(display) display.innerText = "";
    }
}

function showMessage(type, textKey) {
    const msgDiv = document.getElementById('message');
    const lang = localStorage.getItem('preferredLang') || 'ar';
    if (msgDiv) {
        msgDiv.className = `message-box ${type}`;
        // Access content from lang.js global variable
        msgDiv.innerText = content[lang][textKey] || textKey;
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 5000);
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📕',
        'doc': '📘', 'docx': '📘',
        'xls': '📗', 'xlsx': '📗',
        'ppt': '📙', 'pptx': '📙',
        'txt': '📄',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '👾',
        'zip': '📦', 'rar': '📦', '7z': '📦',
        'mp3': '🎵', 'wav': '🎵',
        'mp4': '🎬', 'avi': '🎬', 'mov': '🎬'
    };
    return icons[ext] || '📁';
}

function checkAuth() {
    fetch('/api/user')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Not logged in');
        })
        .then(user => {
            updateNavbar(true, user.username);
        })
        .catch(() => {
            updateNavbar(false);
        });
}

function updateNavbar(isLoggedIn, username) {
    const navLogin = document.getElementById('navLogin');
    const navSignup = document.getElementById('navSignup');
    const navLinks = document.querySelector('.nav-links');
    const lang = localStorage.getItem('preferredLang') || 'ar';

    if (isLoggedIn) {
        if(navLogin) navLogin.style.display = 'none';
        if(navSignup) navSignup.style.display = 'none';
        
        // Add Welcome & Logout if not exists
        if (!document.getElementById('navUser')) {
            const welcomeMsg = lang === 'ar' ? `مرحباً، ${username}` : `Hi, ${username}`;
            const logoutText = lang === 'ar' ? 'خروج' : 'Logout';
            
            navLinks.insertAdjacentHTML('beforeend', `<span class="nav-text" id="navUser">${welcomeMsg}</span>`);
            navLinks.insertAdjacentHTML('beforeend', `<a href="/logout" class="nav-btn logout-btn" id="navLogout">${logoutText}</a>`);
        }
    }
}

function loadDashboard() {
    const list = document.getElementById('fileListBody');
    if (!list) return;

    fetch('/files')
        .then(response => response.json())
        .then(files => {
            list.innerHTML = '';
            // Sort by newest first
            files.sort((a, b) => b.id - a.id);
            
            files.forEach(file => {
                const row = document.createElement('tr');
                const date = new Date(file.date).toLocaleDateString();
                const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
                const icon = getFileIcon(file.originalName);
                
                row.innerHTML = `
                    <td><div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size: 1.2em;">${icon}</span> ${file.originalName}
                    </div></td>
                    <td style="direction: ltr;">${size}</td>
                    <td>${date}</td>
                `;
                list.appendChild(row);
            });
        })
        .catch(err => console.error('Error loading dashboard:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    // Load dashboard if on home page
    loadDashboard();

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const lang = localStorage.getItem('preferredLang') || 'ar';
            const fileInput = document.getElementById('fileToUpload');

            if (fileInput.files.length === 0) {
                showMessage('error', 'selectFile');
                return;
            }
            
            showMessage('success', 'uploading');
            
            const formData = new FormData();
            formData.append('fileToUpload', fileInput.files[0]);

            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            const progressBar = document.getElementById('progressBar');
            const progressContainer = document.getElementById('progressContainer');

            if (progressContainer) progressContainer.style.display = 'block';

            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable && progressBar) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = percentComplete + '%';
                }
            });

            xhr.addEventListener('load', function() {
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressBar) progressBar.style.width = '0%';

                if (xhr.status === 200) {
                    showMessage('success', 'success');
                    uploadForm.reset();
                    document.getElementById('file-name-display').innerText = "";
                    loadDashboard();
                } else if (xhr.status === 401) {
                    showMessage('error', 'loginRequired');
                } else {
                    showMessage('error', 'error');
                }
            });

            xhr.addEventListener('error', function() {
                if (progressContainer) progressContainer.style.display = 'none';
                showMessage('error', 'error');
            });

            xhr.open('POST', '/upload');
            xhr.send(formData);
        });
    }
});