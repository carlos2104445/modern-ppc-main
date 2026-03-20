import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive";
}

interface BulkActionsProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
  actions: BulkAction[];
}

export function BulkActions({ selectedIds, totalCount, onSelectAll, actions }: BulkActionsProps) {
  const allSelected = selectedIds.length === totalCount && totalCount > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalCount;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-3">
      <Checkbox
        checked={allSelected}
        onCheckedChange={onSelectAll}
        aria-label="Select all"
        className="data-[state=indeterminate]:bg-primary"
        data-testid="checkbox-select-all"
        {...(someSelected && { "data-state": "indeterminate" })}
      />
      <span className="text-sm text-muted-foreground">
        {selectedIds.length === 0
          ? `Select items (${totalCount} total)`
          : `${selectedIds.length} selected`}
      </span>

      {selectedIds.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-bulk-actions">
              Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(selectedIds)}
                className={
                  action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""
                }
                data-testid={`menu-item-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface BulkSelectCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function BulkSelectCheckbox({ id, checked, onCheckedChange }: BulkSelectCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={`Select item ${id}`}
      data-testid={`checkbox-select-${id}`}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
