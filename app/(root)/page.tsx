import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'
const page = () => {
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
          {dummyInterviews.map((interview)=>(<InterviewCard {...interview} key={interview.id}/>))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          <div className="interviews-section">
            {dummyInterviews.map((interview)=>(<InterviewCard {...interview} key={interview.id}/>))}
          {/* <p>You haven't given any interviews yet.</p> */}
        </div>
        </div>
        {/* npm i dayjs, as we'll use it later to display the day or date, you'll see, rn since we don't have any database, we're just using static data, so just uncomment the line in index.ts in constants we'll use dummyInterview data */}

      </section>
    </>
  )
}

export default page