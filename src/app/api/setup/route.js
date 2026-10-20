import bcrypt from 'bcrypt';
import {database} from '@/lib/mongodb';
import {readBody,fail,successResponse,caught} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
// Setup needs its own secret because no account exists on a fresh database.
export async function POST(req){try{
 const {pass}=await readBody(req);if(!process.env.ADMIN_SETUP_PASS||pass!==process.env.ADMIN_SETUP_PASS)fail('Forbidden',403);
 const db=await database();await db.collection('users').createIndex({email:1},{unique:true});await db.collection('users').createIndex({username:1},{unique:true});await db.collection('courses').createIndex({teacherId:1});await db.collection('courses').createIndex({'students.userId':1});
 for(const role of ['Teacher','Student'])for(let i=1;i<=3;i++){
  const username=role.toLowerCase()+i;const email=username+'@test.com';
  await db.collection('users').updateOne({email},{$setOnInsert:{username,email,password:await bcrypt.hash(role.toLowerCase()+'123',10),role,sessionVersion:0}},{upsert:true});
 }
 return successResponse({message:'3 Teachers and 3 Students are ready'});
}catch(e){return caught(e);}}
