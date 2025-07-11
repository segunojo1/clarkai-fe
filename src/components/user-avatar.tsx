'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const UserAvatar = () => {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Return default/light theme during SSR and before hydration
        return (
            <div>
                <Image src='/assets/user.svg' alt='' width={45} height={45} className='' />
            </div>
        )
    }

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