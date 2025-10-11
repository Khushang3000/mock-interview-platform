"use client"//as the agent will be used on the client side.

import Image from 'next/image'
import React from 'react'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {useState, useEffect} from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.actions';
// import { createFeedback } from '@/lib/actions/general.actions';


enum CallStatus {//this will allow us to define multiple values.
    INACTIVE='INACTIVE',
    CONNECTING='CONNECTING',
    ACTIVE='ACTIVE',
    FINISHED='FINISHED'
}
// ##########################################FINAL PART OF THIS PAGE################################################################
interface SavedMessage {
    //creating the savedMessage interface so that we can ensure typesafety in the messages array later when they'll be managed as a state.
    role: "user"|"system"|"assistant";
    content: string;
}

const Agent = ({userName, userId, type, interviewId, questions}: AgentProps) => {//added the userId and type that agent component is going to recieve. now we implement it's functionality.

    const router = useRouter();//now there will be many states and useEffects to handle the different states of the call that we have.
    //so let's make them, instead of using the static variables.
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)

    //also let's make a list for messages as we won't be having static messages.
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    //hooking into vapi's functionalities.
    useEffect(() => {
        const onCallStart = ()=>setCallStatus(CallStatus.ACTIVE)//as soon as the call starts(not as soon as the page mounts up) we set the callstatus to active
        const onCallEnd = ()=>setCallStatus(CallStatus.INACTIVE)//as soon as the call ends we set callstatus to inactive.

        const onMessage = (message: Message)=>{
            if(message.type === "transcript" && message.transcriptType === "final"){
                //if message type and transcript type is final that means that we can save it somewhere.
                const newMessage = {role: message.role, content: message.transcript}

                //adding that message to the array of messages.
                setMessages((prev)=>[...prev, newMessage]);


            }
        };//so that's what happens onMessage.

        const onSpeechStart = ()=>setIsSpeaking(true);
        const onSpeechEnd = ()=>setIsSpeaking(false);
    
        const onError = (error: Error)=>console.log('Error: ',error);

        //now we have all the functions that decide what happens at different stages of the call. we can now forward them over to vapi.
        //you can think of them as vapi event listeners.

        vapi.on('call-start',onCallStart);//on call start from vapi, we call our app's onCallStart function.
        vapi.on('call-end',onCallEnd);//similar to callStart.
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);
        //these all are just events from vapi that we blend our app with.
        //but there's one thing, whenever you open up listeners in useEffect, you also have to clear them.

        //when the page is unmounted this return statement is called where we turn off the event listeners, so that they don't slow our app any further if we're not using it.
        return () => {//notice how we're returning a callback function.
        vapi.off('call-start',onCallStart);
        vapi.off('call-end',onCallEnd);
        vapi.off('message', onMessage);
        vapi.off('speech-start', onSpeechStart);
        vapi.off('speech-end', onSpeechEnd);
        vapi.off('error', onError);
        }

    }, [])
    
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {//recieves a list of saved messages. cuz it has to take a transcript to generate feedback based on the entire conversation.
        console.log("Generate Feedback Here");

        // TODO: generate a server action that generates a feedback.
        // const {success, id} = {//we'll get the success and id from an action where we'll actually generate that feedback.
        //     //but for now we'll just take a dummy example.
        //     success: true,
        //     id: 'feedback-id'
        //     //just so that we can make s check down below
        // }

        // DONE:
        // const {success, feedbackId: id} = await createFeedback({//using await cuz this createFeedback is handling db., and renaming feedbackId to id. 
        // interviewId: interviewId!,
        // userId: userId!, 
        // transcript: messages })
        //basically, we were doing the above shit earlier, but in the createFeedback function we're importing db from firebase admin,
        //and it uses firebase admin sdk, which internally imports google-auth-library. and it uses node core modules like child_process,
        //so what happened was: Hey, you’re trying to import a Node.js-only module (child_process), but I’m bundling for the browser — I can’t do that.
        //and that can only be called from the server component, but when we imported that, it also imports google-auth library, which uses child_process which is specific to node.
        //and now when we imported the createFeedback function here in agent.tsx and called it, it meant that we made a req to firebase admin through a client component...
        //which it could not allow as it can only be called from the server(not server component(which only renders on the server))
        //and that's why we had to create a new api route for feedback, and we're calling that api route, and that route will then call the createFeedback function.
        // you can’t just slap 'use server' on a function and call it from a client component; the bundler still sees the import chain.
        //and server component only means that it renders on the server, but calling will be done on client's browser only,
        //that's why the api folder is there, to make server files and call db functions...

        //oh and you can see the exact error in the ss4, the last 4 lines told us which folders to look for the problem.
    //     try{
    //     const res = await fetch('/api/feedback', {//the real createFeedback is called by the server file. api/feedback/route.ts
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //     interviewId,
    //     userId,
    //     transcript: messages,
    //     }),
    //     })
    //     const {success, feedbackId: id} = await res.json();


    //     if(success && id){//if success is true and id exists.   
    //         router.push(`/interview/${interviewId}/feedback`)
    //     } else {
    //         //if it's not a success, we can log an error.
    //         console.log("Error saving feedback")
    //         router.push('/')//if there is an error then push them back to the home page.
    //     }
    // } catch(error){
    //     console.error(error);
    // }
    //now our app is done, for almost every part, unless you ever wanna change the ui, so yeah... this is the last commit.

    //OR WE CAN JUST SIMPLY USE THE "use server" directive in the general.actions.ts and it fixes shit as well.
    //so now,
    const {success, feedbackId: id} = await createFeedback({//renaming feedbackId to just id.
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages
    })
    if(success && id){//if success is true and id exists.   
            router.push(`/interview/${interviewId}/feedback`)
        } else {
            //if it's not a success, we can log an error.
            console.log("Error saving feedback")
            router.push('/')//if there is an error then push them back to the home page.
        }
    
        // using "use server" means "Hey, never even try to bundle this for the browser. This is server-only code.", if i don't use 'use server' in an action module and then call it from a client(browser component) then it get's bundled to the browser
        // and we're using that in useEffect so i don't think that's a problem as the component isn't server rendered and if it were then i would have had to use formAction
        // we could've made only the function server only by giving the first line in it's block/scope as 'use server';
        //but since we're importing db from firebase/admin in the entire file, so the entire file needs to go server only... as it's a node-only module
        //that's why our whole general.actions.ts goes as 'use server' module.
    }




    //now we also have a useEffect for whenever anything changes.
    useEffect(() => {
        //HERE we will check whether we're on a call to generate an interview or we're on a call right now.
        if(callStatus === CallStatus.FINISHED){
            if(type==='generate'){
                //if the type is generate then sure we'll push to the homepage right after we generate an interview
                router.push('/');
            } else {
                handleGenerateFeedback(messages);//see this is for feedback.
                //but for now let's go and focus on handling this interview call, in the handleCall
            }
        }
      
        // if(callStatus === CallStatus.FINISHED) router.push('/');//if the callStatus is finished(i.e the call has ended), i wanna push user back to the homepage.
        //we can also make them go to the interviews/id page, but it'll take some time to be added, so it's better that we just send them back to the homepage and from there they figure out where they wanna go.
        //now we'll handle the feedback in next commit.
        //Oh and btw... router.push() used in client components or event handlers.
        //redirect(from next/navigation) we use it inside server components, actions or loaders.
        //so now finally we'll create the feedback page and show the feedback to the user.
        //lib/actions/generalactions and there we'll create a server action that'll create feedback and store it in our firestore database using gemini
        //createFeedback function.
      
    }, [messages, callStatus, type, userId])
    //finally, we have to implement two functions

    //this will start the call so it'll be an async function.
    const handleCall = async ()=>{
        setCallStatus(CallStatus.CONNECTING);
        
        // now we can call vapi and actually ask it to start the call.

        //the reason we're passing undefined is because when you hover over the .start function you see:
        // start(
        //   assistant?: CreateAssistantDTO | string,
        //   assistantOverrides?: AssistantOverrides,
        //   squad?: CreateSquadDTO | string,
        //   workflow?: CreateWorkflowDTO | string,
        //   workflowOverrides?: WorkflowOverrides
        // )

        //which means that if you passed the public vapi workflow id as the 1st 2nd or 3rd argument, it will think of it as assistant, assistant override
        //or squad, which we definitely don't want!!! and why did only passing undefined work? and why not ''(empty string) or null?
        
        // | What you passed | Type                                                    | SDK sees it as                                                    | Result  |
        // | --------------- | ------------------------------------------------------- | ---------------------------------------------------------------   | ------- |
        // | `undefined`     | *undefined*                                             | ❌ falsy → skip assistant → checks workflow ✅                   | works ✅ |
        // | `null`          | object (but truthy in TS sense since explicitly passed) | “assistant exists but is null” ❌                                | fails   |
        // | `''`            | string (empty)                                          | truthy string value (non-undefined) → treated as assistant ID ❌ | fails   |

        // so basically when we passed null or '' it considered them as values for those parameters.
        //that's how the vapi sdk was designed...
        //oh and basically when you tried to make request before, by passing workflowid as the first variable.
        //you had this logged in the browser, see the ss3.
        //so you even got the context from there.
        //which totally indicated that the start function was taking your key as the assistant id. as it came to be true.

        //now that was some real dev work now...
        //now if you gave the interview, and you visited the firebase, you must've seen the interview being created.
        // await vapi.start(undefined, undefined, undefined, process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,{
        //     variableValues: {//remember that we were using the userid variable in the workflow.
        //         userid: userId,
        //     }
        // });
        //so basically, we're telling it to start the convo with this specific agent or workflow.

        if(type === 'generate'){//if type is equal to generate, we generate an interview.
        await vapi.start(undefined, undefined, undefined, process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,{
            variableValues: {//remember that we were using the userid variable in the workflow.
                userid: userId,
            }
        });
        } else {
            //else means that type will be interview, hence this will be an interview call.
            //so we'll provide a n.o of questions for an interviewer to ask.
            let formattedQuestions = '';
            if(questions) {
                formattedQuestions = questions.map((question)=>`- ${question}`).join('\n')//if questions do exist then, just map over them and join each of them with a newline character to make it formatted questions

            }
            //now our index.ts file under constants, uncomment all, as we're now ready to use it.
            await vapi.start(interviewer, {//if you see the interviewer, he's a different interviewer than the one we used to generate the interview, this one will ask the questions.
                //now go and look at the configuration of this interviewer in the documentation.
                //also, if you want to generate a specific configuration, then you have to go to vapi, agent and publish the agent that you want to, and then click the </> code button and it'll give you the assistant's config in json.
                //and you can just directly paste it or update your interviewer json with that one, but make sure to handle the inputs and variables.
                variableValues: {
                    questions: formattedQuestions
                }//oh and btw in this way we didn't need to host or publish our own assistant again.
            })
            
        }
    }//so this is how simply we're handling the start of the call.

    //this will disconnect the call, so it'll also be an async function.
    const handleDisconnect = async ()=>{
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }//and that's how we handle disconnect.
    
    const latestMessage = messages[messages.length - 1]?.content; //check out how many messages there are and just give me it's content.
    const isCallInactiveOrFinished = (callStatus === CallStatus.INACTIVE || CallStatus.FINISHED);

    //Okay, designing the interview is one thing, but giving the interview is what remains to be done, so let's do that in the next commit.
    //oh and btw you might've noticed that we're using the public key for web workflow as we're doing shit on client side, 
    //as private keys are used to interact with vapi api in the backend of the systems,
    //and the public key is used to interact with vapi api in the client side, that's why we even named our workflow id with NEXT_PUBLIC so that it can be accessed on the frontend side.
    //so now the next thing w gotta do is -> showing the generated interview. to show the newly generated interview on the homepage, we gotta make an action that fetches that interview.
    //so in lib/auth.actions.ts we can write a simple function that simply fetches the interview 
