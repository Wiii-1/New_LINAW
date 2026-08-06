import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from "./modules/authentication/authRouter.js";
import auditRoutes from "./modules/audit_trail/auditTrailRouter.js"
import purchaseRoutes from "./modules/purchase_requisition/purchaseRequisitionRouter.js"

import { errorHandler  } from './shared/middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());


// routes

app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/auditTrail", auditRoutes)
app.use("/api/purchase_requisition", purchaseRoutes)

app.use(errorHandler)


