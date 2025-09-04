"use client";
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { createContext, useEffect, useState} from 'react'

function Provider({ children}:any) {
  const{user} =useUser();
  const [userDetail,setUserDetail]=useState<any>();
  const CreateUser=useMutation(api.users.CreateNewUser);

  useEffect(()=>{
    user&&CreateNewUser();
  },[user])

  const CreateNewUser=async ()=>{
    if(user)
    {
    const result=await CreateUser({
      name:user?.fullName??'',
      imageUrl:user?.imageUrl,
      email:user?.primaryEmailAddress?.emailAddress??''
    });
    console.log(result);
    setUserDetail(result);
    }
  }
  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
    <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider

export const useUserDetailContext=()=>{
   return createContext(UserDetailContext);
   }