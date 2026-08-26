import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staynest";

const AreaSchema = new mongoose.Schema({ name: String, slug: String, image: String }, { strict: false });
const Area = mongoose.models.Area || mongoose.model("Area", AreaSchema);

// Only using VERIFIED working Unsplash photo IDs (tested)
const FIXES: Record<string, string> = {
  // Dharampeth — upscale residential (photo-1568605114967-8130f3a36994 = modern house)
  "dharampeth": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  // Laxmi Nagar — college/student area (photo-1523050854058 was 404, use university library instead)
  "laxmi-nagar": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
};

async function fix() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");
  for (const [slug, image] of Object.entries(FIXES)) {
    const result = await Area.updateOne({ slug }, { $set: { image } });
    console.log(`${slug}: ${result.modifiedCount ? "✅ Updated" : "⚠️ Not found"} → ${image}`);
  }
  console.log("\n🎉 Done!");
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch((e) => { console.error(e); process.exit(1); });
