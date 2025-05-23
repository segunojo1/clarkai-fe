'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'

const UserAvatar = () => {
    const { theme } = useTheme()
    return (
        <div>
            {theme === 'dark' ? (
                <Image src='/assets/user-dark.svg' alt='' width={45} height={45} className='' />
            ) : (
                <Image src='/assets/user.svg' alt='' width={45} height={45} className='' />
            )}
        </div>
    )
}

export default UserAvatar