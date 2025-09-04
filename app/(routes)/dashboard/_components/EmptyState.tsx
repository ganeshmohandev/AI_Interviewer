import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import CreateInterviewDialog from '../../_components/CreateInterviewDialog'

function EmptyState() {
  return (
    <div  className='mt-14 flex flex-col items-center justify-center gap-5 border-dashed p-10 border-4 rounded-2xl bg-gray-50'>
    <Image src={'/Interview.png'} alt='emptyState' width={130} height={130} />
    <h2 className='mt-2 text-lg text-gray-500'> No Interviews Created Yet</h2>
    <CreateInterviewDialog />
    </div>


  )
}

export default EmptyState