import streakService from '@/services/streak.service'
import React, { useEffect, useState } from 'react'

interface StreakBoxProps {
  active: boolean
}

const StreakBox = ({ active }: StreakBoxProps) => (
  <div
    className={`w-[26px] h-[26px] rounded-[7.6px] shadow-md ${active
      ? 'bg-gradient-to-br from-[#FF3D00] via-[#FF3D00] to-[#FE8228]'
      : 'bg-[#F5F5F5] dark:bg-[#262626]'}`}
  />
)

const Streaks = () => {
  const [streakCount, setStreakCount] = useState(0);
  const totalDays = 30

  // Create an array of 30 days
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  useEffect(() => {
    const getStreak = async () => {
      const response = await streakService.getAndAddStreak()
      
    }

    getStreak()
  }, [])

  return (
    <section>


      <div className='flex flex-col justify-between gap-4 max-w-[342px] h-[245px] p-[14px] bg-[#F0F0EF] dark:bg-[#404040] rounded-[6px]'>
        <div className='flex flex-wrap gap-1'>
          {days.map((day) => (
            <StreakBox
              key={day}
              active={day <= streakCount}
            />
          ))}
        </div>
        <div>
          <p className='text-[18px] text-[#737373] dark:text-[#D4D4D4] font-bold satoshi'>{streakCount} day{streakCount !== 1 ? 's' : ''} streak</p>
          <p className='text-[14px] text-[#FF3D00] dark:text-[#FE8228]'>View Full Stats</p>
        </div>
      </div>
    </section>
  )
}

export default Streaks