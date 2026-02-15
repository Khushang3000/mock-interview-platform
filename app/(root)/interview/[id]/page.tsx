import { getInterviewById } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import DisplayTechIcons from '@/components/DisplayTechIcons';
import Agent from '@/components/Agent';
import { getCurrentUser } from '@/lib/actions/auth.action';


const page = async ({params}: RouteParams) => {
    const {id} = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if(!interview) redirect('/');//if there is no interview then throw the user back to the home page, and make sure this redirect comes from next/navigation.

    //correction, in interviewCard we're using InterviewId, but there is no such thing in interviewCardProps but an id(id of the interview) and we're refering to it as interviewId, so we'll just change that to just id.
    //why? cuz if you look in the home page.tsx we're rendering the interviewCard with destructuring the interview, and our Interview interface has a id, not interviewId
    //so in interviewCard.tsx and interviewCardProps make it id, instead of interviewId.
  return (
    <>
        <div className="flex flex-row gap-4 justify-between">
            <div className="flex flex-row gap-4 items center max-sm:flex-col">
                <div className="flex flex-row gap-4 items-center">
                    <Image src={getRandomInterviewCover()} alt="CoverImage" width={40} height={40} className='rounded-full object-cover size-[40px]'/>
                    <h3 className="capitalize">{interview.role} Interview</h3>
                </div>
                <DisplayTechIcons techStack={interview.techstack} />

            </div>
            <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>{interview.type}</p>
        </div>
        
        {/* now we'll also use the same agent that generated our interview to conduct our interview. we'll only need to change a few things in the agent component, like in the props it'll also accept the interview id. as well as the list of questions that we'll feed to this agent, now go to the 2nd useEffect of the agent.*/}
        {user ? (
          <Agent userName={user.name} userId={user.id} interviewId={id} type='interview' questions={interview.questions}/>
        ) : (
          <div>Error: User not authenticated</div>
        )}
    </>
  )
}

export default page