interface Env {
  VOTES: KVNamespace;
}

interface VoteData {
  up: number;
  down: number;
}

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const comments: Record<string, number> = {};
  const votes: Record<string, { up: number; down: number }> = {};

  // List all comment keys
  let commentCursor: string | undefined;
  const commentKeys: string[] = [];
  do {
    const result = await env.VOTES.list({
      prefix: 'comments:',
      cursor: commentCursor,
    });
    for (const key of result.keys) {
      commentKeys.push(key.name);
    }
    commentCursor = result.list_complete ? undefined : result.cursor;
  } while (commentCursor);

  // List all vote keys
  let voteCursor: string | undefined;
  const voteKeys: string[] = [];
  do {
    const result = await env.VOTES.list({
      prefix: 'votes:',
      cursor: voteCursor,
    });
    for (const key of result.keys) {
      voteKeys.push(key.name);
    }
    voteCursor = result.list_complete ? undefined : result.cursor;
  } while (voteCursor);

  // Batch-fetch comment counts
  const commentPromises = commentKeys.map(async (key) => {
    const slug = key.replace('comments:', '');
    const data = await env.VOTES.get(key, 'json');
    const arr = (data as any[]) || [];
    if (arr.length > 0) {
      comments[slug] = arr.length;
    }
  });

  // Batch-fetch vote data
  const votePromises = voteKeys.map(async (key) => {
    const slug = key.replace('votes:', '');
    const data = await env.VOTES.get(key, 'json');
    const voteData = (data as VoteData) || { up: 0, down: 0 };
    if (voteData.up > 0 || voteData.down > 0) {
      votes[slug] = voteData;
    }
  });

  await Promise.all([...commentPromises, ...votePromises]);

  return new Response(JSON.stringify({ comments, votes }), { headers });
};
