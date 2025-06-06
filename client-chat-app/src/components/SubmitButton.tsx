interface SubmitButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    text: string;
}

export function SubmitButton({ onClick, text }: SubmitButtonProps) {
    return (
        <button type="submit" onClick={onClick} className="w-full bg-electric-blue text-white p-2 rounded hover:bg-hover-electric-blue hover:cursor-pointer">{ text }</button>
    );
}