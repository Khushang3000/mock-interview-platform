// to create routes in nextjs we create regular functions

import {generateText} from 'ai';
import {google} from '@ai-sdk/google';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

export async function GET(){
    return Response.json({success: true, data: "Thank You"}, {status: 200});
}//now to test this we gotta use a http client, like postman, or insomnia, 
//we'll use httpie, super lightweight.

//now in this very file, we'll develop a post route, that's responsible for getting the questions generated from gemini and saving that in the new interview.
export async function POST(request: Request){
    //since it's a post req, we have access to the post data.

    const {type, role, level, techstack, amount, questions, userid} = await request.json();//the way we get data through reqest body in nextjs is by awaiting.

    try {
        //so how do we generate this ai text, that our vapi agent will use?
        //since we're using nextjs ai sdk, it's super simple.
        const {text: questions} = await generateText({//renaming the text we're getting back from the ai to questions. now all these questions we got, we gotta store them in our database so that vapi can ask them to users.
            model: google('gemini-2.0-flash-001'),
            prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
        `,
       });//oh and btw, you might be wondering how is this using my gemini? without the api key?, the variable you added in the .env.local, 
       //it automatically reads it from there due to it's naming convention that we followed.

        //only do this after you've got the questions.
        const interview = {//we're going to store all this important info in the database, which vapi ai agent can use all this information.
            role, type, level,
            techstack: techstack.split(','),
            questions: JSON.parse(questions),//cuz gemini returns them in the form of a string, and we want it to be an array.
            userId: userid,
            finalized: true, //to indicate that we have finalized this interview.
            coverImage: getRandomInterviewCover(),//we could have asked the user to give the coverImage as well but just for the sake of keeping it simple, we're just getting the random interview cover.
            createdAt: new Date().toISOString()

        }//now we can store this interview in the database.

        await db.collection('interviews').add(interview);
        return Response.json({success: true},{status: 200});
        //now go to httpie and make a post request. to make it a post req, select post instead of get, and head into body instead of params, and there select text, json.
        //to get userid, you must go to your firebase db and copy the userid from the specific users document's field from the collection.
        //now if you go back to your firebase database and reload, you'll see that there's a new document interviews, now if you go in it,
        //it will have an interview with 7 questions that gemini created for us, based on all the information we provided in prompt of generateText. 

        //now the next thing we have to do is deploy our application, only to be able to share this api endpoint that we have created with the vapi workflow.
        //and then that workflow will call the deployed url, which will then generate this interview for us.
        //we can also do this locally by using ngrok but it's a complex setup and deploying this and testing it out live is a simpler way.
        //oh and btw before deploying this on vercel, we must ignore any eslint warnings or typescript errors that might pose a problem in deployment.
        //for that go to next.config.ts and under config options:
        //eslint: {ignoreDuringBuilds: true},
        //typescript: {ignoreBuildErrors: true}
    } catch (error) {
        console.error(error);
        return Response.json({success: false, error: error}, {status: 500})
    }
}