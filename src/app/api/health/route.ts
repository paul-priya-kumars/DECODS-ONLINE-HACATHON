import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/api/response';

export async function GET() {
  const response = createSuccessResponse({
    service: 'UNDO THE FUTURE API',
    status: 'online',
    version: '1.0.0',
    phase: 1
  });

  return NextResponse.json(response);
}
