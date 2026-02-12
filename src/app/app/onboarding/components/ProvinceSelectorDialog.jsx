"use client";

import {
  Dialog,
  Button,
  Box,
  Flex,
  Text,
} from "@chakra-ui/react";
import NLProvinceMap from "./NLProvinceMap";


export default function ProvinceSelectorDialog({
  open,
  onOpenChange,
  preferredRegions,
  onChange,
  placement = "center"
}) {
  return (
    <Dialog.Root
      placement={placement}
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      closeOnInteractOutside={false}
    >
     
      <Dialog.Backdrop bg="blackAlpha.200" />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>Select preferred provinces</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Text fontSize="sm" color="gray.600" mb="2">
              Click provinces on the map to select or deselect. Selected regions are highlighted in blue.
            </Text>
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={3}
            >
              <NLProvinceMap
                preferredRegions={preferredRegions}
                onChange={onChange}
              />
            </Box>
          </Dialog.Body>

          <Dialog.Footer>
            <Flex justify="flex-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Apply &amp; Close
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
