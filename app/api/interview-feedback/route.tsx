import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
const {messages} = await req.json();
const result =await axios.post(process.env.N8N_FEEDBACK_URL??'',{
  messages:JSON.stringify(messages) 
});
console.log(result);
return NextResponse.json(result.data?.message?.content);
}