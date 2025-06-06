interface FPMessageBoxProps { 
    message: string;
    time: string;
}

export function FPMessageBox({ message, time } : FPMessageBoxProps) {
    return (
        <div className="relative flex flex-col w-fit max-w-1/2 bg-electric-blue rounded-2xl p-2 m-2 self-end">
            <div className="absolute right-[-10px] top-3 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-electric-blue"></div>
            {message}    
            <div className="self-end text-sm text-gray-500">
                {time}
            </div>
        </div>
    );
}