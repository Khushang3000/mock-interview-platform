import React, { ReactNode } from 'react'

const AuthLayout = ({children}:{children: ReactNode}) => {
  return (
    //you can check auth-layout in globals.css,
    //now we gotta Install some shadcn components like form button inputs so that we can create our authForm
    //npx shadcn @latest add button form input sonner, so go to the authform component
    //oh and btw, shadcn components are installed in components/ui folder.
    <div className='auth-layout'>{children}</div>
  )
}

export default AuthLayout