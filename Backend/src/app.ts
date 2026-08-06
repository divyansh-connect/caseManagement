import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import caseRoutes from './routes/caseRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main routers
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Case Management System Backend API is active.' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
