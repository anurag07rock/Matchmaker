import { NextResponse } from 'next/server';
import { mockCustomers } from '@/data/customers';
import { calculateCompatibility } from '@/services/matching/matcher';
import { Customer } from '@/types/customer';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory runtime cache for analysed pairs (keyed by "clientId_candidateId")
// Cache is skipped when full customer objects are supplied (fresh data mode).
// ─────────────────────────────────────────────────────────────────────────────
const analysisCache = new Map<string, {
  summary: string;
  potentialAnalysis: string;
  introduction: string;
  score: number;
}>();

// Model to use — override via OPENAI_MODEL env variable
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ─────────────────────────────────────────────────────────────────────────────
// Map OpenAI HTTP status codes to user-friendly messages
// ─────────────────────────────────────────────────────────────────────────────
function openAiErrorMessage(status: number): string {
  switch (status) {
    case 401: return 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.';
    case 429: return 'OpenAI rate limit reached. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503: return 'OpenAI service is temporarily unavailable. Please try again shortly.';
    default:  return `OpenAI API returned an unexpected error (HTTP ${status}).`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, candidateId, clientData, candidateData } = body;

    if (!clientId || !candidateId) {
      return NextResponse.json(
        { error: 'Missing clientId or candidateId parameters' },
        { status: 400 }
      );
    }

    // ── Cache check ──────────────────────────────────────────────────────────
    // Skip cache when full profile objects are provided (ensure freshness).
    const cacheKey = `${clientId}_${candidateId}`;
    if (!clientData && !candidateData && analysisCache.has(cacheKey)) {
      return NextResponse.json({ ...analysisCache.get(cacheKey), cached: true });
    }

    // ── Resolve customer profiles ────────────────────────────────────────────
    // Use provided data first (for customers created in-session), then fall
    // back to the seeded mockCustomers dataset.
    const client: Customer | undefined = clientData || mockCustomers.find(c => c.id === clientId);
    const candidate: Customer | undefined = candidateData || mockCustomers.find(c => c.id === candidateId);

    if (!client || !candidate) {
      return NextResponse.json(
        { error: 'Client or candidate profiles not found. Please ensure both profiles exist.' },
        { status: 404 }
      );
    }

    // ── Algorithmic compatibility score ──────────────────────────────────────
    const matchingResult = calculateCompatibility(client, candidate);

    // ── API key guard ────────────────────────────────────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.startsWith('sk-...')) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add your OPENAI_API_KEY to .env.local and restart the server.' },
        { status: 503 }
      );
    }

    // ── Build the OpenAI request ─────────────────────────────────────────────
    const prompt = `Evaluate compatibility for the following pair:

=== CLIENT A ===
Name: ${client.firstName} ${client.lastName}
Gender: ${client.gender}
Age: ${client.age}
Location: ${client.city}, ${client.country}
Occupation: ${client.occupation} (${client.designation} at ${client.company})
Education: ${client.degree} (${client.college})
Religion: ${client.religion || 'Not specified'}
Income: ${client.income}
Mother Tongue: ${client.motherTongue}
Hobbies: ${client.hobbies.join(', ')}
Interests: ${client.interests.join(', ')}
Bio: ${client.bio}
Family Planning (Kids): ${client.wantKids}
Lifestyle: Diet — ${client.diet}, Smoking — ${client.smoking}, Drinking — ${client.drinking}

=== CLIENT B ===
Name: ${candidate.firstName} ${candidate.lastName}
Gender: ${candidate.gender}
Age: ${candidate.age}
Location: ${candidate.city}, ${candidate.country}
Occupation: ${candidate.occupation} (${candidate.designation} at ${candidate.company})
Education: ${candidate.degree} (${candidate.college})
Religion: ${candidate.religion || 'Not specified'}
Income: ${candidate.income}
Mother Tongue: ${candidate.motherTongue}
Hobbies: ${candidate.hobbies.join(', ')}
Interests: ${candidate.interests.join(', ')}
Bio: ${candidate.bio}
Family Planning (Kids): ${candidate.wantKids}
Lifestyle: Diet — ${candidate.diet}, Smoking — ${candidate.smoking}, Drinking — ${candidate.drinking}

Algorithmic Compatibility Score: ${matchingResult.score}/100.
Provide professional analysis that is consistent with this score.`;

    // 30-second timeout to avoid hanging Next.js requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    let openAiResponse: Response;
    try {
      openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an expert relationship psychologist and professional matchmaker at 'The Date Crew'.
Analyse the two client profiles provided and evaluate their compatibility.
Return a JSON object with exactly three string fields:
1. "summary": A warm, professional 2–3 sentence overview of why they are or are not a good match.
2. "potentialAnalysis": An insightful paragraph evaluating long-term potential, shared values, and lifestyle alignment.
3. "introduction": A personalised, warm email introduction letter written from the matchmaker to both clients, highlighting their common ground and suggesting a first date idea.

Return ONLY valid JSON — no markdown, no code fences.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError?.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request to OpenAI timed out after 30 seconds. Please try again.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: 'Could not reach OpenAI API. Please check your internet connection.' },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // ── Handle non-2xx from OpenAI ───────────────────────────────────────────
    if (!openAiResponse.ok) {
      const errorBody = await openAiResponse.text().catch(() => '');
      console.error(`[generate-match-analysis] OpenAI error ${openAiResponse.status}:`, errorBody);
      return NextResponse.json(
        { error: openAiErrorMessage(openAiResponse.status) },
        { status: openAiResponse.status }
      );
    }

    // ── Parse the response ───────────────────────────────────────────────────
    let gptContent: { summary?: string; potentialAnalysis?: string; introduction?: string };
    try {
      const responseData = await openAiResponse.json();
      gptContent = JSON.parse(responseData.choices[0].message.content);
    } catch (parseError) {
      console.error('[generate-match-analysis] Failed to parse OpenAI JSON response:', parseError);
      return NextResponse.json(
        { error: 'OpenAI returned an unexpected response format. Please try again.' },
        { status: 500 }
      );
    }

    // Validate expected fields are present
    if (!gptContent.summary || !gptContent.potentialAnalysis || !gptContent.introduction) {
      console.error('[generate-match-analysis] OpenAI response missing required fields:', gptContent);
      return NextResponse.json(
        { error: 'OpenAI response was incomplete. Please try again.' },
        { status: 500 }
      );
    }

    const result = {
      summary: gptContent.summary,
      potentialAnalysis: gptContent.potentialAnalysis,
      introduction: gptContent.introduction,
      score: matchingResult.score,
    };

    // Cache successful results (only when using seeded data, not live-supplied profiles)
    if (!clientData && !candidateData) {
      analysisCache.set(cacheKey, result);
    }

    return NextResponse.json({ ...result, cached: false });

  } catch (error) {
    console.error('[generate-match-analysis] Unhandled error:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
