import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search for books, furniture, electronics..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none bg-white shadow-sm pr-20"
        />
        <Button 
          type="submit"
          size="sm"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-teal-600"
        >
          <Search size={16} />
        </Button>
      </form>
    </div>
  );
}
