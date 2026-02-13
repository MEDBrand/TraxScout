import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  return response;
}
