export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

const BACKEND_BASE = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'
).replace(/\/$/, '');

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function backendUrl(request: Request, path: string[]): string {
  const url = new URL(request.url);
  return `${BACKEND_BASE}/api/${path.join('/')}${url.search}`;
}

function requestHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  headers.delete('host');
  return headers;
}

function responseHeaders(response: Response): Headers {
  const headers = new Headers(response.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  return headers;
}

async function proxy(request: Request, context: ProxyContext): Promise<Response> {
  const { path } = await context.params;
  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';

  try {
    const backendResponse = await fetch(backendUrl(request, path), {
      method,
      headers: requestHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
    });

    return new Response(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders(backendResponse),
    });
  } catch {
    return Response.json(
      { error: 'Backend unavailable. Check BACKEND_API_URL and confirm Flask is running.' },
      { status: 502 },
    );
  }
}

export function GET(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function POST(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function PUT(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function PATCH(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function DELETE(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function HEAD(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
