import { createClient } from "@supabase/supabase-js";
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";

const supabaseUrl: string = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseBucketName: string = process.env.SUPABASE_BUCKET_NAME!;
const supabaseImageStoragePrefixURL: string = `${supabaseUrl}/storage/v1/object/public/${supabaseBucketName}/`;
const defaultImageUrl = `${supabaseImageStoragePrefixURL}default.jpg`;

const factsRowMin: number = parseInt(process.env.MIN_FACT_ID!);
const factsRowMax: number = parseInt(process.env.MAX_FACT_ID!);

const googleApiKey: string = process.env.GOOGLE_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const ai = new GoogleGenAI({ apiKey: googleApiKey });

export async function GET() {
  const randomIds: number[] = getRandomIds();
  const { data: facts } = await supabase
    .from("facts")
    .select("*")
    .in("id", randomIds);

  if (!facts) return [];

  const processedFacts = await Promise.all(
    facts.map(async (fact) => {
      if (fact.image_url) return fact;
      try {
        const generatedImage: Buffer<ArrayBuffer> | null = await generateImage(
          fact.fact_text,
          fact.id,
        );
        if (!generatedImage) throw new Error("Image generation failed");
        if (generatedImage) {
          console.log(`Image generated successfully for: ${fact.id}`);
        }
        const imageUrl: string = await storeImageToDatabase(
          generatedImage,
          String(fact.id),
        );

        await supabase
          .from("facts")
          .update({ image_url: imageUrl })
          .eq("id", fact.id);

        return {
          ...fact,
          image_url: imageUrl,
        };
      } catch (err) {
        console.error("Failed to process facts due to:", err);

        return {
          ...fact,
          image_url: defaultImageUrl,
        };
      }
    }),
  );
  return Response.json(processedFacts);
}

function getRandomIds() {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * (factsRowMax - factsRowMin + 1) + factsRowMin),
  );
}

async function generateImage(
  fact_text: string,
  id: number,
): Promise<Buffer<ArrayBuffer> | null> {
  const prompt = `Make a vector based cartoon for: "${fact_text}"\n DO NOT use text in the image.`;
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });
  try {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error(`Gen Image API failed for fact id: ${id}`);
    for (const part of parts) {
      if (part.inlineData?.data) {
        const base64Data: Buffer<ArrayBuffer> = Buffer.from(
          part.inlineData.data,
          "base64",
        );
        return base64Data;
      }
    }
  } catch (err) {
    console.error("Failed to generate Imgage:", err);
  }
  return null;
}

async function storeImageToDatabase(
  generatedImage: Buffer<ArrayBuffer>,
  id: string,
): Promise<string> {
  const fileName = `${id}.png`;

  const { data, error } = await supabase.storage
    .from(supabaseBucketName)
    .upload(fileName, generatedImage, {
      contentType: "image/png",
      upsert: true,
    });

  if (error || !data) throw new Error("Error uploading file: " + error.message);
  console.log(
    `Image store successfully for: ${id} at filepath: ${data.fullPath}`,
  );
  return `${supabaseImageStoragePrefixURL}${fileName}`;
}
