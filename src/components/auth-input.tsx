// components/ui/styled-button.tsx

import { Input } from "./ui/input"

export const PrimaryInput = ({ className = '', ...props }: { className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Input
      className={`text-[16px] font-normal py-[11px] px-4 boder-[1px] rounded-[5px] h-full border-[#D4D4D4] ${className}`}
      {...props}
    />
  )
}