import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({params}: RouteParams) => {
    const {id} = await params;//getting the params.
    const user = await getCurrentUser();//get the current user

    const interview = getInterviewById(id);//get the interview by id.
    if(!interview) redirect('/');//if there is no interview then redirect user to home page.

    const feedback = await getFeedbackByInterviewId({//getting the userfeedback from gemini via getfeedbackbyinterviewid
        interviewId: id,
        userId: user?.id!,
    })
    //Now, the only thing that remains is completing the ui of this feedback page.
    //which we'll do in the next commit.

    console.log(feedback);
  return (
    <div>page</div>
  )
}

export default page