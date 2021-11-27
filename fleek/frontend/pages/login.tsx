import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, useColorModeValue, useToast } from "@chakra-ui/react";
import type { AxiosError } from "axios";
import SEO from "components/SEO";
import { Field, Form, Formik } from "formik";
import React, { FunctionComponent, useEffect, useState } from "react";
import { defaultLoggedInPage, getUsername, usernameKey } from "utils/auth";
import { axiosClient, getAuthAPIURL, getAxiosError } from "utils/axios";
import { toastDuration } from "utils/misc";
import { useRouter } from 'next/router'
import { useLocalStorageValue } from '@react-hookz/web';
import * as yup from 'yup';
import Layout from "layouts/main";

const Login: FunctionComponent = () => {
  const toast = useToast();
  const router = useRouter();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [_username, setUsername, removeUsername] = useLocalStorageValue<string>(usernameKey);

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('redirect')) {
        setRedirect(decodeURIComponent(urlParams.get('redirect') as string));
      }
      try {
        const usernameRes = await getUsername();
        setUsername(usernameRes);
        if (usernameRes !== '') {
          router.replace(redirect !== null ? redirect : defaultLoggedInPage);
        }
      } catch (_err) {
        // not logged in
        removeUsername();
      }
    })();
  }, [router, redirect, removeUsername, setUsername]);

  return (
    <Layout>
      <SEO page="login" />
      <Container py="4rem" maxW="container.sm">
        <Heading as="h1" size="md" mb="2rem" color="dark_green">
          Login
        </Heading>
        <Box
          p={8}
          borderWidth={1}
          borderRadius={8}
          boxShadow="sm"
          w="full"
          bg={useColorModeValue('white', 'gray.700')}
        >
          <Formik
            initialValues={{
              username: '',
            }}
            validationSchema={yup.object({
              username: yup.string().required('required'),
            })}
            onSubmit={async (formData, {
              setSubmitting, setStatus
            }) => {
              const onError = () => {
                setStatus({ success: false });
                setSubmitting(false);
              };
              try {
                const res = await axiosClient.get<string>(`/auth/${formData.username}`, {
                  withCredentials: true,
                  baseURL: getAuthAPIURL(),
                  responseType: 'text'
                });
                if (!res.data) {
                  throw new Error('no data found');
                }
                console.log(`user ${formData.username} logged in`);
                setUsername(formData.username);
                setStatus({ success: true });
                setSubmitting(false);
                router.push(
                  redirect !== null ? redirect : defaultLoggedInPage
                );
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
                <Field name="username">
                  {({ field }: any) => (
                    <FormControl isInvalid={!!formProps.errors.username && formProps.touched.username} isRequired>
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input {...field} id="username" placeholder="username" />
                      <FormErrorMessage>{formProps.errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button mt="2rem" colorScheme="blue" onClick={() => formProps.handleSubmit()}>
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
    </Layout>
  );
};

export default Login;
