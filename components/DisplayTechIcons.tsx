import { getTechLogos } from '@/lib/utils'
import Image from 'next/image';
import React from 'react'
import { cn } from '@/lib/utils';//this is a function from utils and shadcn gives it read doc.
const DisplayTechIcons =async ({techStack}: TechIconProps) => {//you can ctrl+click to see the tech props btw.
    const techIcons = await getTechLogos(techStack);//you can ctrl+click to see how this works.
  return (
    <div className='flex flex-row'>{techIcons.slice(0,3).//we'll display 4 icons.
        map(({tech, url}, index)=>(//destructuring tech and url from an icon.

            //we're giving it a dynamic classname, we can pass cn() function a prebuilt string but then in the 2nd arg also provide a dynamic style(changing style)
            <div key={tech} className={cn("relative group bg-violet-900 border-amber-300 border-2 rounded-full p-2 flex-center",index >= 1 && '-ml-4')}>
                {/* && returns last truthy, so if index >=1 then give them a ml(margin left) of 4 */}
                <span className="tech-tooltip">{tech}</span>
                <Image src={url} alt="tech" width={100} height={100} className='size-5'/>
            </div>
        ))}</div>
  )
}

export default DisplayTechIcons