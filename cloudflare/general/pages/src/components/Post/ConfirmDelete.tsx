import { chakra, Button, ModalOverlay, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, useToast, ModalFooter, ModalCloseButton } from "@chakra-ui/react";
import { IDeletePostResponse } from "api/posts";
import { IResponse } from "api/utils";
import { AxiosError } from "axios";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { axiosClient, getAxiosError } from "utils/axios";
import { toastDuration } from "utils/misc";

interface ConfirmDeleteArgs {
  postID: string | undefined;
  deleteToggle: boolean;
  onDelete: () => void;
}

const ConfirmDelete: FunctionComponent<ConfirmDeleteArgs> = (args) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (args.postID) {
      onOpen();
    }
  }, [args.deleteToggle, args.postID, onOpen])

  const deletePost = useCallback(async () => {
    try {
      const res = await axiosClient.delete<IResponse<IDeletePostResponse>>(`/posts/${args.postID}`, {
        withCredentials: true
      });
      if (!res.data.data) {
        throw new Error('no data found');
      }
      console.log(`deleted post with id ${res.data.data.id}`);
      args.onDelete();
      onClose();
    } catch (err) {
      const errMessage = getAxiosError(err as AxiosError);
      toast({
        title: 'Error',
        description: errMessage,
        status: 'error',
        duration: toastDuration,
        isClosable: true
      });
    }
  }, [toast, args, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <chakra.p>Are you sure you want to delete this post? This action cannot be undone.</chakra.p>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="red" onClick={deletePost}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ConfirmDelete;
