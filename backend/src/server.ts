import { app } from './app.js';
import { env } from './config/env.js';

const PORT = process.env.PORT || 5000

app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
});