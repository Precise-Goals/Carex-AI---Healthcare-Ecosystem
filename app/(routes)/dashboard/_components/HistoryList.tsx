"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import AddNewSession from './AddNewSession'

function HistoryList() {
  const [history] = useState([])

  return (
    <div className='mt-10'>
      {
        history.length == 0 ? (
          
          <div className="dashbox flex flex-col items-center justify-center gap-5 mt-5 p-7 border-2 border-dashed border-gray-200 rounded-2xl">
            <Image
              src="/medical-assistance.png"
              alt="No consultations"
              width={150}
              height={150}
            />
            <h2 className="font-bold">No Consultations Yet</h2>
            <p className="text-gray-500">You don&apos;t have any consultations with any doctor yet.</p>
            <AddNewSession />
          </div>
        ) : (
          <div></div>
        )
      }
    </div>
  )
}

export default HistoryList
