import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "FungusIdentificationApp/1.0";

interface TaxonPhoto {
  photo: {
    url: string;
    attribution?: string;
    license_code?: string;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taxonId = searchParams.get("taxonId");

  if (!taxonId) {
    return NextResponse.json({ error: "taxonId required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/taxa/${taxonId}`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch photos" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const taxon = data.results?.[0];

    if (!taxon) {
      return NextResponse.json({ photos: [] });
    }

    const taxonPhotos: TaxonPhoto[] = taxon.taxon_photos ?? [];

    const photos = taxonPhotos
      .slice(0, 8)
      .map((tp) => {
        const squareUrl: string = tp.photo.url ?? "";
        const mediumUrl = squareUrl.replace("/square.", "/medium.");
        const thumbnailUrl = squareUrl;

        return {
          url: mediumUrl,
          thumbnail: thumbnailUrl,
          attribution: tp.photo.attribution ?? "",
          sourceLink: `https://www.inaturalist.org/taxa/${taxonId}`,
        };
      })
      .filter((p) => p.url);

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch photos" },
      { status: 500 }
    );
  }
}
