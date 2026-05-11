import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      data-slot="pagination"
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center justify-center gap-0.5 sm:gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  isActive?: boolean
}

function PaginationLink({
  className,
  isActive = false,
  size = "sm",
  type = "button",
  ...props
}: PaginationLinkProps) {
  const isIconSize =
    size === "icon" || size === "icon-xs" || size === "icon-sm" || size === "icon-lg"

  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      className={cn(
        !isIconSize && "min-w-8 tabular-nums",
        isActive && "border-primary/40 bg-primary/5 font-semibold",
        className,
      )}
      data-active={isActive ? "true" : undefined}
      data-slot="pagination-link"
      type={type}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      {...props}
    />
  )
}

type PaginationNavControlProps = Omit<
  React.ComponentProps<typeof PaginationLink>,
  "children" | "isActive" | "size"
>

function PaginationPrevious({ className, ...props }: PaginationNavControlProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn(className)}
      size="icon-sm"
      {...props}
    >
      <ChevronLeft aria-hidden className="size-4" />
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: PaginationNavControlProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn(className)}
      size="icon-sm"
      {...props}
    >
      <ChevronRight aria-hidden className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
