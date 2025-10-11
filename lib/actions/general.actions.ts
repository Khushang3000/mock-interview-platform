"use server";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { success } from "zod";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null>{//so basically this function will return a promise which will resolve into Interview[] array of interviews or null if nothing exists.
    
    const interviews = await db.collection('interviews')
                            .where('userId','==',userId)
                            .orderBy('createdAt', 'desc')
                            .get()//order them in a descending order.
    return interviews.docs.map((doc)=>({
        //directly returning an object.
        id: doc.id,
        ...doc.data()//and spreading out the rest of the doc data.

    })) as Interview[];//now let's go to page.tsx and instead of getting the dummy interviews, let's get the real ones.(home page.)
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null>{
    
    //getting the userId through params and also setting the limit as 20 by default if it wasn't provided in params.
    const {userId, limit=20} = params;
    
    const interviews = await db.collection('interviews')
                            .orderBy('createdAt', 'desc')//ordering by createdAt
                            .where('finalized', '==', true)//getting only the interviews that are finalized
                            .where('userId','!=',userId)//getting interviews of other users rather than this one.
                            .limit(limit)//also limit the amount of interviews that we should get.
                            .get();//get.
    //rest all returns the same. now go back to the home page, fetching part.
    

    return interviews.docs.map((doc)=>({
        //directly returning an object.
        id: doc.id,
        ...doc.data()//and spreading out the rest of the doc data.

    })) as Interview[];//now let's go to page.tsx and instead of getting the dummy interviews, let's get the real ones.(home page.)
}

//function to get interview by it's own id.
export async function getInterviewById(id: string): Promise<Interview | null>{//takes an id of the interview, and returns a promise that resolves into an Interview(not array of Interview)
    const interview = await db.collection('interviews').doc(id).get();
                            
    return interview.data() as Interview | null;
}//now go to the dynamic page you made and fetch it.

export async function createFeedback(params: CreateFeedbackParams){
    const {interviewId, userId, transcript} = params;//interview id to know for which interview we're providing the feedback. userId to know for which user the feedback is, transcript of the interview for the ai to decide what feedback to give.

    try {
        const formattedTranscript = transcript
        .map((sentence: {role: string; content: string;})=>(//here we are explicitly defining the type of sentence
            `- ${sentence.role}: ${sentence.content}\n`//it's like what the sentence.role(person, ai) has said: sentence.content, so it's basically gonna be like, ai:"asked this question", hooman: "answered this", so basically it's gonna be a script of the whole conversation.
        )).join(''); //we can join them both and then pass it over to gemini to know how well we did.
        
        const {object: {totalScore, categoryScores, strengths, areasForImprovement, finalAssessment}} = await generateObject({//remember that before we used generateText, but now we're using generateObject, and this allows us to be a bit more specific.
            model: google('gemini-2.0-flash-001'),//the model
            schema: feedbackSchema,//the schema defines the structure in which the model will give the output
            prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,//the prompt for google ai
        system://the prompt for system
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",

        })

        //now we add the feedback to our db.
        const feedback = await db.collection('feedback').add({
            interviewId,//interviewId: interviewId, and same for the rest below except createdAt.
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString()//so that we know when this feedback took place.
        })

        return {//now we're sending this to our frontend, and ig you know where to call this function in frontend....handleGenerateFeedback in Agent.tsx
            //but before that let's create a feedback page. so go to [id] and there create the feedback folder.
            success: true,
            feedbackId: feedback.id
        }
    } catch (error) {
        console.log("Error Saving the feedback", error);
        return {
            success: false, //feedback id won't be passed if there was an error, that's why it was optional in the first place.
        }
    }//now we implement the todo in the agent.tsx handlegeneratefeedback, and come back here.
}//Now the only thing we'll need to do is create the function that'll give us access to the feedback that was created...
//so we can display it on the feedback page. function lies below.


export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null>{//recieves params of type getfeedbackbyinterviewidparams and returns a promise that resolves into a feedback.
    
    const {interviewId, userId} = params;
    
    //fetching the feedback from the database.
    const feedback = await db.collection('feedback')
                            .where('interviewId', '==', interviewId)
                            .where('userId','==',userId)
                            .limit(1)//limit it to one and give it to me.
                            .get();//get.

    if(feedback.empty){
        return null;
    }
    const feedbackDoc = feedback.docs[0];

    return {
        id: feedbackDoc.id,
        ...feedbackDoc.data()
    } as Feedback;

//now let's head over to the feedback page to call this function.
}