// import "@fontsource/montserrat";

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";

import "./ProfileModal.scss";
import { signOut } from "next-auth/react";

export interface IProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarSrc: string;
  userName: string | undefined;
  userEmail: string | undefined;
}

/**
 * Modal for moving a node to a new location
 */
export const ProfileModal = (props: IProfileModalProps) => {
  const { isOpen, onClose, avatarSrc, userName, userEmail } = props;
  // state variables

  // Reset our state variables and close the modal
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <div className="profile-wrapper">
              <div className="profile-header">
                <div className="profile-img">
                  <img src={avatarSrc} alt="profile-pic" />
                </div>
                <div className="profile-info">
                  <div className="profile-user-name">{userName}</div>
                  <div className="profile-email">{userEmail}</div>
                </div>
              </div>
              <div className="profile-body">
                <div className="sign-out">
                  <Button
                    style={{ fontWeight: "bold" }}
                    onClick={() => signOut()}
                  >
                    <span className="sign-out-button">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
