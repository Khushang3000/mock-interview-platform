import Vapi from '@vapi-ai/web';

export const vapi= new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
//now what we really want is that, create an assistant, that can take in some info(data) from the user(on the type of interview(like behavioral, tech, frontend backend or many more))
//to use this we'll use vapi workflows, it allows us to design conversation as a series of steps or nodes, guiding the ai on what to ask and how to respond based on the user input.
//so basically, after we're taking input from the user through the ai assistant, we send it to gemini so that it generates some questions based on the user's choices and then store this info in the db.
//this storage will enable us to display the gathered data on the ui of our app.

//so here's how the flow goes:
//1.user will initiate a call with the ai assistant, which is structured using vapi workflows.
//2.the assistant then asks a series of predefined questions, collecting the user's responses
//3.once all the questions are answered, the assistant will end the call, and send the collected information to our api endpoint
//4.the api then feeds this info to gemini, gets the response back and store this data in the firestore database(basically how good the user did on the interview(interviewee's feedback.))
//So, we have to design that api endpoint first...to which the vapi workflow will make a call.
//to develop this, we'll use nextjs' route handlers
//they basically allow you to create backend routes within your applications. so create the api folder within our app folder.
//api/vapi/generate/route.ts
//this generate folder acts as a route.