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

import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import { saveAs } from 'file-saver';
import { Player } from 'video-react'
 // Import the correct type from openai
  import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
  import OpenAI from 'openai';


export type InterviewData = {
  jobTitle: string | null,
  jobDescription: string | null,
  interviewQuestions: InterviewQuestions[],
  userId: string | null,
  _id: string,
  resumeUrl: string | null,
  status: string | null,
  Feedback: FeedbackInfo | null,
  candidateName: string | null,
  candidateEmail: string | null
}

type InterviewQuestions = {
  question: string,
  answer: string
}

type Messages = {
  from: 'user' | 'bot',
  text: string
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Store your API key in env variable
  dangerouslyAllowBrowser: true, // Allow usage in the browser (not recommended for production)
});

const CONTAINER_ID = 'akool_avatar_container';
//const AVATAR_ID = 'data_lira_sp-02';
//const AVATAR_ID = 'dvp_Tristan_cloth2_1080P';
const AVATAR_ID = 'dvp_Fourie_bg_stan_pd';
const DUMMY_CONVERSATION = "[{'from':'bot','text':'Tell me about yourself.'},{'from':'user','text':'I am React Developer working in IT from last 7 years'},{'from':'bot','text':'That's great to hear!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props? '},{'from':'user','text':'I am working in the IT industry from last seven years.'},{'from':'bot','text':'Thank you for sharing that!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props?'},{'from':'user','text':'It used to manage the state of the react application like setting the value or getting the value.'},{'from':'bot','text':'That's a good explanation!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'Prop is used to send value from one component to other.'},{'from':'bot','text':'Thank you for that clarification!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'There are different library as well but you can manage it using the useState.'},{'from':'bot','text':'Great!'},{'from':'bot','text':'Thank you for your insights.'}]";

