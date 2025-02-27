import { NextRequest, NextResponse } from 'next/server';

export interface RouteParams {
  params: Record<string, string>;
}

export type RouteHandler<T = NextResponse | Response> = (
  req: NextRequest,
  context: RouteParams
) => Promise<T>; 