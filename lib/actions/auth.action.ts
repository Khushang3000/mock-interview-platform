"use server";

import { auth, db } from "@/firebase/admin";
import { Auth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { success, ZodEmail } from "zod";

//whenever we're in an action file we gotta use use server directive as actions will be executed on the server hence the server component.
const One_Week= 60*60*24*7*1000;


export async function signUp (params: SignUpParams){
    const {uid, name, email} = params;


    try {//here we will try to sign our user up.
        const userRecord = await db.collection('users').doc(uid).get();//getting a document with a specific uid

        if(userRecord.exists){//CHECKING IF USER ALREADY EXISTS IN THE DB
            return {
                success: false,
                message: "User Already exists please sign in instead"
            }
        }

        await db.collection('users').doc(uid).set({//PASSWORD WILL GO TO FIREBASE AUTH NOT FIREBASE DATABASE.
            // name: name,
            // email: email
            name, 
            email
        })//if the record doesn't exist then create it with that uid, now you can see the onSubmit function'S FIRST IF STATEMENT in Authform 
        
        return {
            success: true,
            message: "You have successfully created and Account, Please sign-in now."
        }
    
    } catch (e: any) {
        console.error("Error creating the user", e)

        if(e.code === 'auth/email-already-exists'){//firebase based error handling
            return {
                success: false,
                message: "This email is already in use"
            }

        }

        return {
            success: false,
            message: "Failed to create an account."
        }
    }
}

export async function signIn (params: SignInParams){
    const {email, idToken} = params;


    try {
        const userRecord = await auth.getUserByEmail(email)//getting user by email

        if(!userRecord){
            return{
                success: false,
                message: "User does not exist, please create an account instead"
            }
        }

        //if user does exist then create a cookie based session for him
        await setSessionCookie(idToken);//see this function that we made below this signIn function, and then get into the else part of the authForm onSubmit.
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Failed to log into an account"
        }
    }


}

export async function setSessionCookie(idToken: string){
    const cookieStore = await cookies()//USING NEXTJS COOKIES api TO access and manipulate http cookies on the server side, it returns a special RequestCookies object, read existing cookies, set new cookies, delete cookies

    const sessionCookie = await auth.createSessionCookie(idToken,{//converts firebase IdToken(which expires in 1hr, into a session cookie which expiresIn(below))
        expiresIn: One_Week,//1 week
    })

    cookieStore.set('session', sessionCookie, {//storing sessionCookie in user's browser.
        maxAge: One_Week,
        httpOnly: true,//we typically do that with authentication cookies
        secure: process.env.NODE_ENV === 'production',
        path: "/",
        sameSite: "lax"
    })
}

export async function getCurrentUser() : Promise<User | null> {//this function returns a promise which will be resolved into a User or null, we coulda created an interface for User, but see the return statement below, that kinda is a shortcut, yk as User;
    const cookieStore = await cookies()

    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie) return null;//it means that user doesn't exist

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)//true will just check if we have revoked the session, false won't check that.

        //getting access to the user from the database.
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();


        if(!userRecord.exists) return null;//if the user record doesn't exist.

        //but if user record does exist in the db.
        return{
            ...userRecord.data(),//spreading userRecord's data
            id: userRecord.id
        } as User;//saved ourselves from creating another interface.


    } catch (error) {
        console.log(error);
        return null;//either the session is invalid or is expired
    }
}//we can use this function to see whether a user is authenticated

export async function isAuthenticated(){
    const user = await getCurrentUser();

    return !!user;//we wanna return true if user exists, and if he doesn't we wanna return false,
    //so basically how !! works is, if we have an object {user: "Khushang"}, then ! makes it -> false and then another ! makes it true. and vice versa with an empty string.
    //'' (using !) -> true (using ! again) -> false
    //so now go to (root) 's layout and there add a check to see if a user is authenticated or not.
}