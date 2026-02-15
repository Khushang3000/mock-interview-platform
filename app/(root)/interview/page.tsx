import React from 'react'
import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action'
const page = async () => {

  //extracting the user information that we wanna pass to the agent, down below in the Agent component.
  const user = await getCurrentUser();

  if (!user) {
    return <div>Error: User not authenticated</div>;
  }

  //Now in this commit we'll finally connect our workflow to the application...
  //this agent is a shared component btw, we'll use it lateron when we take the interview. but rn it's job is only to take the information from the user and generate the interview.
  //see agent.tsx..
  return (
    <>
        <h3>Interview Generation</h3>
        <Agent userName={user.name} userId={user.id} type="generate"/>
    </>
  )
}

export default page