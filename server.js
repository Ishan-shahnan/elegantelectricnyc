const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --- Credentials ---
const ADMIN_ID = 'Shajin';
const ADMIN_PASS = 'Shajin#123';

// --- Multer setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    }
});

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname, { index: 'index.html', extensions: ['html'] }));
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Helpers ---
function readData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        return { contact: {}, testimonials: [], portfolios: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const encoded = authHeader.split(' ')[1];
    if (!encoded) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [id, pass] = decoded.split(':');
    if (id === ADMIN_ID && pass === ADMIN_PASS) next();
    else res.status(401).json({ error: 'Invalid credentials' });
}

// =====================
// PUBLIC API
// =====================
app.get('/api/data', (req, res) => res.json(readData()));
app.get('/api/contact', (req, res) => res.json(readData().contact || {}));
app.get('/api/testimonials', (req, res) => res.json(readData().testimonials || []));
app.get('/api/portfolios', (req, res) => res.json(readData().portfolios || []));

// =====================
// AUTH CHECK
// =====================
app.post('/api/login', (req, res) => {
    const { id, password } = req.body;
    if (id === ADMIN_ID && password === ADMIN_PASS) res.json({ success: true });
    else res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// =====================
// ADMIN API (protected)
// =====================

// --- Contact ---
app.put('/api/admin/contact', requireAuth, (req, res) => {
    const data = readData();
    data.contact = { ...data.contact, ...req.body };
    writeData(data);
    res.json({ success: true, contact: data.contact });
});

// --- Testimonials ---
app.post('/api/admin/testimonials', requireAuth, (req, res) => {
    const data = readData();
    const newId = data.testimonials.length > 0 ? Math.max(...data.testimonials.map(t => t.id)) + 1 : 1;
    const testimonial = { id: newId, ...req.body };
    data.testimonials.push(testimonial);
    writeData(data);
    res.json({ success: true, testimonial });
});

app.put('/api/admin/testimonials/:id', requireAuth, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.testimonials.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    data.testimonials[index] = { ...data.testimonials[index], ...req.body };
    writeData(data);
    res.json({ success: true, testimonial: data.testimonials[index] });
});

app.delete('/api/admin/testimonials/:id', requireAuth, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    data.testimonials = data.testimonials.filter(t => t.id !== id);
    writeData(data);
    res.json({ success: true });
});

// --- Portfolios ---
// Upload images for a portfolio
app.post('/api/admin/upload', requireAuth, upload.array('images', 3), (req, res) => {
    const files = req.files || [];
    const paths = files.map(f => '/uploads/' + f.filename);
    res.json({ success: true, paths });
});

// Create portfolio
app.post('/api/admin/portfolios', requireAuth, (req, res) => {
    const data = readData();
    const newId = data.portfolios.length > 0 ? Math.max(...data.portfolios.map(p => p.id)) + 1 : 1;
    const portfolio = {
        id: newId,
        location: req.body.location || '',
        details: req.body.details || '',
        images: req.body.images || []
    };
    data.portfolios.push(portfolio);
    writeData(data);
    res.json({ success: true, portfolio });
});

// Update portfolio
app.put('/api/admin/portfolios/:id', requireAuth, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.portfolios.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    data.portfolios[index] = { ...data.portfolios[index], ...req.body };
    writeData(data);
    res.json({ success: true, portfolio: data.portfolios[index] });
});

// Delete portfolio
app.delete('/api/admin/portfolios/:id', requireAuth, (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const portfolio = data.portfolios.find(p => p.id === id);
    // Delete associated images
    if (portfolio && portfolio.images) {
        portfolio.images.forEach(imgPath => {
            const fullPath = path.join(__dirname, imgPath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
    }
    data.portfolios = data.portfolios.filter(p => p.id !== id);
    writeData(data);
    res.json({ success: true });
});

// =====================
// ADMIN PAGE
// =====================
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`🔧 Admin panel at http://localhost:${PORT}/admin`);
});
