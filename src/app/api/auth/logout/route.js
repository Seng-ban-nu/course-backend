import {authenticate} from '@/lib/auth';
import {database} from '@/lib/mongodb';
import {successResponse,caught} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
export async function POST(req){try{
 const user=await authenticate(req);await (await database()).collection('users').updateOne({_id:user._id},{$inc:{sessionVersion:1}});
 const response=successResponse({message:'Logged out'});response.cookies.set('token','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});return response;
}catch(e){return caught(e);}}
