import { Bell, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function NotificationCenter() {
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Attendance Recorded",
      message: "CS 101 attendance successfully recorded",
      time: "2 min ago",
      icon: CheckCircle2,
      color: "text-education-green"
    },
    {
      id: 2,
      type: "warning",
      title: "Low Attendance Alert",
      message: "Math 201 has only 45% attendance today",
      time: "15 min ago",
      icon: AlertTriangle,
      color: "text-accent"
    },
    {
      id: 3,
      type: "info",
      title: "Upcoming Session",
      message: "Biology Lab starts in 30 minutes",
      time: "30 min ago",
      icon: Clock,
      color: "text-primary"
    }
  ]

  const unreadCount = notifications.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border-border/50 bg-card/95 backdrop-blur-sm">
        <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-4">
              <Icon className={`h-4 w-4 mt-0.5 ${notification.color}`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}