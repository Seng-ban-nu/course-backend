import {authenticate} from '@/lib/auth';
import {successResponse,caught,publicUser} from '@/lib/utils';
export {OPTIONS} from '@/lib/utils';
// Each account can read only its own safe profile.
export async function GET(req){try{return successResponse({user:publicUser(await authenticate(req))});}catch(e){return caught(e);}}
