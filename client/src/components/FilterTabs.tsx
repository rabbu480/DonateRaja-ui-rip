import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, HandHeart, Book, Sofa, Laptop, Shirt, Dumbbell, Package } from "lucide-react";
import { SearchFilters } from "@/lib/types";

interface FilterTabsProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const filterOptions = [
  { key: "all", label: "All", icon: Package },
  { key: "donate", label: "Donations", icon: Gift, type: "type" },
  { key: "rent", label: "Rentals", icon: HandHeart, type: "type" },
  { key: "Books", label: "Books", icon: Book, type: "category" },
  { key: "Furniture", label: "Furniture", icon: Sofa, type: "category" },
  { key: "Electronics", label: "Electronics", icon: Laptop, type: "category" },
  { key: "Clothing", label: "Clothing", icon: Shirt, type: "category" },
  { key: "Sports", label: "Sports", icon: Dumbbell, type: "category" },
];

export default function FilterTabs({ filters, onFilterChange }: FilterTabsProps) {
  const handleFilterClick = (key: string, type?: string) => {
    if (key === "all") {
      onFilterChange({ ...filters, type: undefined, category: undefined });
    } else if (type === "type") {
      onFilterChange({ ...filters, type: key === filters.type ? undefined : key });
    } else if (type === "category") {
      onFilterChange({ ...filters, category: key === filters.category ? undefined : key });
    }
  };

  const isActive = (key: string, type?: string) => {
    if (key === "all") {
      return !filters.type && !filters.category;
    } else if (type === "type") {
      return filters.type === key;
    } else if (type === "category") {
      return filters.category === key;
    }
    return false;
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const active = isActive(option.key, option.type);
        
        return (
          <Button
            key={option.key}
            variant={active ? "default" : "outline"}
            onClick={() => handleFilterClick(option.key, option.type)}
            className={`px-6 py-3 rounded-full font-medium transition-all shadow-sm ${
              active 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <Icon size={16} className="mr-2" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
