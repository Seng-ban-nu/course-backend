import {authenticate} from '@/lib/auth';
import {database} from '@/lib/mongodb';
import {readBody,courseData,courseView,literal,successResponse,caught} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
export async function GET(req){try{
 const u=await authenticate(req);const p=new URL(req.url).searchParams;
 const q=u.role==='Teacher'?{teacherId:String(u._id)}:{status:{$ne:'Cancel'}};
 if(p.get('name'))q.courseName={$regex:literal(p.get('name')),$options:'i'};
 if(p.get('teacher'))q.teacherName={$regex:literal(p.get('teacher')),$options:'i'};
 if(u.role==='Student'&&p.get('enrolled')==='true')q['students.userId']=String(u._id);
 const courses=await (await database()).collection('courses').find(q).sort({createdAt:-1}).toArray();
 return successResponse(courses.map(c=>courseView(c,u)));
}catch(e){return caught(e);}}
export async function POST(req){try{
 const u=await authenticate(req,['Teacher']);const data=courseData(await readBody(req));
 const course={...data,teacherId:String(u._id),teacherName:u.username,teacherEmail:u.email,students:[],createdAt:new Date()};
 const result=await (await database()).collection('courses').insertOne(course);return successResponse(courseView({_id:result.insertedId,...course},u),201);
}catch(e){return caught(e);}}
