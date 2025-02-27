import { NextRequest } from 'next/server';

export interface RouteParams {
  params: Record<string, string>;
}

export type RouteHandler<T = any> = (
  req: NextRequest,
  context: RouteParams
) => Promise<T>; 