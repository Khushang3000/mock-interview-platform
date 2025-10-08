import React, { ReactNode } from 'react'
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';


const AuthLayout =async ({children}:{children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
    if(isUserAuthenticated) redirect('/');//redirect to homepage if user is authenticated
  return (
    //you can check auth-layout in globals.css,
    //now we gotta Install some shadcn components like form button inputs so that we can create our authForm
    //npx shadcn @latest add button form input sonner, so go to the authform component
    //oh and btw, shadcn components are installed in components/ui folder.
    <div className='auth-layout'>{children}</div>
  )
}

export default AuthLayout