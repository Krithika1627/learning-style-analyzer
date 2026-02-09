"use client"
import { useUser } from '@clerk/nextjs'
import React from 'react'
import { redirect } from "next/navigation";

function page() {
    const {user}=useUser();
    if(!user) redirect("/sign-in");
  return (
    <div>
        <h1>My Profile</h1>
        <p>{user.fullName}</p>
    </div>
  );
}

export default page