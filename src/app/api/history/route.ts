import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/api/response';

export async function GET() {
  // For Phase 1, return empty simulations array
  // In Phase 2, this will fetch from database
  const response = createSuccessResponse({
    simulations: []
  }, {
    phase: 1,
    mock: true
  });

  return NextResponse.json(response);
}