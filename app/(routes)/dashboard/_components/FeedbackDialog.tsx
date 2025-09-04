import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
 import { ScrollArea } from "@/components/ui/scroll-area";

export type Props={
    fedbackInfo:FeedbackInfo

}

export type FeedbackInfo={
    feedback:string
    rating:number
    suggestions:string[]

}

function FeedbackDialog({fedbackInfo}:Props) {
  return (
   <Dialog>
  <DialogTrigger asChild><Button>Feedback</Button></DialogTrigger>
  <DialogContent className='scrollbar-thin'>
    <DialogHeader>
      <DialogTitle className='font-bold text-2xl'>Interview Feedback</DialogTitle>
      <DialogDescription >
         <ScrollArea className="h-[400px] w-full pr-4"> {/* Adjust height as needed */}
       <div>
        <h2 className='font-bold text-xl text-black'>Feedback:</h2>
        <p className='text-lg'>{fedbackInfo.feedback}</p>
        <div>
            <h2 className='font-bold text-xl text-black'>Suggestions:</h2>
            {fedbackInfo?.suggestions?.map((item,index)=>(
                <h2 className='p-2 my-1 bg-gray-50  text-lg rounded-lg flex gap-2'> {item}</h2>
            ))}
        </div>
        <h2 className='font-bold text-xl text-green-500'>Rating: <span className=' text-green-500'>{fedbackInfo.rating}</span> </h2>
       </div>
       </ScrollArea>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default FeedbackDialog