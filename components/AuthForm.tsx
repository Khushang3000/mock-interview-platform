"use client"

import React, { useEffect, useRef, useState } from 'react';
import FormField from './FormField';


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

//defining the schema
// const formSchema = z.object({
//   username: z.string().min(2).max(50),
// })
//above code was pasted from shadcn doc
// our schema
const authFormSchema = (type: "sign-in" | "sign-up")=>{
    return z.object({
        name: type === "sign-up"? z.string().min(3) : z.string().optional(),
        //name will only be required in the signup page.
        email: z.email(),
        password: z.string().min(3)//password and name will be of minimum 3 characters.
    })
}









//shadcn components
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';//make sure this is the one from next/navigation not next/router
import {
  EmailAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/firebase/client';
import { Input } from '@/components/ui/input';

import { signIn, signUp } from '@/lib/actions/auth.action';



//NOW WE CAN IMPORT THIS FORM BOTH IN THE SIGNUP AND SIGNIN PAGES.

//see what's a sonner in the doc for shadcn.
//also search about forms in the docs and see the react hook form title and scroll down below to know how we create forms in apps. see usage
//now firstly we gonna use zod to define formSchema see the code that we copy pasted from docs.
//you'll notice that we're using the use client directive, that's because in nextjs as soon as we use some client side functionalities,
//like button click, input or form that becomes a client side component.

//now we have to define our form and the submit handler. which we do below.
//after that we gotta build the form that comprises of all the shadcn components that we imported.


const getPhoneAuthErrorMessage = (error: unknown) => {
    const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
        ? error.code
        : '';

    switch(code){
        case 'auth/invalid-phone-number':
            return 'Enter a valid phone number in international format, such as +14155552671.';
        case 'auth/invalid-verification-code':
            return 'That verification code is incorrect. Check it and try again.';
        case 'auth/code-expired':
            return 'That verification code expired. Request a new code.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Wait a while before trying again.';
        case 'auth/operation-not-allowed':
            return 'Phone sign-in is not enabled for this Firebase project.';
        case 'auth/email-already-in-use':
        case 'auth/credential-already-in-use':
            return 'That email or phone number is already linked to another account.';
        default:
            return error instanceof Error ? error.message : 'Phone verification failed. Please try again.';
    }
};

const AuthForm = ({type}:{type: "sign-in" | "sign-up"}) => {//the rendering will be based on whether the type that was sent was sign-in or sign-up


    const router = useRouter()//this is the one from next/navigation not next/router
    const formSchema = authFormSchema(type);//using only formSchema name we can use zodResolver.


     // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => () => {
    recaptchaVerifierRef.current?.clear();
  }, []);

  async function sendPhoneVerificationCode() {
    const normalizedPhoneNumber = phoneNumber.replace(/[\s()-]/g, '');
    if(!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)){
      toast.error('Enter your phone number with country code, for example +14155552671.');
      return;
    }

    setIsSendingCode(true);
    try {
      if(!recaptchaVerifierRef.current){
        const container = recaptchaContainerRef.current;
        if(!container) throw new Error('Phone verification is not ready. Refresh the page and try again.');
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, container, {size: 'invisible'});
      }

      const result = await signInWithPhoneNumber(auth, normalizedPhoneNumber, recaptchaVerifierRef.current);
      setPhoneNumber(normalizedPhoneNumber);
      setConfirmationResult(result);
      toast.success('Verification code sent by SMS.');
    } catch(error) {
      console.error('Could not send phone verification code:', error);
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      toast.error(getPhoneAuthErrorMessage(error));
    } finally {
      setIsSendingCode(false);
    }
  }

  async function verifyPhoneNumber() {
    if(!confirmationResult) return;
    if(!/^\d{6}$/.test(verificationCode.trim())){
      toast.error('Enter the 6-digit code sent to your phone.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const {user} = await confirmationResult.confirm(verificationCode.trim());
      if(!user.phoneNumber) throw new Error('Firebase did not return a verified phone number.');

      setPhoneNumber(user.phoneNumber);
      setIsPhoneVerified(true);
      setVerificationCode('');
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      toast.success('Phone number verified. You can now complete sign-up.');
    } catch(error) {
      console.error('Could not verify phone number:', error);
      toast.error(getPhoneAuthErrorMessage(error));
    } finally {
      setIsVerifyingCode(false);
    }
  }

  async function changePhoneNumber() {
    try {
      if(isPhoneVerified) await signOut(auth);
      setIsPhoneVerified(false);
      setConfirmationResult(null);
      setVerificationCode('');
    } catch(error) {
      console.error('Could not reset phone verification:', error);
      toast.error(getPhoneAuthErrorMessage(error));
    }
  }
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {

    //the thing that we want to do. a db call like signing the user and logging in the user.
    try {
        if(type === 'sign-up'){
            const {name, email, password} = values;
            if(!isPhoneVerified){
              toast.error('Verify your phone number before creating an account.');
              return;
            }

            const phoneUser = auth.currentUser;
            const verifiedPhoneNumber = phoneUser?.phoneNumber;
            if(!phoneUser || !verifiedPhoneNumber || verifiedPhoneNumber !== phoneNumber){
              toast.error('Phone verification expired. Verify your phone number again.');
              setIsPhoneVerified(false);
              return;
            }

            let accountUser = phoneUser;
            const emailCredential = EmailAuthProvider.credential(email, password);
            if(accountUser.email){
              if(accountUser.email.toLowerCase() !== email.toLowerCase()){
                toast.error('This verified phone number is already linked to a different email.');
                return;
              }
              await reauthenticateWithCredential(accountUser, emailCredential);
            } else {
              accountUser = (await linkWithCredential(accountUser, emailCredential)).user;
            }

            await updateProfile(accountUser, {displayName: name ?? ''});
            const result = await signUp({
              uid: accountUser.uid,
              name: name ?? '',
              email,
              phoneNumber: verifiedPhoneNumber,
              idToken: await accountUser.getIdToken(true),
            })
            
            if(!result?.success){
              toast.error(result?.message)
              return 
            }

            await signOut(auth);
            toast.success("Account created successfully please sign-in")
            router.push("/sign-in")//after they've registered successfully we'll redirect user to firebase's sign-in so that they can now sign-in.
            //this method will now generate a token which we'll send to the server side and set a cookie.


        } else {//signin route
          const {email, password} = values;
          const userCredential = await signInWithEmailAndPassword(auth, email, password);//this will give us the userCredetials which we can use to create a short lived authentication token 

          const idToken = await userCredential.user.getIdToken();//and then we can check

          if(!idToken){
            toast.error("Sign-in failed")
            return;
          }

          //if the token was created then we pass it to the signIn function which will make a session cookie out of it.
          const result = await signIn({email, idToken});
          if(!result?.success){
            toast.error(result?.message ?? "Failed to log into an account");
            return;
          }
          //below part is for success, now we could have done all the work on the Client side, but it is less secure, see how we were using client side sdk(auth) in this authform
          //and admin side sdk in server actions
          //we can also perform server side checks like checking for roles or permissions.
          //and it's difficult to manage sessions on client, as tokens expire and require you to refresh them on the client side and that ain't ssr friendly
          //also make sure when you copy the environment variables from somewhere, you have to check that they are correct and don't include anything else except the value.
          //your firebase privatekey had an extra , at the end. so make sure to remove them.

          //now the 2nd thing is we're importing createUserwithEmail.. and signInUserwithEmail.. from @firebase/auth(firebase folder in root directory of our app), while we need it from firebase/auth(node modules)
          //now you can actually sign-up to create a user and sign-in and test both of those routes, we haven't yet made the home page auth secure tho.
          //just check those 2, now after creating the user go to firebase. project overview. authentication, you'll see the user.
          //and now let's protect the routes by checking if the user exists or not.
          //auth.actions.ts->getCurrentUser


          // console.log("Sign-in", values)//this time the values that come to us for being rendered are different as name is not there.
          toast.success("Logged in successfully.")
          router.push("/")//pushing the user to the homepage.
        }//we didn't use else if for sign-in as, we only have two routes anyways sign-in and up, if user types something else then he'll be redirected to a 404 page.
    } catch (error) {
        console.log(error)
        toast.error(`There was an error: ${error}`)//but to trigger this or any other toast, we have to first render the <toaster /> component in our app's layout that comes from sonner right below the childeren
        //now to allow the user to actually enter something we gotta use FormField component.

    }




  }

  //conditional rendering part through props
  const isSignin = type === 'sign-in'? true: false;


  // now we gotta render the form below, best thing is to just copy the code in the docs that renders the form and then make the changes you want accordingly.




  return (
    <div className='card-border lg:min-w-[566px]'>
        {/* this div below creates a card like div above the form */}
        <div className='flex flex-col gap-6 card py-14 px-10'>
            <div className="flex flex-row gap-2 justify-center">
                {/* this image tag is from nextjs and if you're wondering why the src is /logo.svg and not the whole path, that's because the root of this src is set in the public folder where all the static content is stored. */}
                <Image 
                src="/logo.svg" 
                alt="logo" 
                width={38} 
                height={38}
                />
                <h2 className='text-primary-100'>ProperView</h2>
            </div>
            <h3>Prepare For Your Interview with AI.</h3>
        
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
        {/* we were using a formfield component but it took a lot of space so we just turned it into a reusable component. we also modified it so see it there */}
        {!isSignin && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone-number" className="text-sm font-medium">Phone number</label>
              <Input
                id="phone-number"
                type="tel"
                autoComplete="tel"
                placeholder="+14155552671"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                disabled={isPhoneVerified || isSendingCode || isVerifyingCode}
              />
              <p className="text-sm text-muted-foreground">Include your country code in international format.</p>
            </div>

            {!confirmationResult && !isPhoneVerified && (
              <Button type="button" onClick={sendPhoneVerificationCode} disabled={isSendingCode}>
                {isSendingCode ? 'Sending code...' : 'Send verification code'}
              </Button>
            )}

            {confirmationResult && !isPhoneVerified && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="verification-code" className="text-sm font-medium">SMS verification code</label>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isVerifyingCode}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={verifyPhoneNumber} disabled={isVerifyingCode}>
                    {isVerifyingCode ? 'Verifying...' : 'Verify phone'}
                  </Button>
                  <Button type="button" variant="outline" onClick={changePhoneNumber} disabled={isVerifyingCode}>
                    Change number
                  </Button>
                  <Button type="button" variant="outline" onClick={sendPhoneVerificationCode} disabled={isSendingCode}>
                    {isSendingCode ? 'Sending...' : 'Resend code'}
                  </Button>
                </div>
              </div>
            )}

            {isPhoneVerified && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-green-600">Phone number verified.</p>
                <Button type="button" variant="outline" onClick={changePhoneNumber}>
                  Change number
                </Button>
              </div>
            )}
            <div ref={recaptchaContainerRef} />
          </div>
        )}

        <fieldset
          disabled={!isSignin && !isPhoneVerified}
          className={`space-y-6 ${!isSignin && !isPhoneVerified ? 'opacity-50' : ''}`}
        >
          {!isSignin && (<FormField control={form.control} name="name" label="Name" placeholder='Your Name' type="text"/>)}
          <FormField control={form.control} name="email" label="Email" placeholder='Your Email' type="email"/>
          <FormField control={form.control} name="password" label="Password" placeholder='Your Password' type="password"/>
          <Button type="submit" disabled={!isSignin && !isPhoneVerified}>
            {isSignin ? "Sign-in" : "Create an Account"}
          </Button>
        </fieldset>
      </form>
    </Form>
    {/* this p tag below allows us to switch between the two pages */}
    <p className="text-center">{ isSignin? "No account yet?": "Have an account already?"}
        <Link href={!isSignin? '/sign-in': '/sign-up'} className='font-bold text-user-primary ml-1'>
            { !isSignin? "Sign-in": "Sign-up"}
        </Link>
    </p>
    </div>
    </div>
  )
}

export default AuthForm