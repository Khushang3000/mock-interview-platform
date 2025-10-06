import AuthForm from '@/components/AuthForm'
import React from 'react'

//now in authLayout give wrapper of both of these (signin and signup pages) a classname of auth-layout
const page = () => {
  return (
    <AuthForm type="sign-up" />
  )
}

export default page