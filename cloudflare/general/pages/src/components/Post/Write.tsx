import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { chakra, Icon, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, IconButton } from "@chakra-ui/react";
import Editor from "./markdown/Editor";
import { Formik, Form, Field } from 'formik';
import type { FormikHandlers, FormikHelpers, FormikState } from 'formik';
import * as yup from 'yup';
import { IAddPostArgs, IAddPostResponse, IPostRes, IUpdatePostArgs, IUpdatePostResponse } from "api/posts";
import { MediaType } from 'api/types';
import { FaPlus } from 'react-icons/fa';
import { axiosClient, getAxiosError } from "utils/axios";
import type { AxiosError } from "axios";
import { IResponse } from "api/utils";
import { toastDuration } from "utils/misc";

interface WritePostArgs {
  updateToggle: boolean;
  updateID?: string;
  onClose: (post: IPostRes) => void;
}

const oneOfEnum = <T extends object>(enumObject: T) =>
  yup.mixed<T>().oneOf(Object.values(enumObject));

const WritePost: FunctionComponent<WritePostArgs> = (args) => {
  const formRef = useRef<
    FormikHelpers<IAddPostArgs> &
      FormikState<IAddPostArgs> &
      FormikHandlers
  >();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [currentPost, setCurrentPost] = useState<IPostRes | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (args.updateID !== undefined) {
        onOpen();
      }
      if (args.updateID !== undefined && formRef.current !== undefined) {
        try {
          const res = await axiosClient.get<IResponse<IPostRes>>(`/posts/${args.updateID}`);
          if (!res.data || !res.data.data) {
            throw new Error('no post found');
          }
          setCurrentPost(res.data.data);
          formRef.current.setValues({
            ...res.data.data
          });
        } catch (err) {
          toast({
            title: 'Error',
            description: getAxiosError(err as AxiosError),
            status: 'error',
            duration: toastDuration,
            isClosable: true,
          });
        }
      }
    })();
  }, [args.updateToggle, args.updateID, onOpen, toast]);

  return (
    <>
      <Flex justifyContent="center" width="100%" pos="fixed" bottom="10%">
        <IconButton boxShadow="2xl" bgColor="light_teal" _hover={{
          bg: 'teal'
        }} w="5rem" height="5rem" borderRadius="50%" fontSize="3rem" aria-label="new post" icon={<FaPlus />} color="white" onClick={onOpen} />
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{args.updateID === undefined ? 'New' : 'Edit'} Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              innerRef={(formRef as unknown) as (instance: any) => void}
              initialValues={{
                title: '',
                media: [],
                content: ''
              } as IAddPostArgs}
              validationSchema={yup.object({
                title: yup.string().required('required'),
                content: yup.string().required('required'),
                media: yup.array().of(yup.object().shape({
                  type: oneOfEnum(MediaType),
                  src: yup.string().url(),
                })).required('required'),
              })}
              onSubmit={async (formData, {
                setSubmitting, setStatus
              }) => {
                const onError = () => {
                  setStatus({ success: false });
                  setSubmitting(false);
                };
                try {
                  if (args.updateID === undefined || currentPost === undefined) {
                    const res = await axiosClient.post<IResponse<IAddPostResponse>>('/posts', {
                      ...formData
                    } as IAddPostArgs);
                    if (!res.data || !res.data.data) {
                      throw new Error('no data found');
                    }
                    console.log(`added post with id ${res.data.data.id}`);
                    args.onClose({
                      ...formData,
                      username: 'TODO - get username',
                      downvotes: [],
                      upvotes: [],
                      id: res.data.data.id,
                      reactions: [],
                    });
                  } else {
                    const res = await axiosClient.put<IResponse<IUpdatePostResponse>>(`/posts/${args.updateID}`, {
                      ...formData
                    } as IUpdatePostArgs);
                    if (!res.data || !res.data.data) {
                      throw new Error('no data found');
                    }
                    console.log(`updated post with id ${res.data.data.id}`);
                    args.onClose({
                      ...currentPost,
                      ...formData
                    });
                  }
                  setStatus({ success: true });
                  setSubmitting(false);
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
                  onError();
                }
              }}
            >
              {(formProps) => (
                <Form>
                  <Field name="title">
                    {({ field }: any) => (
                      <FormControl isInvalid={!!formProps.errors.title && formProps.touched.title} isRequired>
                        <FormLabel htmlFor="title">Title</FormLabel>
                        <Input {...field} id="title" placeholder="title" />
                        <FormErrorMessage>{formProps.errors.title}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="content">
                    {() => (
                      <FormControl mt={2} isInvalid={!!formProps.errors.content && formProps.touched.content} isRequired>
                        <Editor
                          value={formProps.values.content}
                          onChange={(newVal) =>
                            formProps.setFieldValue('content', newVal)
                          }
                          onSubmit={formProps.handleSubmit}
                        />
                        <FormErrorMessage>{formProps.errors.content}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Form>
              )}
            </Formik>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="blue" onClick={() => formRef.current?.handleSubmit()}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default WritePost;
