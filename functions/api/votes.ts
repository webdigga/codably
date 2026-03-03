// KV binding configured in Cloudflare Pages dashboard (not wrangler.toml)
interface Env {
  VOTES: KVNamespace;
}

interface VoteData {
  up: number;
  down: number;
}

interface PostBody {
  slug: string;
  vote: 'up' | 'down';
  previous?: 'up' | 'down';
}

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getVotes(kv: KVNamespace, slug: string): Promise<VoteData> {
  const data = await kv.get(`votes:${slug}`, 'json');
  return (data as VoteData) || { up: 0, down: 0 };
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

  const votes = await getVotes(env.VOTES, slug);
  return new Response(JSON.stringify(votes), { headers });
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

  const { slug, vote, previous } = body;

  if (!slug || !vote || (vote !== 'up' && vote !== 'down')) {
    return new Response(
      JSON.stringify({ error: 'Invalid request. Requires slug and vote ("up" or "down")' }),
      { status: 400, headers }
    );
  }

  if (previous && previous !== 'up' && previous !== 'down') {
    return new Response(JSON.stringify({ error: 'Invalid previous vote value' }), {
      status: 400,
      headers,
    });
  }

  const votes = await getVotes(env.VOTES, slug);

  // Decrement previous vote if switching
  if (previous && previous !== vote) {
    votes[previous] = Math.max(0, votes[previous] - 1);
  }

  // Increment new vote
  votes[vote]++;

  await env.VOTES.put(`votes:${slug}`, JSON.stringify(votes));

  return new Response(JSON.stringify(votes), { headers });
};
