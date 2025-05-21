import { Clock, PlusSquare } from 'lucide-react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from '../ui/button'

const Workspaces = () => {
    return (
        <section className='mt-[50px]'>
            <div className='text-[#A3A3A3] flex items-center gap-2 mb-5'>
                <Clock />
                <p className='text-[14px] font-medium'>Recently Visited</p>
            </div>

            <div>
                <Card className="text-[#525252] dark:text-[#A3A3A3] bg-white dark:bg-[#2C2C2C] rounded-[10px] p-0 h-[117px] w-[117px] shadow-none mx-auto">
                    <div className='min-h-[46px] rounded-t-[10px] min-w-full bg-[#F0F0EF] dark:bg-[#404040] relative'>
                    <PlusSquare width={20} height={20} className='absolute -bottom-[30%] left-[10px]'/>

                    </div>
                    <CardContent className=" flex items-start justify-between px-[6px] h-full">
                        <p className=" text-[13px] font-medium satoshi text-start">New <br /> workspace</p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default Workspaces