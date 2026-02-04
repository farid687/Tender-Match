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
}) {
  return (
    <Dialog.Root placement={"center"} open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>Select preferred provinces</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
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
                Close
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
