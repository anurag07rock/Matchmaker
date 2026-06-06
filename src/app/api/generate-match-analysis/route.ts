import { NextResponse } from 'next/server';
import { mockCustomers } from '@/data/customers';
import { calculateCompatibility } from '@/services/matching/matcher';
import { Customer } from '@/types/customer';

// In-memory runtime cache for analyzed pairs
const analysisCache = new Map<string, {
  summary: string;
  potentialAnalysis: string;
  introduction: string;
  score: number;
}>();

export async function POST(request: Request) {
  try {
    // Accept optional full customer data from the client (for localStorage-based customers)
    const body = await request.json();
    const { clientId, candidateId, clientData, candidateData } = body;

    if (!clientId || !candidateId) {
      return NextResponse.json(
        { error: 'Missing clientId or candidateId parameters' },
        { status: 400 }
      );
    }

    // Check memory cache (skip cache if full data was provided to ensure freshness)
    const cacheKey = `${clientId}_${candidateId}`;
    if (!clientData && !candidateData && analysisCache.has(cacheKey)) {
      return NextResponse.json({ ...analysisCache.get(cacheKey), cached: true });
    }

    // Use provided customer data if available (for newly created customers in localStorage)
    // Fall back to mockCustomers for seed data
    const client: Customer | undefined = clientData || mockCustomers.find(c => c.id === clientId);
    const candidate: Customer | undefined = candidateData || mockCustomers.find(c => c.id === candidateId);

    if (!client || !candidate) {
      return NextResponse.json(
        { error: 'Client or candidate profiles not found. Please ensure both profiles exist.' },
        { status: 404 }
      );
    }

    // Compute basic compatibility score
    const matchingResult = calculateCompatibility(client, candidate);

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Graceful fallback with highly realistic generated data
      const mockResult = generateMockAIAnalysis(client, candidate, matchingResult.score);
      if (!clientData && !candidateData) {
        analysisCache.set(cacheKey, mockResult);
      }
      return NextResponse.json({ ...mockResult, cached: false, note: 'Mock Fallback: OpenAI key not set' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert relationship psychologist and professional matchmaker at 'The Date Crew'. 
Analyze the two client profiles provided and evaluate their compatibility.
You must return a JSON object containing precisely three string fields:
1. "summary": A warm, professional 2-3 sentence overview of why they match.
2. "potentialAnalysis": An insightful paragraph evaluating their long-term potential, including shared values and lifestyle alignments.
3. "introduction": A personalized, warm email introduction letter (written from the matchmaker to both of them) introducing them to each other, highlighting common hobbies/interests, and suggesting a first date.

Return ONLY valid JSON.`,
          },
          {
            role: 'user',
            content: `Evaluate compatibility for the following pair:

=== CLIENT A ===
Name: ${client.firstName} ${client.lastName}
Gender: ${client.gender}
Age: ${client.age}
Location: ${client.city}, ${client.country}
Occupation: ${client.occupation} (${client.designation} at ${client.company})
Education: ${client.degree} (${client.college})
Religion: ${client.religion}
Income: ${client.income}
Mother Tongue: ${client.motherTongue}
Hobbies: ${client.hobbies.join(', ')}
Interests: ${client.interests.join(', ')}
Bio: ${client.bio}
Family Planning (Kids): ${client.wantKids}

=== CLIENT B ===
Name: ${candidate.firstName} ${candidate.lastName}
Gender: ${candidate.gender}
Age: ${candidate.age}
Location: ${candidate.city}, ${candidate.country}
Occupation: ${candidate.occupation} (${candidate.designation} at ${candidate.company})
Education: ${candidate.degree} (${candidate.college})
Religion: ${candidate.religion}
Income: ${candidate.income}
Mother Tongue: ${candidate.motherTongue}
Hobbies: ${candidate.hobbies.join(', ')}
Interests: ${candidate.interests.join(', ')}
Bio: ${candidate.bio}
Family Planning (Kids): ${candidate.wantKids}

Matching Score calculated by algorithm: ${matchingResult.score}/100.
Provide professional analysis matching this score.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API request failed:', errorText);
      // Fallback on API failure
      const mockResult = generateMockAIAnalysis(client, candidate, matchingResult.score);
      if (!clientData && !candidateData) {
        analysisCache.set(cacheKey, mockResult);
      }
      return NextResponse.json({ ...mockResult, cached: false, note: 'Mock Fallback: API call failed' });
    }

    const responseData = await response.json();
    const gptContent = JSON.parse(responseData.choices[0].message.content);

    const result = {
      summary: gptContent.summary || '',
      potentialAnalysis: gptContent.potentialAnalysis || '',
      introduction: gptContent.introduction || '',
      score: matchingResult.score
    };

    // Cache the response
    if (!clientData && !candidateData) {
      analysisCache.set(cacheKey, result);
    }

    return NextResponse.json({ ...result, cached: false });
  } catch (error) {
    console.error('generate-match-analysis error:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during generation' },
      { status: 500 }
    );
  }
}

// Fallback generator for generating rich, contextual analyses without OpenAI keys
function generateMockAIAnalysis(client: Customer, candidate: Customer, score: number) {
  const commonHobbies = client.hobbies.filter(h => candidate.hobbies.includes(h));
  const overlapText = commonHobbies.length > 0
    ? `shared interests in ${commonHobbies.slice(0, 2).join(' and ')}`
    : `a shared dedication to their respective professions in ${client.city}`;

  const summary = `${client.firstName} and ${candidate.firstName} display a strong compatibility score of ${score}%, highlighted by their ${overlapText}, complementary lifestyles, and aligned long-term relationship expectations.`;

  const potentialAnalysis = `This pairing has significant long-term potential. Both individuals express a similar outlook regarding family planning ("${client.wantKids}") and show matching thresholds for relocation flexibility. ${client.firstName}'s career as a ${client.occupation || 'professional'} blends well with ${candidate.firstName}'s role as a ${candidate.occupation || 'professional'}. Their communication styles appear compatible, showing high potential for building a balanced, supportive partnership.`;

  const introduction = `Hi ${client.firstName} & ${candidate.firstName},\n\nI am thrilled to introduce you to each other! \n\n${client.firstName}, meet ${candidate.firstName}—who is a ${candidate.occupation} in ${candidate.city}. ${candidate.firstName}, meet ${client.firstName}—who is a ${client.occupation} in ${client.city}.\n\nI was immediately drawn to your profiles because you both share a deep love for ${client.hobbies[0] || 'exploring new activities'} and have a lot in common in terms of your values, life goals, and career drives. \n\nI think you two would have a wonderful time connecting. I'd highly recommend meeting up for a warm cup of coffee or a casual weekend walk in the city to get to know each other!\n\nWarmly,\nYour Date Crew Matchmaker`;

  return {
    summary,
    potentialAnalysis,
    introduction,
    score
  };
}
