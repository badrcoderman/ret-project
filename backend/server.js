const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Check if multer is installed
let multer;
try {
    multer = require('multer');
} catch (e) {
    console.error('\nError: The "multer" package is missing.');
    console.error('Please run "npm install" in your terminal or run "install.bat" to fix this.\n');
    process.exit(1);
}

//server static files from 'FORMS' directory
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//make files 'html,css' available
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Configure Multer for uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // Sanitize filename and add timestamp
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Helper to read/write JSON files in 'data' folder
function getFilePath(type) {
    return path.join(DATA_DIR, type + '.json');
}

function readData(type) {
    const filePath = getFilePath(type);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeData(type, data) {
    try {
        fs.writeFileSync(getFilePath(type), JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${type}: ${error.message}`);
    }
}

// Helper to parse cookies from the request headers
function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach(function(cookie) {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }
    return list;
}

//route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

//receive form data
app.post('/signup', (req, res) => {
    const { newUsername, newEmail, newPassword } = req.body;
    const users = readData('users');
    
    // Simple check if user exists
    const exists = users.find(u => u.username === newUsername);
    if (exists) {
        return res.send('المستخدم موجود بالفعل');
    }

    users.push({ username: newUsername, email: newEmail, password: newPassword });
    writeData('users', users);
    
    console.log('New user registered:', newUsername);
    res.send('تم استلام بيانات التسجيل بنجاح!');
});

//handle login form submission
app.post('/submit', (req, res) => {
    const { username, password } = req.body;
    const users = readData('users');
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        console.log('User logged in:', username);
        // Set a cookie with the username (expires in 1 hour)
        res.cookie('username', username, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/');
    } else {
        res.send(`
            <body style="background:#1a1a2e; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column;">
                <h2>خطأ في تسجيل الدخول</h2>
                <p>اسم المستخدم أو كلمة المرور غير صحيحة</p>
                <a href="/login.html" style="color:#4ecca3">حاول مرة أخرى</a>
            </body>
        `);
    }
});

// API to check current user session
app.get('/api/user', (req, res) => {
    const cookies = parseCookies(req);
    if (cookies.username) {
        res.json({ username: cookies.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/');
});

//handle contact form submission
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    const messages = readData('messages');
    
    messages.push({ name, email, message, date: new Date() });
    writeData('messages', messages);
    
    console.log('New message from:', name);
    res.send('تم استلام رسالتك بنجاح!');
});

// Handle file upload
app.post('/upload', upload.single('fileToUpload'), (req, res) => {
    // Check for authentication cookie
    const cookies = parseCookies(req);
    if (!cookies.username) {
        return res.status(401).send('Unauthorized');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const uploads = readData('uploads');
    const fileRecord = {
        id: Date.now(),
        uploader: cookies.username,
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        date: new Date()
    };
    
    uploads.push(fileRecord);
    writeData('uploads', uploads);

    console.log(`File uploaded by ${cookies.username}: ${req.file.originalname}`);
    res.sendStatus(200);
});

// Get list of uploaded files for dashboard
app.get('/files', (req, res) => {
    const uploads = readData('uploads');
    res.json(uploads);
});

//start the server
app.listen(3000, '0.0.0.0', () => {
    console.log('الخادم شغال على http://localhost:3000');
    
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`للدخول من الهاتف استخدم الرابط: http://${iface.address}:3000`);
            }
        }
    }
});