"use client"
import React from 'react'
import page from '../../upgrade/page'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Send } from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

function Interview() {
    const {interviewID} = useParams();
  return (
    <div className='flex flex-col items-center justify-center mt-10'>
        <div className='max-w-3xl w-full'>
   <Image src={'/Banner.png'} alt='interview' 
   width={400} height={200} 
   className='w-full h-[300px] object-cover'/>

   <div className='p-6 flex flex-col items-center space-y-4'>
 <h2 className='text-3xl font-bold text-center'>Ready to start Interview?</h2>
 <p className='text-gray-600 text-center'>Ensure your internet connection and equipment (camera, microphone, speakers) are tested, and log in early. During the interview, speak clearly, pause before answering, listen actively, and have your resume and questions for the interviewer ready. </p>
<Link href={`/interview/${interviewID}/start`}>
 <Button>Start Interview <ArrowRight></ArrowRight></Button>
 </Link>

<hr/>
 <div className='p-6 bg-gray-100 rounded-2xl'>
 <h2 className='font-semibold text-2xl'>Want to send interview link to someone?</h2>
 <div className='flex gap-5 w-full items-center max-w-xl mt-2'>
 <input placeholder='Enter email address' className='w-full max-w-2xl border-5 border-gray-300 p-2 rounded-xl' />
 <button><Send/></button>
 </div>
 </div>

   </div>
   </div>
</div>
   
  )
}

export default Interview