"use client"

import React from 'react';
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
const authFormSchema = (type: string)=>{
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
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';//make sure this is the one from next/navigation not next/router




//NOW WE CAN IMPORT THIS FORM BOTH IN THE SIGNUP AND SIGNIN PAGES.

//see what's a sonner in the doc for shadcn.
//also search about forms in the docs and see the react hook form title and scroll down below to know how we create forms in apps. see usage
//now firstly we gonna use zod to define formSchema see the code that we copy pasted from docs.
//you'll notice that we're using the use client directive, that's because in nextjs as soon as we use some client side functionalities,
//like button click, input or form that becomes a client side component.

//now we have to define our form and the submit handler. which we do below.
//after that we gotta build the form that comprises of all the shadcn components that we imported.


const AuthForm = ({type}:{type: string}) => {//the rendering will be based on whether the type that was sent was sign-in or sign-up


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
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    //the thing that we want to do. a db call like signing the user and logging in the user.
    try {
        if(type === 'sign-up'){
            console.log("Sign-up", values)//rendering all the values that we're getting from the form.

            toast.success("Account created successfully please sign-in")
            router.push("/sign-in")
        } else {
            console.log("Sign-in", values)//this time the values that come to us for being rendered are different as name is not there.
            toast.success("Account created successfully please sign-in")
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
            {/* if this is not the signin page only then render the name. */}
            {!isSignin && (<FormField control={form.control} name="name" label="Name" placeholder='Your Name' type="text"/>)}{/**instead of statically rendering the name we're rendering formfield that we created. */}
            <FormField control={form.control} name="email" label="Email" placeholder='Your Email' type="email"/>
            <FormField control={form.control} name="password" label="Password" placeholder='Your Password' type="password"/> {/**now if you tried to put type as anything other thatn name, password text, file, it'd give an error see the interface we made. */}


        <Button type="submit">{ isSignin? "Sign-in": "Create an Account"}</Button>
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