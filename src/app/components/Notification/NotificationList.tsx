import {
  DELETED_NOTIFY,
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
  NOTIFICATION_CREATED_SUBSCRIPTION,
  UPDATE_INVITATION_STATUS,
} from "@/app/utils/notification";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import LoadingSpinner from "../Loading/Loading";
import { Notification, NotificationCreatedData } from "@/app/lib/interface";

const NotificationList: React.FC = () => {
  const { data, refetch } = useQuery<{ notifications: Notification[] }>(
    GET_NOTIFICATIONS
  );
  const [markNotificationAsRead] = useMutation<{
    markNotificationAsRead: Notification;
  }>(MARK_NOTIFICATION_AS_READ);
  const [updateInvitationStatus] = useMutation<{ updateInvitationStatus: any }>(
    UPDATE_INVITATION_STATUS
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [DeletedNotification] = useMutation(DELETED_NOTIFY);

  const { data: subscriptionData } = useSubscription<NotificationCreatedData>(
    NOTIFICATION_CREATED_SUBSCRIPTION,
    {
      onSubscriptionData: ({ subscriptionData }) => {
        if (subscriptionData && subscriptionData.data) {
          const newNotification = subscriptionData.data.notificationCreated;
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            newNotification,
          ]);
        }
      },
    }
  );

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications);
    }
  }, [data]);

  const handleAccept = async (notificationId: string, projectId: string) => {
    try {
      await updateInvitationStatus({
        variables: { projectId, status: "ACCEPTED" },
      });
      await markNotificationAsRead({ variables: { id: notificationId } });
    } catch (error) {
      console.error("Failed to accept invitation", error);
    }
  };

  const handleDecline = async (notificationId: string, projectId: string) => {
    try {
      await updateInvitationStatus({
        variables: { projectId, status: "DECLINED" },
      });
      await markNotificationAsRead({ variables: { id: notificationId } });
    } catch (error) {
      console.error("Failed to decline invitation", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await DeletedNotification({
        variables: {
          deletedNotificationId: notificationId,
        },
      });
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  if (!notifications) return <LoadingSpinner />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="flex justify-center flex-col">
          <img
            src="https://cdn.dribbble.com/userupload/10189587/file/original-e73c198b01742a9a4256e1ba496a2118.jpg?resize=1024x768"
            className="h-96 object-cover"
          />
          <p className="text-center text-red-300 uppercase transition-transform duration-300 hover:scale-105 hover:text-red-500">
            No notifications available
          </p>
        </div>
      ) : (
        <TransitionGroup className="notification-list">
          {notifications.map((notification) => (
            <CSSTransition
              key={notification.id}
              timeout={300}
              classNames="slide"
            >
              <div
                className={`p-4 mb-3 rounded-lg border ${
                  notification.read
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-300"
                } transition duration-300 ease-in-out hover:bg-blue-100 cursor-pointer relative flex items-start`}
              >
                <div className="w-6 h-6 mr-3 flex-shrink-0">
                  {notification.read ? (
                    <InformationCircleIcon className="text-gray-500 w-full h-full" />
                  ) : (
                    <CheckCircleIcon className="text-blue-500 w-full h-full" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-700">
                    {notification.message}
                  </p>
                  {notification.message.includes(
                    "You have been invited to join the project"
                  ) &&
                    !notification?.read && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          onClick={() =>
                            handleAccept(
                              notification.id,
                              notification.projectId
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          onClick={() =>
                            handleDecline(
                              notification.id,
                              notification.projectId
                            )
                          }
                        >
                          Decline
                        </button>
                      </div>
                    )}
                </div>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => handleDelete(notification.id)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {!notification.read && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
    </div>
  );
};

export default NotificationList;
