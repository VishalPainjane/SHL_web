import { NextRequest, NextResponse } from "next/server";

// Define interfaces for the request and response data
interface RequestBody {
  query: string;
}

interface Recommendation {
  name: string;
  description?: string;
  test_types?: string;
  remote_testing?: string;
  duration?: string;
  job_levels?: string;
  adaptive_irt?: string;
  languages?: string;
  url?: string;
  downloads?: Array<{
    title: string;
    url: string;
    language: string;
  }>;
}

interface ApiResponse {
  recommendations: Recommendation[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<{results: Recommendation[]} | ErrorResponse>> {
  try {
    const body = await request.json() as RequestBody;
    
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: "Query parameter is required and must be a string" },
        { status: 400 }
      );
    }

    const encodedQuery = encodeURIComponent(body.query);
    const finalQuery = `https://vishalpainjane-shl-assignment.hf.space/recommend?query=${encodedQuery}&max_results=5`;

    const response = await fetch(finalQuery);
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: "Failed to fetch recommendations",
          details: `API returned status ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json() as ApiResponse;

    return NextResponse.json({
      results: data.recommendations,
    });
  } catch (error) {
    console.error("Error in recommendation API:", error);
    
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
