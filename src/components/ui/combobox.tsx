"use client";

import { useId, useRef, useState } from "react";
import { Command } from "cmdk";
import { Popover } from "radix-ui";
import { motion, useReducedMotion } from "motion/react";
import { CaretDown, Check, MagnifyingGlass, PencilSimpleLine, X } from "@phosphor-icons/react";
import { cn } from "cn";

export type ComboboxGroup = { heading: string; options: string[] };

type ComboboxProps = {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  /** Flat options, or grouped options with headings. */
  options?: string[];
  groups?: ComboboxGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Let the student use what they typed when it's not in the list. */
  allowCustom?: boolean;
  /** Hide the search box (short lists like years). */
  searchable?: boolean;
  invalid?: boolean;
  emptyText?: string;
  className?: string;
  "aria-label"?: string;
};

/**
 * Searchable dropdown: click to open, type to filter, arrow keys + Enter to pick.
 * With `allowCustom`, a typed value that isn't listed can still be used.
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  groups,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  allowCustom = false,
  searchable = true,
  invalid,
  emptyText = "No matches.",
  className,
  ...rest
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allGroups: ComboboxGroup[] = groups ?? [{ heading: "", options: options ?? [] }];
  const flat = allGroups.flatMap((g) => g.options);
  const trimmed = search.trim();
  const exact = flat.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const isCustomValue = !!value && !flat.includes(value);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <Popover.Trigger asChild>
        <motion.button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={invalid || undefined}
          aria-label={rest["aria-label"]}
          whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          className={cn(
            "group flex h-12 w-full items-center gap-2 rounded-2xl border border-input bg-white px-4 text-left text-base shadow-xs outline-none transition-[border-color,box-shadow] md:text-sm",
            "hover:border-ink/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            open && "border-ink/40 ring-[3px] ring-primary/40",
            className
          )}
        >
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          {isCustomValue ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              typed
            </span>
          ) : null}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-ink"
          >
            <CaretDown weight="bold" className="size-3.5" />
          </motion.span>
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          // Keep clear of the sticky header and the mobile action/tab bars; flips up if needed.
          collisionPadding={{ top: 88, bottom: 156, left: 12, right: 12 }}
          onOpenAutoFocus={(e) => {
            // Focus the search box ourselves (without scrolling the page) so typing always filters.
            e.preventDefault();
            if (searchable) {
              requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
            } else {
              requestAnimationFrame(() =>
                listRef.current?.focus({ preventScroll: true })
              );
            }
          }}
          className={cn(
            "z-[70] w-[var(--radix-popover-trigger-width)] min-w-[240px] overflow-hidden rounded-2xl border border-border bg-white shadow-card-hover",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            "origin-[var(--radix-popover-content-transform-origin)]"
          )}
        >
          <Command
            ref={listRef}
            tabIndex={-1}
            loop
            label={rest["aria-label"] ?? placeholder}
            shouldFilter={searchable}
            filter={wordFilter}
            className="outline-none"
          >
            {searchable ? (
              <div className="flex items-center gap-2 border-b border-border px-3">
                <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={searchPlaceholder}
                  className="h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
                />
                {search ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <Command.List
              id={listId}
              className="max-h-[max(140px,min(320px,calc(var(--radix-popover-content-available-height)-96px)))] overflow-y-auto overscroll-contain p-1.5"
            >
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                {allowCustom && trimmed ? null : emptyText}
              </Command.Empty>
              {allGroups.map((group) => (
                <Command.Group
                  key={group.heading || "all"}
                  heading={group.heading || undefined}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {group.options.map((option) => {
                    const selected = option === value;
                    return (
                      <Command.Item
                        key={option}
                        value={option}
                        onSelect={() => pick(option)}
                        className={itemCls}
                      >
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full transition-colors",
                            selected ? "bg-primary text-ink" : "text-transparent"
                          )}
                        >
                          <Check weight="bold" className="size-3" />
                        </span>
                        <span className={cn("truncate", selected && "font-semibold")}>{option}</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
              {/* Last, so a listed match stays highlighted first; alone when nothing matches. */}
              {allowCustom && trimmed && !exact ? (
                <Command.Group forceMount>
                  <Command.Item
                    forceMount
                    value={`__custom__${trimmed}`}
                    onSelect={() => pick(trimmed)}
                    className={cn(itemCls, "border-t border-dashed border-border")}
                  >
                    <PencilSimpleLine className="size-4 shrink-0 text-forest" />
                    <span className="truncate">
                      Use “<span className="font-semibold">{trimmed}</span>”
                    </span>
                  </Command.Item>
                </Command.Group>
              ) : null}
            </Command.List>
          </Command>
          {allowCustom ? (
            <p className="border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              Not listed? Type it and press Enter.
            </p>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * Every typed word must appear in the option (any order), so "2024" doesn't match 2014
 * and "elec eng" finds "BE / BSc Electrical Engineering". Options starting with the
 * search rank first. The "Use …" row always stays.
 */
function wordFilter(value: string, search: string) {
  if (value.startsWith("__custom__")) return 0.01;
  const v = value.toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  if (!words.every((w) => v.includes(w))) return 0;
  return v.startsWith(words[0]!) || v.includes(` ${words[0]}`) ? 1 : 0.5;
}

const itemCls = cn(
  "flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm outline-none",
  "transition-[background-color,transform] duration-150",
  "data-[selected=true]:translate-x-0.5 data-[selected=true]:bg-muted"
);
