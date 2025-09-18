"use client"
import React, { useEffect, useRef, useState } from 'react'
import page from '../../upgrade/page'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Send } from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import { saveAs } from 'file-saver';
import { Player } from 'video-react'
import { toast } from 'sonner';




function Interview() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    const {interviewID} = useParams();
    console.log(`${baseUrl}/interview/${interviewID}/start`);
      const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>()
    const [stream, setStream] = useState<MediaStream | null>()
    const [videoBlob, setVideoUrlBlob] = useState<Blob | null>()
    const [type, setType] = useState<'video' | 'screen'>('screen')
    

    const SendInterviewLink = async (interviewID:any, toEmail:any) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  console.log(interviewID)
  console.log(toEmail)
  console.log(baseUrl);
  console.log(`${baseUrl}/interview/${interviewID}/start`);

  try {
    const result = await axios.post("/api/send-interview-link", {
      subject: 'XBP Global Interview Link',
      body: `${baseUrl}/interview/${interviewID}/start`,
      toEmail: toEmail
    });
    console.log('Email sent successfully:', result.data);
    alert('Interview link sent successfully!');
  } catch (error: any) {
    //console.error('Failed to send interview link:', error?.response?.data || error.message);
    //alert('Failed to send interview link. Please check the email address and try again.');
  }
}

const startRecording = async () => {
    const mediaDevices = navigator.mediaDevices
    console.log("Starting recording..." + type);
    let stream: MediaStream;
    if (type === 'video') {
      // Get webcam video + audio
      stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } else {
      // Get screen video, then merge with microphone audio
      const screenStream = await (mediaDevices as any).getDisplayMedia({
        
        video: true,
        audio: true,// getDisplayMedia's audio is unreliable across browsers
        // preferCurrentTab: true, 
      });
      const audioStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Combine video track from screen and audio track from mic
      // Merge screen audio and microphone audio into a single audio track
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Add screen audio tracks (if any)
      screenStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(destination);
      });

      // Add microphone audio tracks
      audioStream.getAudioTracks().forEach(track => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(destination);
      });

      // Combine video track from screen and the mixed audio track
      const combinedTracks = [
        ...screenStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ];
      stream = new MediaStream(combinedTracks);
    }
    const recorder: RecordRTCPromisesHandler = new RecordRTCPromisesHandler(stream, {
      type: 'video',
    })
    await recorder.startRecording()
    setRecorder(recorder)
    setStream(stream)
    setVideoUrlBlob(null)
  }

  const stopRecording = async () => {
    if (recorder) {
      await recorder.stopRecording()
      let blob: Blob = await recorder.getBlob()
        ; (stream as any).stop()
      // Ensure blob has correct type and size
      if (blob && blob.size > 0 && blob.type !== 'video/mp4') {
        blob = new Blob([blob], { type: 'video/mp4' });
      }
      setVideoUrlBlob(blob)
      // Save the blob file to a server path
      const formData = new FormData();
      formData.append('file', blob, `interview-${interviewID}.mp4`);
      try {
        await axios.post('/api/upload-interview-video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Video uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload video');
        console.error(error);
      }
      console.log("Blob", blob, "size:", blob.size, "type:", blob.type);
      setStream(null)
      setRecorder(null)
      //downloadVideo();
    }
  }


  return (
    <div className='flex flex-col items-center justify-center mt-10'>
        <div className='max-w-3xl w-full'>
   <Image src={'/Banner.png'} alt='interview' 
   width={400} height={200} 
   className='w-full h-[300px] object-cover'/>

   <div className='p-6 flex flex-col items-center space-y-4'>
 <h2 className='text-3xl font-bold text-center'>Ready to start Interview?</h2>
 <p className='text-gray-600 text-center'>Ensure your internet connection and equipment (camera, microphone, speakers) are tested, and log in early. During the interview, speak clearly, pause before answering, listen actively, and have your resume and questions for the interviewer ready. </p>
{/* <Link href={`/interview/${interviewID}/start`} target="_blank" rel="noopener noreferrer">
  <Button onClick={startRecording}>Start Interview <ArrowRight /></Button>
</Link> */}
<Link href={`/interview/${interviewID}/start`}>
  <Button>Start Interview <ArrowRight /></Button>
</Link>

  {/* <Button onClick={stopRecording}>Stop Interview <ArrowRight /></Button> */}

<hr/>
 <div className='p-6 bg-gray-100 rounded-2xl'>
 <h2 className='font-semibold text-2xl'>Want to send interview link to someone?</h2>
 <div className='flex gap-5 w-full items-center max-w-xl mt-2'>
   <input  value={`${baseUrl}/interview/${interviewID}/start`} className='w-full max-w-2xl border-5 border-gray-300 p-2 rounded-xl' />
 <input  id="toEmailInput" placeholder='Enter email address' className='w-full max-w-2xl border-5 border-gray-300 p-2 rounded-xl' />
 <button onClick={() => SendInterviewLink(interviewID, (document.getElementById('toEmailInput') as HTMLInputElement)?.value)}>
  <Send />
 </button>
 </div>
 </div>

   </div>
   </div>
</div>
   
  )
}

export default Interview