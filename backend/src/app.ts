import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler  } from './shared/middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// routes

app.use(errorHandler)
