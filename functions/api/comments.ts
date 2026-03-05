interface Env {
  VOTES: KVNamespace;
}

interface Comment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

interface PostBody {
  slug: string;
  name: string;
  body: string;
  website?: string;
}

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getComments(kv: KVNamespace, slug: string): Promise<Comment[]> {
  const data = await kv.get(`comments:${slug}`, 'json');
  return (data as Comment[]) || [];
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers,
    });
  }

  const comments = await getComments(env.VOTES, slug);
  return new Response(JSON.stringify({ comments, count: comments.length }), { headers });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: PostBody;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers,
    });
  }

  const { slug, name, body: commentBody, website } = body;

  // Honeypot: if website field is filled, it's a bot. Return fake success.
  if (website) {
    return new Response(JSON.stringify({ success: true }), { status: 201, headers });
  }

  // Validation
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers });
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers });
  }

  if (name.trim().length > 50) {
    return new Response(JSON.stringify({ error: 'Name must be 50 characters or fewer' }), {
      status: 400,
      headers,
    });
  }

  if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Comment is required' }), { status: 400, headers });
  }

  if (commentBody.trim().length > 1000) {
    return new Response(JSON.stringify({ error: 'Comment must be 1000 characters or fewer' }), {
      status: 400,
      headers,
    });
  }

  // Rate limiting by IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `ratelimit:comments:${ip}`;
  const rateLimited = await env.VOTES.get(rateLimitKey);

  if (rateLimited) {
    return new Response(
      JSON.stringify({ error: 'Too many comments. Please wait a minute before posting again.' }),
      { status: 429, headers }
    );
  }

  // Set rate limit (60-second TTL)
  await env.VOTES.put(rateLimitKey, '1', { expirationTtl: 60 });

  // Create comment
  const comment: Comment = {
    id: crypto.randomUUID(),
    name: name.trim(),
    body: commentBody.trim(),
    createdAt: new Date().toISOString(),
  };

  // Get existing comments and prepend the new one (newest first)
  const comments = await getComments(env.VOTES, slug);
  comments.unshift(comment);

  await env.VOTES.put(`comments:${slug}`, JSON.stringify(comments));

  return new Response(JSON.stringify({ comment, count: comments.length }), {
    status: 201,
    headers,
  });
};
