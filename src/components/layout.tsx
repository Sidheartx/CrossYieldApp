// src/components/layout.tsx
import React, { ReactNode } from 'react'
import { Text, Center, Container, useColorModeValue } from '@chakra-ui/react'
import Header from './header'

type Props = {
  children: ReactNode
}

export function Layout(props: Props) {
  return (
    <div>
      <Header />
      <Container maxW="container.md" py='8'>
        {props.children}
      </Container>
      <Center as="footer" bg={useColorModeValue('gray.100', 'gray.700')} p={6}>
          <Text fontSize="md">Submitted for ChainLink Constellation Hackathon 2023 by @0xCSMNT, @sidheartx</Text>
      </Center>
    </div>
  )
}
