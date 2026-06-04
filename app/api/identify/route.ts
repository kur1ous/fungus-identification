import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const INATURALIST_CV_URL =
  "https://api.inaturalist.org/v1/computervision/score_image";
const USER_AGENT = "FungusIdentificationApp/1.0";

interface INatTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  rank?: string;
}

interface INatResult {
  taxon: INatTaxon;
  // iNaturalist's CV endpoint returns combined_score / vision_score as
  // percentage-scale values (e.g. 55.79 ≈ 56%) that sum toward 100 across
  // results — there is no 0–1 "score" field.
  combined_score?: number;
  vision_score?: number;
}

interface INatCVResponse {
  results: INatResult[];
}

export async function POST(req: NextRequest) {
  const apiToken = process.env.INATURALIST_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      {
        error:
          "INATURALIST_API_TOKEN is not set. Get a free token at inaturalist.org/users/api_token and add it to .env.local",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Resize and convert to JPEG — iNaturalist's CV returns 500 for large or
    // non-JPEG images (PNG, HEIC, WEBP, oversized photos from phones).
    const rawBuffer = Buffer.from(await image.arrayBuffer());
    const jpegBuffer = await sharp(rawBuffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const blob = new Blob([new Uint8Array(jpegBuffer)], { type: "image/jpeg" });
    const upstream = new FormData();
    upstream.append("image", blob, "upload.jpg");

    const res = await fetch(INATURALIST_CV_URL, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        Authorization: `JWT ${apiToken}`,
      },
      body: upstream,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`iNaturalist CV API ${res.status}: ${body}`);
      return NextResponse.json(
        {
          error:
            res.status === 401
              ? "iNaturalist API token is invalid or expired — refresh it at inaturalist.org/users/api_token"
              : "Identification service unavailable — please try again",
        },
        { status: 502 }
      );
    }

    const data: INatCVResponse = await res.json();

    const fungi = data.results
      .filter(
        (r) =>
          r.taxon.iconic_taxon_name === "Fungi" ||
          r.taxon.rank === "species" ||
          r.taxon.rank === "genus"
      )
      .slice(0, 5)
      .map((r) => ({
        taxonId: r.taxon.id,
        scientificName: r.taxon.name,
        commonNames: r.taxon.preferred_common_name
          ? [r.taxon.preferred_common_name]
          : [],
        genus: r.taxon.name.split(" ")[0],
        family: "",
        score: (() => {
          const raw = r.combined_score ?? r.vision_score;
          return raw != null ? Math.min(100, Math.round(raw)) : null;
        })(),
      }));

    if (fungi.length === 0) {
      return NextResponse.json(
        {
          error:
            "Couldn't identify this one — try a clearer photo of the cap, gills, or stem",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ results: fungi });
  } catch (err) {
    console.error("identify route error:", err);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 }
    );
  }
}
