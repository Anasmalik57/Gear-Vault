import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const format = (formData.get("format") || "jpeg").toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Enhanced image processing for better results
    const enhancedBuffer = await sharp(buffer)
      .resize({
        width: 1200,
        kernel: sharp.kernel.lanczos3, // Better upscaling quality
        withoutEnlargement: true, // Avoid stretching
      })
      .linear(1.1, 0) // Mild contrast adjustment
      .modulate({
        brightness: 1.05, // Subtle brightness boost
        saturation: 1.03, // Subtle color enhancement
      })
      .sharpen({
        sigma: 0.5, // Gentle sharpening to avoid noise
        flat: 1.0,
        jagged: 0.5,
      })
      .blur(0.3) // Very light blur to reduce noise
      .toFormat(format, {
        quality: format === "jpeg" ? 90 : undefined, // High but balanced quality
        compressionLevel: format === "png" ? 7 : undefined, // Moderate compression
        effort: format === "webp" ? 4 : undefined, // Balanced effort for WebP
      })
      .toBuffer();

    const base64Image = `data:image/${format === "png" ? "png" : format};base64,${enhancedBuffer.toString(
      "base64"
    )}`;

    return NextResponse.json({ enhancedImage: base64Image });
  } catch (error) {
    console.error("Error enhancing image:", error);
    return NextResponse.json(
      { error: "Failed to enhance image" },
      { status: 500 }
    );
  }
}