import React, { FunctionComponent } from "react";
import { chakra, useColorModeValue, Box, Heading, Link, Grid, Button, Icon, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Markdown from "./markdown/Markdown";
import { BsPencil, BsTrash } from "react-icons/bs";
import { IPostRes } from "api/posts";

interface PostArgs {
  currentUser: string;
  onDelete: () => Promise<void>;
  onUpdate: () => Promise<void>;
};

const Post: FunctionComponent<IPostRes & PostArgs> = (args) => {
  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius={8}
      boxShadow="sm"
      w="full"
      bg={useColorModeValue('white', 'gray.700')}
    >
      {args.currentUser !== args.username ? null : (
        <Flex justifyContent="end">
          <Button bgColor="white" _hover={{
            color: 'teal.400'
          }} variant="ghost" bg="transparent" color="teal" zIndex={10} pos="absolute" mr="2.5rem" p="0" onClick={args.onUpdate}>
            <Icon width="1rem" height="1rem" as={BsPencil} />
          </Button>
          <Button bgColor="white" _hover={{
            color: 'teal.400'
          }} variant="ghost" bg="transparent" color="teal" zIndex={10} pos="absolute" p="0" onClick={args.onDelete}>
            <Icon width="1rem" height="1rem" as={BsTrash} />
          </Button>
        </Flex>
      )}
      <Grid>
        <Heading as="h3" size="md">
          {args.title}
        </Heading>
        <Box>
          <Link
            to="/"
            as={RouterLink}
            color="blue.600"
            _hover={{
              textDecoration: 'none',
            }}
          >
            @{args.username}
          </Link>
        </Box>
        <Box py={2} pr="15%">
          <chakra.hr />
        </Box>
        <Box>
          <Markdown content={args.content} />
        </Box>
      </Grid>
    </Box>
  )
};

export default Post;
