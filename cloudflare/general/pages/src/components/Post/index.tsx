import React, { FunctionComponent } from "react";
import { useColorModeValue, Box, Flex, Heading, Link } from '@chakra-ui/react';
import { IPost } from "api/types";
import { Link as RouterLink } from 'react-router-dom';
import Markdown from "./markdown/Markdown";

const Post: FunctionComponent<IPost> = (post) => {
  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius={8}
      boxShadow="sm"
      w="full"
      bg={useColorModeValue('white', 'gray.700')}
    >
      <Flex mb={4} align="center" justifyContent="start">
        <Heading as="h3" size="md">
          {post.title}
        </Heading>
        <Link
          to="/"
          as={RouterLink}
          px={2}
          py={1}
          color="blue.600"
          _hover={{
            textDecoration: 'none',
          }}
        >
          @{post.username}
        </Link>
        {/* {post.media.map(media => ))} */}
        <Markdown content={post.content} />
      </Flex>
    </Box>
  )
};

export default Post;
