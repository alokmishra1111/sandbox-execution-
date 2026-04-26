const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { executeCode } = require('./sandbox');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting: 20 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 20,
  message: 'Too many execution requests from this IP, please try again after a minute'
});
app.use('/api/run', limiter);

// Execution endpoint
app.post('/api/run', async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, error: 'Code and language are required.' });
  }

  const supportedLanguages = ['c', 'python', 'javascript'];
  if (!supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Unsupported language.' });
  }

  try {
    const result = await executeCode(code, language.toLowerCase());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during execution.' });
  }
});

app.listen(PORT, () => {
  console.log(`GreenShield Sandbox backend running on port ${PORT}`);
});
