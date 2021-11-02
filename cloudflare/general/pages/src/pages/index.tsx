import { Container, Flex, Heading, HStack } from "@chakra-ui/react";
import { IGetPostsResponse } from "api/posts";
import { IPost } from "api/types";
import { IResponse } from "api/utils";
import Post from "components/Post";
import WritePost from "components/Post/Write";
import SEO from "components/SEO";
import React, { FunctionComponent, useEffect, useState } from "react";
import { axiosClient } from "utils/axios";

const Index: FunctionComponent = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get<IResponse<IGetPostsResponse>>('/posts', {
          params: {
            t: new Date().getTime()
          }
        });
        if (res.data.errors) {
          throw res.data.errors;
        }
        if (res.data.data) {
          setPosts(res.data.data.posts);
        }
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const [updateID] = useState<string | undefined>(undefined);

  return (
    <>
      <SEO page="home" />
      <Container py="4rem" maxW="container.xl">
        {posts.length === 0 ? (
          <Flex justifyContent="center">
            <Heading as="h4" size="sm" color="dark_green">
              No Posts Found
            </Heading>
          </Flex>
        ) : (
          <HStack>
            {posts.map(post => (
              <Post {...post} />
            ))}
          </HStack>
        )}
      </Container>
      <WritePost updateID={updateID} />
    </>
  );
};

export default Index;
