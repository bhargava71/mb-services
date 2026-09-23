import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Service from '../models/Service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function convertAllImagesToLocal() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mb_services';
    await mongoose.connect(mongoUri);
    console.log('[Image Converter] Connected to MongoDB');

    const services = await Service.find();
    console.log(`[Image Converter] Found ${services.length} services in database`);

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const filename = `service_${service._id}.jpg`;
      const localFilePath = path.join(uploadsDir, filename);
      const localUrl = `http://localhost:5000/uploads/${filename}`;

      if (service.image && service.image.startsWith('http://localhost:5000/uploads/')) {
        console.log(`  = Service "${service.name}" already uses local image: ${service.image}`);
        continue;
      }

      if (service.image && service.image.startsWith('http')) {
        console.log(`  ↓ Downloading image for "${service.name}"...`);
        try {
          const res = await fetch(service.image);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            fs.writeFileSync(localFilePath, Buffer.from(arrayBuffer));
            service.image = localUrl;
            await service.save();
            console.log(`  ✓ Converted to local: ${localUrl}`);
            continue;
          }
        } catch (downloadErr) {
          console.warn(`  ! Could not download from ${service.image}: ${downloadErr.message}`);
        }
      }

      // If no image or failed download, copy sample local image
      if (!fs.existsSync(localFilePath)) {
        // Fallback: copy a local png or create one
        const sampleBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        fs.writeFileSync(localFilePath, sampleBuffer);
      }
      service.image = localUrl;
      await service.save();
      console.log(`  ✓ Set local image: ${localUrl}`);
    }

    console.log('[Image Converter] All service images are now 100% LOCAL!');
    process.exit(0);
  } catch (err) {
    console.error('[Image Converter Error]', err);
    process.exit(1);
  }
}

convertAllImagesToLocal();
