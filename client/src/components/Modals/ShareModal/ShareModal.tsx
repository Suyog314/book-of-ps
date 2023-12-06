import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";

import "./ShareModal.scss";
import { useRecoilValue } from "recoil";
import { userSessionState } from "~/global/Atoms";

export interface IShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for moving a node to a new location
 */
export const ShareModal = (props: IShareModalProps) => {
  const { isOpen, onClose } = props;
  // state variables
  const userSession = useRecoilValue(userSessionState);

  // Reset our state variables and close the modal
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Collaborate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Add people by email" />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
