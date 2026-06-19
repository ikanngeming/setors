import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";

export default function NotificationButton() {
  const { data: notifications, refetch } = trpc.notifications.list.useQuery(
    undefined,
    {
      // Polling tiap 30 detik via refetchInterval — lebih aman dari setInterval manual
      // karena otomatis berhenti kalau query unmount atau tab tidak aktif
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
      retry: false,
    }
  );
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
      retry: false,
    }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifikasi</h3>
          <p className="text-xs text-muted-foreground">
            {unreadCount ?? 0} notifikasi belum dibaca
          </p>
        </div>

        {notifications && notifications.length > 0 ? (
          <>
            <div className="max-h-96 overflow-y-auto">
              {notifications
                .slice()
                .reverse()
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="text-center justify-center py-2"
            >
              <span className="text-xs text-muted-foreground">
                Total {notifications.length} notifikasi
              </span>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Bell size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
