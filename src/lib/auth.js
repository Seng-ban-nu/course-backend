import jwt from 'jsonwebtoken';
import {database} from './mongodb';
import {fail,objectId} from './utils';
export function verifyJWT(req){
 try{
  const token=req.cookies.get('token')?.value||req.headers.get('authorization')?.replace(/^Bearer /i,'');
  if(!token||!process.env.JWT_SECRET)return null;
  return jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});
 }catch{return null;}
}
// Fix: check the real database role, not user supplied headers.
export async function authenticate(req,roles=[]){
 const payload=verifyJWT(req);if(!payload)fail('Login required',401);
 const user=await (await database()).collection('users').findOne({_id:objectId(payload.id)});
 if(!user||(user.sessionVersion||0)!==payload.version)fail('Login expired',401);
 if(roles.length&&!roles.includes(user.role))fail('Forbidden',403);
 return user;
}
