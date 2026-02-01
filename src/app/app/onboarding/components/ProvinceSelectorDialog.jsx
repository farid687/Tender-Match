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
  onConfirm,
}) {
  const handleConfirm = () => {
    onConfirm?.(preferredRegions);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
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
            <Flex justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
