import React from 'react'
import { FormControl, FormLabel, FormDescription, FormMessage, FormItem } from './ui/form';
import { Input } from './ui/input';
import { Controller, FieldValues, Path, Control } from 'react-hook-form';



interface FormFieldProps <T extends FieldValues> {// this interface accepts a T parameter which extends one of the FieldValues, what this means is that you can have maybe a name, value or something else.
  //i.e whatever we pass to it, it'll take form of this generic t parameter
  control: Control<T>;//control takes this <T> parameter
  name: Path<T>;
  label: string;
  placeholder?: string; 
  type?: "text" | "email" | "password" | "file";

}

const FormField = ({control, name, label, placeholder, type="text"}: FormFieldProps<T>) => {//type= text by default., all of these will be of type FormFieldProps which accepts a generic T parameter.
  //which is what allows us to make it reusable
  return (
    <div>
        {/* <FormField
          control={form.control} instead of passing the control functionality to the formfield we're using a react-hook-form controller*/}
          <Controller 
            name={name}
            control = {control}
            render={({ field }) => (//render is just a callback function in which we can get access to properties of field(that user uses...)
            <FormItem>
              {/* formLabel has classname label. till now we were rendering static formfields but now we'll render dynamic in this commit, see authform where we statically rendered text name.*/}
              <FormLabel className={label}>{label}</FormLabel>
              <FormControl>
                <Input placeholder={placeholder} className='input' type={type} {...field} />
                {/* THIS IS HOW WE MADE SHIT DYNAMIC, NOW IN AUTHFORM.TSX WHAT IF WE GO ON ONSUBMIT FUNCTION AND WHAT IF WE SHOWED THE USER A SUCCESS TOAST MESSAGE AS WELL AS REDIRECTED THEM TO ANOTHER PATH THROUGH THE APP ROUTER THAT WE INSTALLED WHILE INITIALIZING THIS PROJECT WITH NEXTJS. */}
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription>
              NOT NEEDED. */}
              <FormMessage />
            </FormItem>
          )}
        />
    </div>
  )
}

export default FormField