import { cn } from "../../lib/utils" // Use relative path

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)} // Use animate-pulse for loading effect and muted background
      {...props}
    />
  )
}

export { Skeleton }
