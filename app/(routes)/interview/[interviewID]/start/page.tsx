"use client"
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';
import { Button } from '@/components/ui/button';
import { Turret_Road } from 'next/font/google';
import { Mic, MicOff, PhoneCall, PhoneOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackInfo } from '@/app/(routes)/dashboard/_components/FeedbackDialog';


export type InterviewData={
    jobTitle:string|null,
    jobDescription:string|null,
    interviewQuestions: InterviewQuestions[],
    userId:string|null,
    _id:string,
    resumeUrl:string|null,
    status:string|null,
    Feedback:FeedbackInfo|null
}

type InterviewQuestions={
    question:string,
    answer:string
}

type Messages={
  from:'user'|'bot',
  text: string
}

const CONTAINER_ID = 'akool_avatar_container';
//const AVATAR_ID = 'data_lira_sp-02';
const AVATAR_ID = 'dvp_Tristan_cloth2_1080P';
const DUMMY_CONVERSATION="[{'from':'bot','text':'Tell me about yourself.'},{'from':'user','text':'I am React Developer working in IT from last 7 years'},{'from':'bot','text':'That's great to hear!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props? '},{'from':'user','text':'I am working in the IT industry from last seven years.'},{'from':'bot','text':'Thank you for sharing that!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props?'},{'from':'user','text':'It used to manage the state of the react application like setting the value or getting the value.'},{'from':'bot','text':'That's a good explanation!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'Prop is used to send value from one component to other.'},{'from':'bot','text':'Thank you for that clarification!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'There are different library as well but you can manage it using the useState.'},{'from':'bot','text':'Great!'},{'from':'bot','text':'Thank you for your insights.'}]";

