import { Container, Flex, Heading, VStack, useToast } from "@chakra-ui/react";
import { IGetPostsResponse, IPostRes } from "api/posts";
import { IResponse } from "api/utils";
import type { AxiosError } from "axios";
import Post from "components/Post";
import ConfirmDelete from "components/Post/ConfirmDelete";
import WritePost from "components/Post/Write";
import SEO from "components/SEO";
import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { axiosClient, getAxiosError } from "utils/axios";
import { toastDuration, waitReactUpdate } from "utils/misc";

const Index: FunctionComponent = () => {
  const toast = useToast();
  const [posts, setPosts] = useState<IPostRes[]>([]);

  const updatePosts = useCallback(async () => {
    try {
      const res = await axiosClient.get<IResponse<IGetPostsResponse>>('/posts', {
        params: {
          ts: new Date().getTime()
        }
      });
      if (!res.data.data) {
        throw new Error('no data found');
      }
      setPosts(res.data.data.posts);
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
  }, [toast]);

  useEffect(() => {
    (async () => await updatePosts())();
  }, [updatePosts]);

  const [updateID, setUpdateID] = useState<string | undefined>(undefined);
  const [updateToggle, _setUpdateToggle] = useState<boolean>(false);
  const toggleUpdate = useCallback(() => _setUpdateToggle(!updateToggle), [updateToggle]);

  const [deleteID, setDeleteID] = useState<string | undefined>(undefined);
  const [deleteToggle, _setDeleteToggle] = useState<boolean>(false);
  const toggleDelete = useCallback(() => _setDeleteToggle(!deleteToggle), [deleteToggle]);

  return (
    <>
      <SEO page="home" />
      <Container py="4rem" maxW="container.md">
        {posts.length === 0 ? (
          <Flex justifyContent="center">
            <Heading as="h4" size="sm" color="dark_green">
              No Posts Found
            </Heading>
          </Flex>
        ) : (
          <VStack spacing="4rem">
            {posts.map((post, i) => (
              <Post key={`post-${i}`} {...post} onUpdate={async () => {
                setUpdateID(post.id);
                await waitReactUpdate();
                toggleUpdate();
              }} onDelete={async () => {
                setDeleteID(post.id);
                await waitReactUpdate();
                toggleDelete();
              }} />
            ))}
          </VStack>
        )}
      </Container>
      <WritePost updateToggle={updateToggle} updateID={updateID} onClose={(post) => {
        const originalPost = posts.find((curr) => curr.id === post.id);
        const newPost = originalPost ? {
          ...originalPost,
          ...post
        } : post;
        const otherPosts = posts.filter((curr) => curr.id !== post.id);
        setPosts([newPost, ...otherPosts]);
        setUpdateID(undefined);
      }} />
      <ConfirmDelete postID={deleteID} deleteToggle={deleteToggle} onDelete={() => {
        setPosts(posts.filter((curr) => curr.id !== deleteID));
        setDeleteID(undefined);
      }} />
    </>
  );
};

export default Index;
