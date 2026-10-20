import {NextResponse} from 'next/server';
import {verifyJWT} from './lib/auth';
import corsHeaders from './lib/cors';
import {X_HEADER_USER_EMAIL,X_HEADER_USER_ID,X_HEADER_USER_NAME} from './lib/constant';
// Fix: exclude login/setup and allow browser preflight requests.
export function proxy(request){
 const path=request.nextUrl.pathname;
 if(request.method==='OPTIONS'||path==='/api/auth/login'||path==='/api/setup')return NextResponse.next();
 const user=verifyJWT(request);
 if(!user)return NextResponse.json({message:'Login required'},{status:401,headers:corsHeaders});
 const headers=new Headers(request.headers);
 headers.set(X_HEADER_USER_ID,user.id);headers.set(X_HEADER_USER_EMAIL,user.email);headers.set(X_HEADER_USER_NAME,user.username);
 return NextResponse.next({request:{headers}});
}
export const config={matcher:['/api/:path*']};