function StartInterview() {
    const {interviewID}= useParams();
    const convex=useConvex();
    const [interviewData,setInterviewData]=useState<InterviewData>();
    const videoContainerRef=useRef<any>(null);
    const [agoraSDK,setAgoraSDK]=useState<GenericAgoraSDK|null>(null);
    const [micOn,setMicOn]=useState(false);
    const [kbId, setKbId] = useState<string|null>();
    const [joined,setJoined] = useState(false);
    const [loading,setLoading]=useState(false);
    const [message,setMessages]=useState<Messages[]>([]);
    const updateFeedback=useMutation(api.Interview.UpdateFeedback);
    const router=useRouter();

    useEffect(()=>{
        GetInterviewQuestions();
       
    },[interviewID])

    const GetInterviewQuestions=async ()=>{
        // Fetch interview questions based on interviewID
        const result=await convex.query(api.Interview.GetInterviewQuestions,{
            //@ts-ignore
            interviewRecordId:interviewID
        });
        console.log(result);
        //setInterviewData(result);
          setInterviewData({
            ...result,
            Feedback: result.Feedback ?? null
        });
        
        

    }

    // useEffect(() => {
    //     if (interviewData) {
    //         GetKnowledgeBase();
    //     }
    // }, [interviewData]);

    const GetKnowledgeBase=async ()=>{
        const result=await axios.post("/api/akool-knowledge-base",{
            questions: interviewData?.interviewQuestions
        });
        console.log(result);
        setKbId(result?.data?.data?._id);
    }

useEffect(() => {
const sdk = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });
        // Register event handlers
sdk.on({
  onStreamMessage: (uid, message) => {
    console.log("Received message from", uid, ":", message);
    //@ts-ignore
   message.pld?.text?.length>0 && setMessages((prev:any) => [...prev, message.pld]);
  },
  onException: (error) => {
    console.error("An exception occurred:", error);
  },
  onMessageReceived: (message) => {
    console.log("New message:", message);
  },
  onMessageUpdated: (message) => {
    console.log("Message updated:", message);
  },
  onNetworkStatsUpdated: (stats) => {
    console.log("Network stats:", stats);
  },
  onTokenWillExpire: () => {
    console.log("Token will expire in 30s");
  },
  onTokenDidExpire: () => {
    console.log("Token expired");
  },
  onUserPublished: async (user, mediaType) => {
    if (mediaType === 'video') {
        await sdk.getClient().subscribe(user, mediaType);
        user?.videoTrack?.play(videoContainerRef.current);
        //videoContainerRef
    //   const remoteTrack = await sdk.getClient().subscribe(user, mediaType);
    //   remoteTrack?.play('remote-video'); // play the video in the div with id 'remote-video'
    } else if (mediaType === 'audio') {
        await sdk.getClient().subscribe(user, mediaType);
        user?.audioTrack?.play();
    //   const remoteTrack = await sdk.getClient().subscribe(user, mediaType);
    //   remoteTrack?.play();
    }
  }
});
setAgoraSDK(sdk);
return ()=>{
    sdk.leaveChat();
    sdk.leaveChannel();
    sdk.closeStreaming();
}
},[])
   
    const LevaeConversation=async ()=>{
        if(!agoraSDK) return;
        await agoraSDK.leaveChat();
        await agoraSDK.leaveChannel();
        await agoraSDK.closeStreaming();
        setMicOn(false);
        setJoined(false);
        await GenerateFeedback();
    }

    const toggleMic=async ()=>{
        if(!agoraSDK) return;
        // Only toggle mic if joined to channel
      
            await agoraSDK?.toggleMic();
            setMicOn(agoraSDK?.isMicEnabled());
        
    }

    useEffect(()=>{
      console.log(JSON.stringify(message));
    })

    const GenerateFeedback=async ()=>{
      toast.warning("Generating feedback... Please wait...");
      console.log("Generating feedback for messages:", message);
       const result=await axios.post("/api/interview-feedback",{
        messages:message
       });
       console.log(result.data);
       toast.success("Feedback generated successfully");

       const resp=await updateFeedback({
        feedback: result.data,
        //@ts-ignore
        recordId: interviewID
       });
       console.log(resp);
       toast.success('Interview completed');
        router.replace('/dashboard');

    }

    const StartConversation=async ()=>{
        if(!agoraSDK)
          return;
        setLoading(true);
        //Create Akool session
        const result=await axios.post("/api/akool-session",{    
            avatar_id: AVATAR_ID,
            knowledge_id: kbId
        });
        console.log(result.data);
        const credintials=result?.data?.data?.credentials;
        //Connect to Agora Channel and start chat
        if(!credintials)
            throw new Error("Failed to create Akool session-Missing credintails");
        await agoraSDK?.joinChannel({
            agora_app_id: credintials.agora_app_id,
            agora_channel: credintials.agora_channel,
            agora_token: credintials.agora_token,
            agora_uid: credintials.agora_uid
        });

        // Initialize chat with avatar parameters
await agoraSDK.joinChat({
  vid: "en-US-Wavenet-A",
  lang: "en",
  mode: 2 // 1 for repeat mode, 2 for dialog mode
});

const Prompt= `You are a friendly job interviewer.
Ask the user one interview question at a time.
Wait for their spoken response before asking the next question.
Start with: "Tell me about yourself."
Then ask following question one by one.
Speak in a professional and encouraging tone.
questions:
${interviewData?.interviewQuestions.map((q:any)=>q.question).join("\n")}
After the user responds, ask the next question in the list. Do not repeat previous questions.
`

await agoraSDK.sendMessage(Prompt);

await agoraSDK.toggleMic();

setMicOn(true);
setJoined(true);
setLoading(false);
    }

  return (
    <div className='flex flex-col lg:flex-row w-full min-h-screen  bg-gray-100'>
      <div className='flex flex-col items-center p-6 lg:w-2/3'>
      <h2 className='text-2xl font-bold mb-6'>Interview Session</h2>
            <div ref={videoContainerRef} 
            id={CONTAINER_ID} 
            className='rounded-2xl overflow-hidden border bg-white flex items-center justify-center'
            style={{ 
                width: 640, 
                height: 480, 
                marginTop: 20 }}>
                  {
                    !joined && (
                      <div>
                        <div>
                          <User size={100} className='text-gray-500' />
                        </div>
                      </div>
                    )
                  }
            </div>

{/* Removed        */}
{/* <div>
    <Button onClick={ToggleMic}>{micOn ? "Mute" : "Unmute"}</Button>
    
    {!joined?<Button onClick={StartConversation}>Start Conversation</Button>
    : <Button onClick={LevaeConversation} >Leave Conversation</Button>}
</div> */}
{/* Removed        */}


<div className="mt-6 flex space-x-4">
    {!joined ? (
        <button
            onClick={StartConversation}
            disabled={loading}
            className="flex items-center px-5 py-3 bg-green-500 text-white hover:bg-green-400 rounded-full shadow-lg transition disabled:opacity-50"
        >
            <PhoneCall className="mr-2" size={20} />
            {loading ? "Connecting..." : "Connect Call"}
        </button>
    ) : (
        <>
            <button
                onClick={toggleMic}
                className={`flex items-center px-5 py-3 rounded-full shadow-lg transition ${micOn 
                    ? "bg-yellow-400 hover:bg-yellow-300 text-white" 
                    : "bg-gray-300 hover:bg-gray-200 text-gray-800"
                }`}
            >
                {micOn ? (
                    <>
                        <Mic className="mr-2" size={20} /> Mute
                    </>
                ) : (
                   <>
                        <MicOff className="mr-2" size={20} /> Unmute
                   </>
                  )}
            </button>
<button
onClick={LevaeConversation}
className="flex items-center px-5 py-3 bg-red-600 rounded-full"
>
    <PhoneOff className="mr-2" size={20} /> End Call
</button>
</>
)}
</div>


</div>
<div className='flex flex-col p-6 lg:w-1/3 h-screen overflow-auto border'>
 <h2 className='text-lg font-semibold my-4'> Conversation </h2>
 <div className='flex-1 border border-gray-200 rounded-xl p-4 space-y-3'>
  {message?.length==0? 
  <div>
   <p>No Messages yet</p>
  </div>
  :<div>
    {message?.map((msg,index)=>(
      <div key={index} >
        <h2 className={`p-3 rounded-lg max-w-[80%] mt-1
        ${msg.from==='user'?"bg-blue-100 text-blue-700 self-start":
          "bg-green-100 text-green-700 self-end"}
        `}>{msg.text}</h2>
      </div>
    ))}
  </div>
}
 </div>
</div>
    </div>
  )
}

export default StartInterview