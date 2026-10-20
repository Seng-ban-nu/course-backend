import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {database} from '@/lib/mongodb';
import {readBody,successResponse,fail,caught,publicUser} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
export async function POST(req){try{
 const d=await readBody(req);const login=d.email||d.username;
 if(typeof login!=='string'||typeof d.password!=='string')fail('Enter username/email and password');
 const db=await database();const user=await db.collection('users').findOne({$or:[{email:login.trim().toLowerCase()},{username:login.trim()}]});
 if(!user||!await bcrypt.compare(d.password,user.password))fail('Invalid login',401);
 if(!process.env.JWT_SECRET)throw new Error('Set JWT_SECRET');
 const token=jwt.sign({id:String(user._id),email:user.email,username:user.username,version:user.sessionVersion||0},process.env.JWT_SECRET,{expiresIn:'3h',algorithm:'HS256'});
 const response=successResponse({user:publicUser(user)});
 response.cookies.set('token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:10800});return response;
}catch(e){return caught(e);}}
