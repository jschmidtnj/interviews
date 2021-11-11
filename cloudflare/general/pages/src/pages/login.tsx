import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, useColorModeValue, useToast } from "@chakra-ui/react";
import { ILoginArgs, ILoginResponse } from "api/users";
import { IResponse } from "api/utils";
import type { AxiosError } from "axios";
import SEO from "components/SEO";
import { Field, Form, Formik } from "formik";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { defaultLoggedInPage, getUsername, usernameKey } from "utils/auth";
import { axiosClient, getAxiosError } from "utils/axios";
import { toastDuration } from "utils/misc";
import { useLocalStorageValue } from '@react-hookz/web';
import * as yup from 'yup';

const Login: FunctionComponent = () => {
  const { formatMessage } = useIntl();
  const toast = useToast();
  const history = useHistory();
  const [redirect, setRedirect] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          history.replace(redirect !== null ? redirect : defaultLoggedInPage);
        }
      } catch (_err) {
        // not logged in
        removeUsername();
      }
    })();
  }, [history, redirect, removeUsername, setUsername]);

  return (
    <>
      <SEO page={formatMessage({ id: 'login.title' })} />
      <Container py="4rem" maxW="container.sm">
        <Heading as="h1" size="md" mb="2rem" color="dark_green">
          {formatMessage({ id: 'login.title' })}
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
            } as ILoginArgs}
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
                const res = await axiosClient.post<IResponse<ILoginResponse>>('/login', {
                  ...formData
                } as ILoginArgs, {
                  withCredentials: true
                });
                if (!res.data || !res.data.data) {
                  throw new Error('no data found');
                }
                console.log(`user ${formData.username} logged in`);
                setUsername(formData.username);
                setStatus({ success: true });
                setSubmitting(false);
                history.push(
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
    </>
  );
};

export default Login;
