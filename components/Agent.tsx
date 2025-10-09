import Image from 'next/image'
import React from 'react'
import { cn } from '@/lib/utils';

enum CallStatus {//this will allow us to define multiple values.
    INACTIVE='INACTIVE',
    CONNECTING='CONNECTING',
    ACTIVE='ACTIVE',
    FINISHED='FINISHED'
}

const Agent = ({userName}: AgentProps) => {
    const isSpeaking = true;//true->we are speaking, false->ai agent is speaking
    const callStatus = CallStatus.ACTIVE;
    const messages = ["What is Your Name? ","My name is John Doe, Nice to Meet you"];
    const lastMessage = messages[messages.length-1];

  return (
    <>
    <div className='call-view'>
        <div className="card-interviewer">
            <div className="avatar">
                <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className='object-cover' />
                {isSpeaking && <span className='animate-speak'></span>/**this internally uses tailwind's animate-ping property, you can search this utility class up in globals.css */}
            </div>
            <h3>Ai Interviewer</h3>
        </div>
        <div className="card-border">
            <div className="card-content">
                <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className='rounded-full object-cover size-[120px]'/>
                <h3>{userName}</h3>
            </div>
        </div>
    </div>
    {messages.length>0 && (
        <div className="transcript-border">
            <div className="transcript">
                <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>{lastMessage}</p>
            </div>
        </div>
    )}
    <div className="w-full flex justify-center">
        {/**Here we have to deal with call status, every call has a status that we have to define. */}
        {callStatus !== 'ACTIVE' ? //IF STATUS IS NOT ACTIVE
        (<button className='relative btn-call'>
            {/* this button will allow us to commence the call */}
            <span className={cn(`absolute rounded-full opacity-75`, callStatus !== 'CONNECTING' && 'hidden')}/>
                {/* in the cn function, if the callStatus is not Connecting only then we'll give it a className 'hidden' */}
            <span>
                {/**if the status is inactive or finished then show "Call" otherwise it's running so show ... */}
                {callStatus === 'INACTIVE' || callStatus === 'FINISHED' ? 'Call': '...'}
            </span>
        </button>)
        : //IF STATUS IS NOT ACTIVE
        <button className='btn-disconnect'>End</button>
        }
    </div>
    </>
    //now we're gonna make a feature which is the ability to generate custom interviews using an ai assistant
    //the way this works is that we get the user choices from ai in our app and then feed it to an assistant like gemini, to generate proper interview questions.
    //so create an api key for gemini in google ai studio. get api key->create a new project->create api key.
    //copy the api key and paste it in env.local, and gemini api key is free btw.
    //now how do we use that? we can use the ai sdk provided by vercel.(read docs) it allows you to integrate any kind of llm into your application without depending the specific provider you use.
    //i.e the code will look the same for whichever provider you choose let it be chatgpt or gemini or anyone else.
    //in this case we have choosen gemini generative ai.
    //so let's install that ai sdk: npm i ai @ai-sdk/google, and with that we're ready to use gemini.
  )
}

export default Agent