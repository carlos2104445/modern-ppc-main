import { FileDown, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
}

export function ExportButtons({ onExportCSV, onExportPDF, disabled = false }: ExportButtonsProps) {
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} data-testid="button-export">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV} data-testid="menu-item-export-csv">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} data-testid="menu-item-export-pdf">
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
