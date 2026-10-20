import {NextResponse} from 'next/server';
import {ObjectId} from 'mongodb';
import corsHeaders from './cors';
export function printExceptionLog(message,error){console.error(message,error);}
export function successResponse(data,status=200){return NextResponse.json(data,{status,headers:corsHeaders});}
export function errorResponse(message,status=400){return successResponse({message},status);}
export function fail(message,status=400){throw Object.assign(new Error(message),{status});}
export function caught(error){if(!error.status)console.error(error);return errorResponse(error.status?error.message:'Server error. Check backend database settings.',error.status||500);}
export async function readBody(req){try{return await req.json();}catch{fail('Invalid JSON');}}
export function objectId(value){if(typeof value!=='string'||!/^[a-f0-9]{24}$/i.test(value))fail('Invalid ID');return new ObjectId(value);}
export function OPTIONS(){return new Response(null,{status:204,headers:corsHeaders});}
export function publicUser(u){return {id:String(u._id),username:u.username,email:u.email,role:u.role};}
export function courseData(data){
 const courseName=data.courseName;
 if(typeof courseName!=='string'||!courseName.trim()||courseName.length>200)fail('Enter course name (maximum 200 characters)');
 if(!Number.isSafeInteger(data.duration)||data.duration<1)fail('Duration must be a positive whole number');
 if(typeof data.price!=='number'||!Number.isFinite(data.price)||data.price<0)fail('Price must be zero or more');
 if(!Number.isSafeInteger(data.maxStudent)||data.maxStudent<1||data.maxStudent>1000)fail('Max Student must be between 1 and 1000');
 if(!Array.isArray(data.topics)||!data.topics.length||data.topics.length>100||data.topics.some(t=>typeof t!=='string'||!t.trim()||t.length>200))fail('Enter at least one topic (maximum 100 topics)');
 if(!['Open','Close','Cancel'].includes(data.status))fail('Status must be Open, Close or Cancel');
 return {courseName:courseName.trim(),duration:data.duration,price:data.price,maxStudent:data.maxStudent,topics:data.topics.map(t=>t.trim()),status:data.status};
}
export function literal(text){return Array.from(text.slice(0,200),c=>'.*+?^${}()|[]\\'.includes(c)?'\\'+c:c).join('');}
export function courseView(c,user){
 const result={...c,enrolledCount:c.students.length,seatsAvailable:Math.max(0,c.maxStudent-c.students.length),isEnrolled:c.students.some(s=>s.userId===String(user._id))};
 if(user.role!=='Teacher')delete result.students;
 return result;
}
