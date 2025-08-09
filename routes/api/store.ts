import { FreshContext } from "$fresh/server.ts";
import { storeCode } from "../../utils/redis.ts";
import { shortUrlId } from "../../utils/urlId.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Code is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate short URL ID from the code
    const id = shortUrlId(code);
    
    // Store the code in Redis
    const stored = await storeCode(id, code);
    
    if (!stored) {
      // Code already exists, return the existing URL
      return new Response(JSON.stringify({ 
        success: true,
        id,
        url: `${req.url.split('/api')[0]}/share/${id}`,
        message: 'Code already exists, returning existing URL'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id,
      url: `${req.url.split('/api')[0]}/share/${id}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error storing code:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 