// ################################################################FINAL PART OF THIS PAGE HAS ENDED##################################################################

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
                <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>{latestMessage}</p>
            </div>
        </div>
    )}
    <div className="w-full flex justify-center">
        {/**Here we have to deal with call status, every call has a status that we have to define. */}
        {callStatus !== 'ACTIVE' ? //IF STATUS IS NOT ACTIVE
        (<button className='relative btn-call' onClick={handleCall}>
            {/* this button will allow us to commence the call */}
            <span className={cn(`absolute rounded-full opacity-75`, callStatus !== 'CONNECTING' && 'hidden')}/>
                {/* in the cn function, if the callStatus is not Connecting only then we'll give it a className 'hidden' */}
            <span>
                {/**if the status is inactive or finished then show "Call" otherwise it's running so show ... */}
                {isCallInactiveOrFinished ? 'Call': '...'}
            </span>
        </button>)
        : //IF STATUS IS NOT ACTIVE
        <button className='btn-disconnect' onClick={handleDisconnect}>End</button>
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

    // Now we have our gemini api key(the ai assistant), but for our application we need it to speak, and to do that we'll use vapi
    // now we can use vapi in two ways:
    
    // Assistants are the new standard: The Assistant builder is the primary, recommended way to create voice agents on Vapi for almost all new projects. It's designed to be a single, powerful, conversational agent.

    // Workflows are a legacy/specialized feature: The Workflow builder is an older system designed for creating very rigid, multi-step, deterministic call flows (like a visual phone tree). Vapi's own documentation now states: "We no longer recommend Workflows for new builds. Use Assistants for most cases..."
        
    //go to docs and read the assistants section as well as the workflows section and see the quickstart sections there.
    //but firstly let's get the vapi api in our app for interacting with the real time call functionality of vapi:npm i @vapi-ai/web
    //now head over to vapi dashboard->api keys->public api key. and add the env variable.

    //NOW WE set up our vapi client in this app. lib/vapi.sdk.ts
)
}

export default Agent