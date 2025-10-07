import Image from 'next/image'
import Link from 'next/link'
import React, { ReactNode } from 'react'

const RootLayout = ({children}:{children: ReactNode}) => {
  return (
    <div className='root-layout'>
      {/* making this container that renders the navbar and then renders children. */}
      <nav>
        {/* there will be a link tag that points to the home page. */}
        <Link href="/"  className='flex items-center gap-2'>
          <Image src="/logo.svg" alt="logo" width={38} height={32}/>
          <h2 className="text-primary-100">Properview</h2>
        </Link>
      </nav>
      {/* now we render children */}
      {children}
      {/* now go to the root's page.tsx(home page) and we'll make the ui of home page now. */}
    </div>
  )
}

export default RootLayout