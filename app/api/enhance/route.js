import { NextResponse } from "next/server";
import sharp from "sharp";
import { Readable } from "stream";

// Convert buffer to stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const format = formData.get("format") || "jpeg"; // Get format from request, default to jpeg

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const enhancedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .normalize()
      .modulate({
        brightness: 1.2,
        saturation: 1.1,
      })
      .sharpen()
      .toFormat(format) // Use the selected format
      .toBuffer();

    const base64Image = `data:image/${
      format === "png" ? "png" : "jpeg"
    };base64,${enhancedBuffer.toString("base64")}`;

    return NextResponse.json({ enhancedImage: base64Image });
  } catch (error) {
    console.error("Error enhancing image:", error);
    return NextResponse.json(
      { error: "Failed to enhance image" },
      { status: 500 }
    );
  }
}
