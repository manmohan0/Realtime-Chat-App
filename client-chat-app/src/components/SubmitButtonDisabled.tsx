interface SubmitButtonDisabled {
    text: string
}

export default function SubmitButtonDisabled ({ text } : SubmitButtonDisabled) {
    return <div className="w-full bg-gray-300 text-center text-white p-2 rounded cursor-not-allowed">
        {text}
    </div>
}