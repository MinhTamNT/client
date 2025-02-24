"use client";
import Logout from "@mui/icons-material/Logout";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect, MouseEvent } from "react";
import NewNotification from "../Notification/NewNotification";
import { setCookie } from "cookies-next";

export const SignInButton = () => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (session?.access_token) {
      setCookie("token", session.access_token);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn();
    }
  }, [session?.error]);

  if (session) {
    return (
      <div className="flex items-center right-4">
        <NewNotification />
        <Tooltip title="Account Settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              src={session.user?.image ?? ""}
              alt="avatar-user"
              sx={{ cursor: "pointer", marginRight: "10px" }}
            />
            <Typography>{session.user?.name}</Typography>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              width: "200px",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar src={session.user?.image ?? ""} alt="avatar-user" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Profile
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => signOut()}>
            <ListItemIcon>
              <Logout fontSize="medium" />
            </ListItemIcon>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </div>
    );
  }

  return (
    <div className="absolute right-4">
      <button
        onClick={() => signIn()}
        className="text-black bg-white shadow-sm py-1 px-2 border-2 rounded-md border-black"
      >
        Sign in
      </button>
    </div>
  );
};
