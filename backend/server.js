// server.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import { initSocket } from './lib/socket.js'; 
import { syncRedisToDB } from './lib/syncFormData.js';

dotenv.config();
import redis from './lib/redis.js';

await redis.del('form:bd7415:fields');


const app = express();
const server = http.createServer(app); 

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/responses', responseRoutes);


initSocket(server); 
setInterval(syncRedisToDB, 10 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


app.delete('/admin/redis/cleanup', async (req, res) => {
  const keys = await redis.keys('form:*:fields');
  let deleted = 0;

  for (const key of keys) {
    const formId = key.split(':')[1];
    const exists = await prisma.form.findUnique({ where: { id: formId } });
    if (!exists) {
      await redis.del(key);
      console.log(` Deleted orphan Redis key: ${key}`);
      deleted++;
    }
  }

  res.send(`Deleted ${deleted} invalid Redis keys.`);
});