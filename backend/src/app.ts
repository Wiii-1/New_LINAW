import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from "./modules/authentication/authRouter.js";
import { authenticate } from './shared/middleware/authenticate.js';

import { errorHandler  } from './shared/middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());


// routes

app.use("/api/auth", authRoutes);

app.use(errorHandler)

app.use(cookieParser());

