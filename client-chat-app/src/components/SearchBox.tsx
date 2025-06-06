import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SearchBoxProps {
    onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export function SearchBox({ onSearch, placeholder = "Search..." }: SearchBoxProps) {
    return (
        <div className="flex items-center bg-white border rounded-2xl p-2 m-2">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input type="text" placeholder={placeholder} onChange={onSearch} className="w-full p-2 rounded outline-none"/>
        </div>
    )
}