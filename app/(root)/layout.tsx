import { isAuthenticated } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'
import LogoutButton from '@/components/LogoutButton'

const RootLayout = async ({children}:{children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();//this is how we can make our custom middlewares work in nextjs
  if(!isUserAuthenticated) redirect('sign-in');// now all non-logged in users won't be able to see the home page, and also all the pages that come under (root) folder as, this is the layout file of the (root) folder and we're making checks here.
  //we also wanna do something similar to this in auth's layout, there we wanna check if user is authenticated, if yes then directly redirect them to the / (home) page so that they don't have to login again.
  //now the next thing that we wanna do is the generateInterview interface, tho it's not a form that user's would fill in but it is gonna be implemented through a voice interface.
  //we'll do that in the next commit
  //interview folder

  return (
    <div className='root-layout'>
      {/* making this container that renders the navbar and then renders children. */}
      <nav className='flex justify-between items-center'>
        {/* there will be a link tag that points to the home page. */}
        <Link href="/"  className='flex items-center gap-2'>
          <Image src="/logo.svg" alt="logo" width={38} height={32}/>
          <h2 className="text-primary-100">Properview</h2>
        </Link>
        <LogoutButton />
      </nav>
      {/* now we render children */}
      {children}
      {/* now go to the root's page.tsx(home page) and we'll make the ui of home page now. */}
    </div>
  )
}

export default RootLayout