import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { env } from "process";
import axios from "axios";
import { aj } from "@/utils/arcjet";
import { currentUser } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { Cloud } from "lucide-react";
var imagekit = new ImageKit({
    publicKey : "public_WoAmr+1+ikOVLNeOm82t2f7vIug=",
    privateKey :  "private_74uzC8FXSOxqyCszDUc9nlhhlLJU=",
    urlEndpoint :  "https://ik.imagekit.io/Tubeguruji"
});


// Configure Cloudinary (use your own credentials)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});


export  async function POST(req: NextRequest) {
    try {  
        const user=await currentUser()
const formData=await req.formData();
const file=formData.get('file') as File;
const jobTitle=formData.get('jobTitle');
const jobDescription=formData.get('jobDescription');

// const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress??'', requested: 5 }); // Deduct 1 token from the bucket
// console.log("Arcjet decision", decision);

// //@ts-ignore
// if(decision.reason?.remaining==0)
// {
//     return NextResponse.json({ 
//         status: 429,
//         result: "No free credit remaining, Try again after 24 Hrs",
//     });
// }
if (file)
{
console.log("file",formData);
const bytes= await file.arrayBuffer();
const buffer= Buffer.from(bytes);

// Upload buffer to Cloudinary and get the URL
const uploadResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
        .upload_stream(
            { resource_type: "raw", folder: "uploads" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        )
        .end(buffer);
});

// The uploaded file's URL
const uploadedUrl = (uploadResponse as any).secure_url;
console.log('Cloudinary upload URL', uploadedUrl);
console.log('Cloudinary upload response', uploadResponse);


    //   console.log('Interview created successfully1');
    // const uploadResponse= await imagekit.upload({
    //     file: buffer,
    //     fileName: Date.now().toString()+".pdf",
    //     isPublished:false,
    //     useUniqueFileName:true
    // });
    //return NextResponse.json({url:"https://ik.imagekit.io/Tubeguruji/upload-1754663363140_dgZLgWl1n.pdf"}, {status: 200} );


    //call n8n webhook
    const result=await axios.post(process.env.N8N_QUESTION_GENERATION_URL??'', {
        // resumeUrl: "https://ik.imagekit.io/Tubeguruji/upload-1754663363140_dgZLgWl1n.pdf"
        resumeUrl: uploadedUrl
    });
    console.log('Webhook response', result.data);

    return NextResponse.json({
        questions:result.data?.message?.content?.InterviewQuestions,
        // resumeUrl:"https://ik.imagekit.io/Tubeguruji/upload-1754663363140_dgZLgWl1n.pdf",
        resumeUrl:uploadedUrl,
        jobTitle :null,
        jobDescription:null,
        status: 200
        // CloudinaryUploadUrl: uploadedUrl
    });
}
else {
    //call n8n webhook
    console.log('Webhook response started');
    const result=await axios.post(process.env.N8N_QUESTION_GENERATION_URL??'', {
        resumeUrl:null,
        jobTitle:jobTitle,
        jobDescription:jobDescription
    });
    console.log('Webhook response', result.data);

    return NextResponse.json({
        questions:result.data?.message?.content?.InterviewQuestions,
        resumeUrl:null,
         jobTitle :jobTitle,
        jobDescription:jobDescription,
         status: 200
    });
}

}
catch(error:any) {
    console.log('Upload error', error);
    return NextResponse.json({error: 'File Upload Failed'}, {status: 500});
}
}