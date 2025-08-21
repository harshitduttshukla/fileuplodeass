import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
