// Utility functions for Vercel KV storage
// Using Vercel KV for serverless data persistence

const KV_PREFIX = 'mhauto:';

// Simulate file-based storage using Vercel KV or fallback to in-memory
let memoryStore = {};

export async function readData(filename) {
    try {
        // Try to use Vercel KV if available
        if (process.env.KV_REST_API_URL) {
            const { kv } = await import('@vercel/kv');
            const data = await kv.get(`${KV_PREFIX}${filename}`);
            return data || [];
        }
    } catch (error) {
        console.log('KV not available, using memory store');
    }
    
    // Fallback to memory store
    return memoryStore[filename] || [];
}

export async function writeData(filename, data) {
    try {
        // Try to use Vercel KV if available
        if (process.env.KV_REST_API_URL) {
            const { kv } = await import('@vercel/kv');
            await kv.set(`${KV_PREFIX}${filename}`, data);
            return;
        }
    } catch (error) {
        console.log('KV not available, using memory store');
    }
    
    // Fallback to memory store
    memoryStore[filename] = data;
}
