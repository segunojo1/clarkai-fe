import { Clock, Globe, PlusSquare } from 'lucide-react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { useWorkspaceStore } from '@/store/workspace.store'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const Workspaces = () => {
    const { workspaces, isLoading } = useWorkspaceStore()
    
    if (isLoading) {
        return (
            <section className='mt-[50px]'>
                <div className='text-[#A3A3A3] flex items-center gap-2 mb-5'>
                    <Clock />
                    <p className='text-[14px] font-medium'>Recently Visited</p>
                </div>

                <div className='flex items-center gap-2'>
                <Skeleton className="w-[117px] h-[117px] bg-white dark:bg-[#404040]" />
                <Skeleton className="w-[117px] h-[117px] bg-white dark:bg-[#404040]" />
                <Skeleton className="w-[117px] h-[117px] bg-white dark:bg-[#404040]" />

                <Skeleton className="w-[117px] h-[117px] bg-white dark:bg-[#404040]" />
                </div>
            </section>
        )
    }

    return (
        <section className='mt-[50px]'>
            <div className='text-[#A3A3A3] flex items-center gap-2 mb-5'>
                <Clock />
                <p className='text-[14px] font-medium'>Recently Visited</p>
            </div>
            
            {workspaces.length > 0 ? (
                <div className='flex items-center gap-2'>
                    {workspaces.slice(0, 6).map((workspace) => (
                        <Link href={`/workspaces/${workspace.enc_id}`} key={workspace.enc_id}>
                            <Card className="text-[#525252] dark:text-[#A3A3A3] bg-white dark:bg-[#2C2C2C] rounded-[10px] p-0 h-[117px] w-[117px] shadow-none mx-auto">
                                <div className='min-h-[46px] rounded-t-[10px] min-w-full bg-[#F0F0EF] dark:bg-[#404040] relative'>
                                    <Globe width={20} height={20} className='absolute -bottom-[30%] left-[10px]' />
                                </div>
                                <CardContent className="flex items-start justify-between px-[6px] h-full">
                                    <p className="text-[13px] font-medium satoshi text-start">{workspace.name}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {workspaces.length > 6 && (
                        <div>
                            <Link href='/workspaces' className='text-[13px] font-medium satoshi text-start underline'>
                                See more
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <Card className="text-[#525252] dark:text-[#A3A3A3] bg-white dark:bg-[#2C2C2C] rounded-[10px] p-0 h-[117px] w-[117px] shadow-none mx-auto">
                        <div className='min-h-[46px] rounded-t-[10px] min-w-full bg-[#F0F0EF] dark:bg-[#404040] relative'>
                            <PlusSquare width={20} height={20} className='absolute -bottom-[30%] left-[10px]' />
                        </div>
                        <CardContent className="flex items-start justify-between px-[6px] h-full">
                            <p className="text-[13px] font-medium satoshi text-start">
                                New <br /> workspace
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    )
}

export default Workspaces