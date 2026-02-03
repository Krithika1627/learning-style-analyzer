"use client"
import { useUser } from '@clerk/nextjs'
import React from 'react'

function page() {
    const {user}=useUser();
    if(!user) return <p>Loading...</p>;
  return (
    <div>
        <h1>My Profile</h1>
        <p>{user.fullName}</p>
    </div>
  );
}

export default page