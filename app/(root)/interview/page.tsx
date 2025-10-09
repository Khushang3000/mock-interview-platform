import React from 'react'
import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action'
const page = async () => {

  //extracting the user information that we wanna pass to the agent, down below in the Agent component.
  const user = await getCurrentUser();


  //this agent is a shared component btw, we'll use it lateron when we take the interview. but rn it's job is only to take the information from the user and generate the interview.

  return (
    <>
        <h3>Interview Generation</h3>
        <Agent userName={user?.name!} userId={user?.id} type="generate"/>
    </>
  )
}

export default page