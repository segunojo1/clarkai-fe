import React from 'react'

const Calendar = () => {
  return (
    <div className='w-[342px] h-[245px] bg-[#F0F0EF] dark:bg-[#404040] rounded-[6px] flex pl-[15px] pr-[35px] pb-[15px] flex-col items-start justify-end gap-[10px]'>
        <h2 className='text-[#737373] dark:text-[#FAFAFA] text-[18px] font-bold satoshi'>Keep track of your studies and stay Organized with <span>Clarlender.</span></h2>
        <p className='text-[14px] text-[#525252] dark:text-[#D4D4D4]'>Connect or Create your calendar to see classes and study blocks in Clark.</p>
        <p className='text-[14px] text-[#FF3D00] dark:text-[#FE8228]'>Create your Clarlender</p>
    </div>
  )
}

export default Calendar