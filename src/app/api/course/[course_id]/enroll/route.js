import {authenticate} from '@/lib/auth';
import {database} from '@/lib/mongodb';
import {objectId,courseView,successResponse,caught,fail} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
export async function POST(req,{params}){try{
 const u=await authenticate(req,['Student']);const _id=objectId((await params).course_id);const db=await database();const userId=String(u._id);
 // One atomic update checks status, duplicate enrollment and capacity together.
 const c=await db.collection('courses').findOneAndUpdate({_id,status:'Open','students.userId':{$ne:userId},$expr:{$lt:[{$size:'$students'},'$maxStudent']}},{$push:{students:{userId,username:u.username,email:u.email,enrolledAt:new Date()}}},{returnDocument:'after'});
 if(!c){const old=await db.collection('courses').findOne({_id});if(!old||old.status==='Cancel')fail('Course not found',404);if(old.students.some(s=>s.userId===userId))fail('Already enrolled',409);if(old.status!=='Open')fail('Course is not Open',409);fail('Course is full',409);}
 return successResponse({message:'Enrollment successful',course:courseView(c,u)},201);
}catch(e){return caught(e);}}
