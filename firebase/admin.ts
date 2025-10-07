import { cert, getApps, initializeApp } from "firebase-admin/app";
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const initFirabaseAdmin = ()=>{
    const apps = getApps();//this gets all the apps that the admin that we created has access to

    if(!apps.length){//we're doing this check so that we don't initialize our app more than once in our production or development
        //this ensures only one instance of firebase sdk is created, we don't need more
        initializeApp({
            credential: cert({//certificate, and here we provide some info about our project
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n")//this regex expression:
                ///.../ → means it’s a regular expression (regex).
                // \\ → represents a single backslash (because inside regex literals, you must escape it).
                // n → is literally the character n.
                // /g → is the global flag, meaning “replace all occurrences,” not just the first.

                //"\n" — the replacement
                // This is an actual newline character, not two characters.
                // So when you replace it, you get a real line break.

                //input str->"Hello\\nWorld\\nHow\\nare\\nyou?"
                //has H e l l o \ n W o r l d \ n ...
                //as characters
                //and after our replace function with regex expression, the string actually has newLines not just \ and n as chars
            })
        })
    }

    return {
        auth: getAuth(),
        db: getFirestore()
        //we'll use the admin authentication to get user info from the server side and db to perform some operations 
    }
}

export const {auth, db} = initFirabaseAdmin();//exporting those by calling the function first.
//let's also set up a client side firestore in case we need it somewhere later.
//see client.ts notice how we just had the default setup so let's get the complete setup
//import getApp, getApps, getAuth, getFirestore but this time from /firebase not firebase-admin
//now the initializeApp line we put check