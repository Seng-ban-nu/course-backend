import { MongoClient } from 'mongodb';
// Fix: reuse the connection in development and production.
export function getClientPromise() {
 if(!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI');
 if(!globalThis.courseClient) globalThis.courseClient=new MongoClient(process.env.MONGODB_URI).connect().catch(e=>{globalThis.courseClient=undefined;throw e;});
 return globalThis.courseClient;
}
export async function database(){return (await getClientPromise()).db(process.env.MONGODB_DB||'wad_final_2026');}
