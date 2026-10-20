import {authenticate} from '@/lib/auth';
import {successResponse,caught,publicUser,objectId,fail} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
export async function GET(req,{params}){try{const user=await authenticate(req);const id=String(objectId((await params).user_id));if(id!==String(user._id))fail('Forbidden',403);return successResponse({user:publicUser(user)});}catch(e){return caught(e);}}
