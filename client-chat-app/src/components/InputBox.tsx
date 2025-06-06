interface InputBoxProps {
    onInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    children?: React.ReactNode;
}

export function InputBox({ onInput, placeholder = "Search...", children }: InputBoxProps) {
    return (
        <div className="flex items-center bg-white border border-electric-blue rounded-2xl p-2 my-4 mx-2">
            <input type="text" placeholder={placeholder} onChange={onInput} className="w-full rounded outline-none"/>
            { children }
        </div>
    )
}