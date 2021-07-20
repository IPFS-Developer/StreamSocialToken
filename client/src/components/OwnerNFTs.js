import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import NFTOwner from './NFTOwner';

const GET_DOGS = gql`
  query subscriberEntities($owner: Bytes) {
    receiveAddresses(where: { owner: $owner }) {
      id
      receiveAddress
      owner
      timeStamp
      name
      donations {
        donation
        token
      }
      distributions {
        amountDistributed
        token
      }
    }
  }
`;

function OwnerNFTs(params) {
  let { id } = useParams();
  //   const { loading, error, data } = useQuery(GET_DOGS, {
  //     variables: { owner: id },
  //   });
  return (
    <Flex width="full" justifyContent="center">
      <SimpleGrid columns={3} spacing={10}>
        <NFTOwner />
        <NFTOwner />
        <NFTOwner />
      </SimpleGrid>
    </Flex>
  );
}

export default OwnerNFTs;
// Fire a query to find out if the owner has any NFTs
// If we don't find NFTs display blank
