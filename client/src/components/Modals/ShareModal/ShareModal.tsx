import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IoPersonRemoveOutline } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";
import "./ShareModal.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentNodeCollabsState,
  currentNodeState,
  refreshState,
  userSessionState,
} from "~/global/Atoms";
import { INodeProperty, makeINodeProperty } from "~/types";
import { FrontendNodeGateway } from "~/nodes";
import { FrontendUserGateway } from "~/users";
import { Button } from "~/components/Button";

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
  const currentNode = useRecoilValue(currentNodeState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const [userToAdd, setUserToAdd] = useState("");
  const [error, setError] = useState("");
  const [currentNodeCollabs, setCurrentNodeCollabs] = useRecoilState(
    currentNodeCollabsState
  );

  useEffect(() => {
    setCurrentNodeCollabs(
      currentNode.collaborators ? currentNode.collaborators : []
    );
  }, [currentNode]);

  // updates the collaborators
  const handleUpdateShare = async (newCollabs: string[]) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      "collaborators",
      newCollabs
    );
    const updateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      [nodeProperty]
    );
    if (!updateResp.success) {
      console.error(updateResp.message);
      return;
    }
    setRefresh(!refresh);
  };

  // Reset our state variables and close the modal
  const handleClose = async () => {
    onClose();
    await handleUpdateShare(currentNodeCollabs);
    setUserToAdd("");
    setError("");
  };

  // event handler for the user query
  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserToAdd(event.target.value);
    setError("");
  };

  // Function to handle Enter key press
  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      await handleAddUser();
    }
  };

  const handleAddUser = async () => {
    const userDbCheckResp = await FrontendUserGateway.findUserByEmail(
      userToAdd
    );
    if (!userDbCheckResp.success) {
      setError("User does not exist.");
      return;
    }
    if (userDbCheckResp.payload.email == userSession?.email) {
      setError("개새끼 don't add yourself.");
      return;
    }
    const newCollabUpdate = [userToAdd, ...currentNodeCollabs];
    setCurrentNodeCollabs(newCollabUpdate);
    setUserToAdd("");
    setError("");
  };

  // Remove item from newCollabs
  const handleRemoveUser = (userId: string) => {
    const newCollabUpdate: string[] = [];
    currentNodeCollabs.forEach((user) => {
      if (user == userId) {
        return;
      }
      newCollabUpdate.push(user);
    });
    setCurrentNodeCollabs(newCollabUpdate);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Collaborators</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="share-add-wrapper">
              <div className="share-add-input">
                <Input
                  placeholder="Add people by email"
                  onChange={handleAddChange}
                  value={userToAdd}
                  onKeyDown={handleKeyPress}
                />
                <Button
                  onClick={handleAddUser}
                  style={{ height: "40px", marginLeft: "10px" }}
                  icon={<IoPersonAddOutline />}
                />
              </div>
            </div>
            <div className="share-list-item-container">
              <ul className="share-list-people">
                {currentNodeCollabs &&
                  currentNodeCollabs.map((userEmail) => (
                    <div key={userEmail} className="share-list-item-wrapper">
                      <li className="share-list-item">
                        <div className="share-title">{userEmail}</div>
                      </li>
                      <Button
                        style={{ marginLeft: "10px", height: "44px" }}
                        icon={<IoPersonRemoveOutline />}
                        onClick={() => handleRemoveUser(userEmail)}
                      />
                    </div>
                  ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            {error && <div className="share-error">{error}</div>}
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
