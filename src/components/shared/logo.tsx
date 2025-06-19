import Image from 'next/image'
import React from 'react'

const Logo = () => {
  return (
    <div className='w-fit'>
        <Image src='/assets/clarklogo.svg' alt='clark logo' width={103} height={90} className='md:w-[103px] w-[80px]'/>
    </div>
  )
}

export default Logo