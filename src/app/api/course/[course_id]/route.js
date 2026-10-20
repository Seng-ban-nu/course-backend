import {authenticate} from '@/lib/auth';
import {database} from '@/lib/mongodb';
import {readBody,objectId,courseData,courseView,successResponse,caught,fail} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
async function findCourse(req,params,teacherOnly=false){
 const u=await authenticate(req,teacherOnly?['Teacher']:[]);const db=await database();const _id=objectId((await params).course_id);
 const c=await db.collection('courses').findOne({_id});if(!c)fail('Course not found',404);
 if(u.role==='Teacher'&&c.teacherId!==String(u._id))fail('This course belongs to another teacher',403);
 if(u.role==='Student'&&c.status==='Cancel')fail('Course not found',404);
 return {u,db,c};
}
export async function GET(req,{params}){try{const {u,c}=await findCourse(req,params);return successResponse(courseView(c,u));}catch(e){return caught(e);}}
export async function PATCH(req,{params}){try{
 const {u,db,c}=await findCourse(req,params,true);const data=courseData({...c,...await readBody(req)});
 // The student-count condition also protects concurrent enrollment during an edit.
 const updated=await db.collection('courses').findOneAndUpdate({_id:c._id,teacherId:String(u._id),$expr:{$lte:[{$size:'$students'},data.maxStudent]}},{$set:{...data,updatedAt:new Date()}},{returnDocument:'after'});
 if(!updated)fail('Max Student cannot be below the current enrollment count',409);
 return successResponse(courseView(updated,u));
}catch(e){return caught(e);}}
export const PUT=PATCH;
export async function DELETE(req,{params}){try{
 const {u,db,c}=await findCourse(req,params,true);
 const result=await db.collection('courses').deleteOne({_id:c._id,teacherId:String(u._id),students:{$size:0}});
 if(!result.deletedCount)fail('Cannot delete a course with enrolled students',409);
 return successResponse({message:'Course deleted'});
}catch(e){return caught(e);}}
