import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import adminJs, { buildAdminRouter } from './admin/index.js';
import authRoutes from './routes/authRoutes.js';
import { User } from './models/index.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sessionsecret',
    resave: false,
    saveUninitialized: false
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);

const adminRouter = buildAdminRouter(async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return null;
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return null;
  }

  return {
    email: user.email,
    name: user.name,
    role: user.role,
    id: user.id
  };
});

app.use(adminJs.options.rootPath, adminRouter);

export default app;
