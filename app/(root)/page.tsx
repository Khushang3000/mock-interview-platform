
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser} from '@/lib/actions/auth.action'
import { getInterviewsByUserId, getLatestInterviews} from '@/lib/actions/general.actions';


const page = async () => {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return <div>Error: User not found</div>;
  }

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({userId: user.id, limit: 20})
  ])

  //also checking if user had past interviews.
  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;

  //these below are the interviews that we haven't created
  const hasUpcommingInterviews = (latestInterviews?.length ?? 0) > 0; 
  
  //oh and now that you're done with both the requests, the indexing will be required for both, so again you can go to firebase link and create new index for the second fetch request, if they both were searching based on same params or in the same way we wouldn't need two indexes and just one.
  //now check your page out, rn we don't really have a logout button but you can sign in from another account by clearing your apps cookies.
  //inspect->application->cookies->right click on your apps hosted link or url and click clear.
  //now with this in mind we'll display the real interview data.
  //see the your interviews section.

  //now after you've seen everything, in the next commit we'll work on the interview session. yk for the actual interview.
  //so we need to create a new page, (root)->interview->[id] we'll be creating a dynamic route here.
  //and we'll create a function that will return interview details, but before that, we should actually create a general.actions.ts and then
  //and put getinterviewbyuserid and getlatestinterview there. and there we'll create a function that will help us fetch the interview details.


  return (
    <>
      <section className='card-cta'>
        {/* cta-call to action */}
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview ready with AI powered practice</h2>
          <p className="text-lg">Practice Real Interview Questions and get Instant feedback.</p>

          {/* asChild means that this button will take the property of a child which will be a link since it's gonna be clickable */}
          <Button asChild className='btn-primary max-w-full'>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden"/>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section flex !flex-row gap-6 mt-7">
          {
            hasPastInterviews ? (//if user has had past interviews.
              //if yes then we map over and show each indivisual interview.
              userInterviews?.map((interview)=>(
                <InterviewCard {...interview} key={interview.id}/>
                //for each interview we render an interview card.
              ))
            ) : //if user didn't have any interviews before.
            (
              <p>You haven&apos;t taken any interviews yet</p>
            )
            // now when we go to the home page and try to take that interview that we generated, we get an error.
            // and it'd say that this query requires an index.(which is the query we wrote in the getInterviewsById)
            // they also provide a link that you can copy and go to it.
            // and it'll automatically create the indexes for ya click save, that'll allow us to map over our elements.
            // the reason we got that error was cuz we were performing a query.
            // that finds interviews only created by user. that's why the where and createdAt need to be indexed 
            // you'll also see the status of it so you can see it is building, it'll take some time. when it becomes enabled, you can see your interviews.
          
            // now let's create another function that's gonna give us interviews created by other users not just this user.
            
          }

        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          <div className="interviews-section">
            {
            hasUpcommingInterviews ? (//if user has had past interviews.
              //if yes then we map over and show each indivisual interview.
              latestInterviews?.map((interview)=>(
                <InterviewCard {...interview} key={interview.id}/>
                //for each interview we render an interview card.
              ))
            ) : //if user didn't have any interviews before.
            (
              <p>There are no new interviews available.</p>
            )

            
          }
        </div>
        </div>
        {/* npm i dayjs, as we'll use it later to display the day or date, you'll see, rn since we don't have any database, we're just using static data, so just uncomment the line in index.ts in constants we'll use dummyInterview data */}

      </section>
    </>
  )
}

export default page