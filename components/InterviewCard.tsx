import React from 'react'
import dayjs from 'dayjs';//it'll allow us to format the date.
import {getRandomInterviewCover} from '@/lib/utils';//if you look into this funciton then you'll see that this function selects any random interview cover from the interview covers array in the constants.
//and also in that constants index.ts file the mappings map out different technologies to different paths to images in our application...
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';

const InterviewCard = ({interviewId, userId, role, type, techstack, createdAt}:InterviewCardProps) => {

    const feedback = null as Feedback | null; //feedback is set to null.
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;//gi, g is global and i is case insensitive.
    const formattedDate = dayjs(feedback?.createdAt|| createdAt || Date.now()).format('MMM D, YYYY')//formatting is like sep/feb/oct date, 2005/2006/2007 or anything.
  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
        <div className="card-interview">
            <div>
                <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-800'>
                    <p className="badge-text">{normalizedType}</p>
                </div>
                <Image src={getRandomInterviewCover()} alt="cover image"  width={90} height={90} className="rounded-full object-fit size-[90px]" />
                <h3 className="mt-5 capitalize">
                    {role} Interview 
                </h3>
                <div className="flex flex-row gap-5 mt-3">
                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" alt="Calender" width={22} height={22}/>
                        <p>{formattedDate}</p>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg"  alt="star" width={22} height={22} />
                        <p>{feedback?.totalScore || "---"}</p>
                    </div>
                </div>
                <p className="line-clamp-2 mt-5">{feedback?.finalAssessment || "You haven't taken the interview yet, take it now to improve your skills"}</p>
            </div>
            <div className="flex flex-row justify-between">
                <DisplayTechIcons techStack={techstack}/>
                <Button className='btn-primary'>
                    <Link href={feedback ? 
                        `/interview/${interviewId}/feedback`//feedback
                        :
                        `/interview/${interviewId}`//if it doesn't exist then we redirect user to a page from where they can take the interview
                    }>
                        {feedback? "Check Feedback":"View Interview"}
                        {/* if feedback exists for them then check feedback, otherwise view interview is displayed on the button
                        now we will render the skills' icons based on what the techstack array in the interview interface stored, and through those values in the techstack array, we'll map over the mappings to get the correct icon of the respective skill
                        see that function in lib/utils.ts, there we also have a function called getTechLogos, now we can use that utility function in this interviewCard itself but to keep the code clean, we will do it 
                        in another component displaytechicons.tsx
                        now that you're done with that, our home page ui is completed!!!, but we're just using static data rn, what if there was a database?
                        we're gonna do that in the next commit, using firebase for db!!!  */}
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  )
}

export default InterviewCard