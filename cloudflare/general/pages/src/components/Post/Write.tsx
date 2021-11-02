import React, { FunctionComponent, useRef } from "react";
import { Icon, Button, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import Editor from "./markdown/Editor";
import { Formik, Form, Field } from 'formik';
import type { FormikHandlers, FormikHelpers, FormikState } from 'formik';
import * as yup from 'yup';
import { IAddPostArgs, IAddPostResponse } from "api/posts";
import { MediaType } from 'api/types';
import { AiOutlinePlus } from 'react-icons/ai';
import { axiosClient } from "utils/axios";

interface WritePostArgs {
  updateID?: string;
}

const oneOfEnum = <T extends object>(enumObject: T) =>
  yup.mixed<T>().oneOf(Object.values(enumObject));

const WritePost: FunctionComponent<WritePostArgs> = (args) => {
  const formRef = useRef<
    FormikHelpers<IAddPostArgs> &
      FormikState<IAddPostArgs> &
      FormikHandlers
  >();

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button bgColor="light_teal" _hover={{
        bg: 'teal'
      }} color="white" width="4rem" height="4rem" pos="fixed" bottom="10%" right="25%" onClick={onOpen}>
        <Icon width="2rem" height="2rem" as={AiOutlinePlus} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{args.updateID ? 'New' : 'Edit'} Post</ModalHeader>
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
              onSubmit={async (formData) => {
                const res = await axiosClient.put<IAddPostArgs, IAddPostResponse>('/posts', {
                  ...formData
                });
                console.log(res)
                console.log('submit')
                onClose();
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