function StartInterview() {
  const { interviewID } = useParams();
  const convex = useConvex();
  const [interviewData, setInterviewData] = useState<InterviewData>();
  const videoContainerRef = useRef<any>(null);
  const [agoraSDK, setAgoraSDK] = useState<GenericAgoraSDK | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [kbId, setKbId] = useState<string | null>();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessages] = useState<Messages[]>([]);
  const updateFeedback = useMutation(api.Interview.UpdateFeedback);
  const router = useRouter();
  const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>()
  const [stream, setStream] = useState<MediaStream | null>()
  const [videoBlob, setVideoUrlBlob] = useState<Blob | null>()
  const [type, setType] = useState<'video' | 'screen'>('screen')

  useEffect(() => {
    GetInterviewQuestions();

  }, [interviewID])

  const GetInterviewQuestions = async () => {
    // Fetch interview questions based on interviewID
    const result = await convex.query(api.Interview.GetInterviewQuestions, {
      //@ts-ignore
      interviewRecordId: interviewID
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

  const GetKnowledgeBase = async () => {
    const result = await axios.post("/api/akool-knowledge-base", {
      questions: interviewData?.interviewQuestions
    });
    console.log('result...:' + JSON.stringify(result));
    setKbId(result?.data?.data?._id);
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
        preferCurrentTab: true,
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
      let blob: Blob = await recorder.getBlob(); (stream as any).stop();
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
      
       // Stop webcam and microphone streams if active
    // Find the video element and stop its stream
    // const videoEl = document.querySelector('video');
    // if (videoEl && videoEl.srcObject) {
    //   const tracks = (videoEl.srcObject as MediaStream).getTracks();
    //   tracks.forEach(track => track.stop());
    //   videoEl.srcObject = null;
    // }
      //downloadVideo();
    }
  }

  const downloadVideo = () => {
    if (videoBlob) {
      const mp4File = new File([videoBlob], 'demo.mp4', { type: 'video/mp4' })
      saveAs(mp4File, `Video-${Date.now()}.mp4`)
      // saveAs(videoBlob, `Video-${Date.now()}.webm`)
    }
  }

  useEffect(() => {
    const sdk = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });
    // Register event handlers
    sdk.on({
      onStreamMessage: (uid, message) => {
        console.log("Received message from", uid, ":", message);
        //@ts-ignore
        message.pld?.text?.length > 0 && setMessages((prev: any) => [...prev, message.pld]);
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
    return () => {
      sdk.leaveChat();
      sdk.leaveChannel();
      sdk.closeStreaming();
    }
  }, [])

  const LevaeConversation = async () => {

    if (!agoraSDK) return;

    await agoraSDK.leaveChat();
    await agoraSDK.leaveChannel();
    await agoraSDK.closeStreaming();
    setMicOn(false);
    setJoined(false);

   

    await GenerateFeedback();
    await stopRecording();
    //router.replace('/');
  }

  const toggleMic = async () => {
    if (!agoraSDK) return;
    // Only toggle mic if joined to channel

    await agoraSDK?.toggleMic();
    setMicOn(agoraSDK?.isMicEnabled());

  }

  useEffect(() => {
    console.log(JSON.stringify(message));
  })

  const GenerateFeedback = async () => {
    if (process.env.NEXT_PUBLIC_N8N_ENABLED === "true") {
      toast.warning("Generating feedback... Please wait...");
      console.log("Generating feedback for messages:", message);
      const result = await axios.post("/api/interview-feedback", {
        messages: message
      });
      console.log(result.data);
      //toast.success("Feedback generated successfully");

      const resp = await updateFeedback({
        feedback: result.data,
        //@ts-ignore
        recordId: interviewID
      });
      console.log('feedback result:'+ resp);
      toast.success('Interview completed. Feedback will send to the HR.');
    }
    else
    {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Use the appropriate model name
      messages: [
        { role: 'system', content: 'Depends on User Interview Conversation message, generate feedback/report in details.  Suggest improvement if there is any. Also rate it out of 10. Give response in JSON with the field as feedback, list of suggestions and rating.' },
        { role: 'user', content: `messages:${message}` }
      ],
    });
    //console.log(completion.choices[0].message?.content);
    let feedbackContent = "";
    try {
      feedbackContent = JSON.parse(completion.choices[0].message?.content ?? "");
    } catch {
      feedbackContent = completion.choices[0].message?.content ?? "";
    }
       // console.log('OpenAI response 123:'+feedbackContent);
    // Remove leading/trailing backticks if present
    //feedbackContent = feedbackContent.replace(/^`|`$/g, '');
    // Remove "json" or "JSON" prefix if present
    //feedbackContent = feedbackContent.replace(/^json\s*|^JSON\s*/i, '');
    //console.log('OpenAI response', feedbackContent);
    // Remove all backticks from feedbackContent
    //feedbackContent  = feedbackContent.replace(/`/g, '');
    // Remove leading/trailing backticks if present
    //feedbackContent = feedbackContent.replace(/^`+|`+$/g, '');
    console.log('OpenAI response', feedbackContent);
    const resp = await updateFeedback({
      feedback: feedbackContent,
      //@ts-ignore
      recordId: interviewID
      });
    
      toast.success('Interview completed. Feedback will send to the HR.');
    
    }

    router.replace('/');

  }

  const StartConversation = async () => {

    if (!agoraSDK)
      return;
    await startRecording();
    console.log("Test 1");
    setLoading(true);
    console.log("Knowledge Base ID: " + kbId);
    //Create Akool session
    const result = await axios.post("/api/akool-session", {
      avatar_id: AVATAR_ID,
      knowledge_id: kbId
    });
    console.log("Test 3");
    console.log(result.data);
    const credintials = result?.data?.data?.credentials;
    //Connect to Agora Channel and start chat
    if (!credintials)
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

    const Prompt = `You are an experienced technical interviewer.  
Ask the user one interview question at a time. Wait for their response before asking the next question. Do not interrupt them before they complete the response for your question.
Start with: "Tell me about yourself".  
Then ask question one by one based on the below Resume, Job Title and Job Description.
Resume:  ${interviewData?.jobDescription}.  
Job Title: ${interviewData?.jobTitle}.
Job Description:  ${interviewData?.jobDescription}. 
Include a mix of Technical questions (based on job description), Scenario-based problem-solving questions, Soft skills and behavioral questions  and  Follow-up/clarifying questions to simulate a real interview. 
Make the interview interactive (respond to candidate’s answers with follow-ups).  
Keep the tone professional but conversational.  
Limit the interview to 2 questions total.
Conclude the interview with a closing question (e.g., "Do you have any questions for me?") and a polite thank-you note.  
`

    console.log(interviewData?.interviewQuestions);
    console.log("Prompt", Prompt);
    await agoraSDK.sendMessage(Prompt);

    await agoraSDK.toggleMic();

    setMicOn(true);
    setJoined(true);
    setLoading(false);
  }

  return (
    <div className='flex flex-col lg:flex-row w-full min-h-screen bg-gray-100 pl-10 pr-10 pt-10 pb-10 space-y-6 lg:space-y-0 lg:space-x-6'>

      <div className='flex flex-col items-center lg:w-1/3'>
        <h2 className='text-2xl font-bold mb-6'>AI Interviewer</h2>
        <div ref={videoContainerRef}
          id={CONTAINER_ID}
          className='rounded-2xl overflow-hidden border bg-white flex items-center justify-center'
          style={{
            width: 540,
            height: 380,
            marginTop: 20
          }}>
          {
            !joined && (
              <div>
                <div className="flex flex-col p-6 w-full  h-95 bg-white rounded-2xl  items-center justify-center">
                  <User size={100} className='text-gray-500' />
                  <span className="mt-4 text-gray-500">AI Interviewer Preview</span>
                </div>
              </div>
            )
          }
        </div>

      </div>
      <div className='flex flex-col lg:w-1/3'>
        <div>
          <h2 className='text-2xl font-bold mb-11 text-center'>Candidate</h2>
          {/* Display webcam when joined, otherwise show icon */}
          {joined ? (
            <video
              autoPlay
              playsInline
              muted
              width={540}
              height={400}
              ref={el => {
                if (el && !el.srcObject) {
                  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                    .then(stream => {
                      el.srcObject = stream;
                    })
                    .catch(() => { /* handle error if needed */ });
                }
              }}
              style={{ borderRadius: 12, border: '1px solid #ccc', background: '#000', transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="flex flex-col p-6 w-full  h-95 bg-white rounded-2xl border border-dashed border-gray-300  items-center justify-center">
              <User size={100} className="text-gray-500" />
              <span className="mt-4 text-gray-500">Candidate Preview</span>
            </div>

          )}
        </div>
        <div className="mt-6 flex space-x-4 text-center justify-center">
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
      <div className='flex flex-col lg:w-1/3 h-screen'>
        <h2 className='text-2xl font-bold mb-11 text-center'> Conversation </h2>
        <div
          className='flex-1  bg-white  rounded-xl p-4 space-y-3'
          style={{
            maxHeight: 380,
            overflowY: message?.length > 4 ? 'auto' : 'hidden'
          }}
        >
          {message?.length == 0 ? (
            <div>
              <p className='text-gray-500 text-center'>No Messages yet</p>
            </div>
          ) : (
            <div>
              {message?.map((msg, index) => (
                <div key={index}>
                  <h2
                    className={`p-3 rounded-lg max-w-[80%] mt-1
            ${msg.from === 'user'
                        ? "bg-blue-100 text-blue-700 self-start"
                        : "bg-green-100 text-green-700 self-end"
                      }
                `}
                  >
                    {msg.text}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default StartInterview