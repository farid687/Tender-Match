"use client";

import { Input as ChakraInput, Box, Text, IconButton, InputGroup } from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { withMask } from "use-mask-input";

export const InputField = forwardRef(function InputField(props, ref) {
  const {
    label,
    placeholder,
    helperText,
    errorText,
    invalid,
    required,
    disabled,
    type = "text",
    mask,
    ...rest
  } = props;

  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  const inputRef = mask ? withMask(mask) : ref;

  return (
    <Box>
      {label && (
        <Text mb="1" fontWeight="medium" fontSize="sm">
          {label}
          {required && <Text as="span" color="red.500" ml="1">*</Text>}
        </Text>
      )}
      {isPassword ? (
        <InputGroup w="full" endElement={
          <IconButton
            variant="ghost"
            size="xs"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {visible ? <LuEyeOff /> : <LuEye />}
          </IconButton>
        }>
          <ChakraInput
            ref={inputRef}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            borderColor={invalid ? "red.500" : undefined}
            bg="white"
            {...rest}
          />
        </InputGroup>
      ) : (
        <ChakraInput
          ref={inputRef}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          borderColor={invalid ? "red.500" : undefined}
          bg="white"
          {...rest}
        />
      )}
      {helperText && !invalid && (
        <Text fontSize="xs" color="gray.500" mt="1">{helperText}</Text>
      )}
      {invalid && errorText && (
        <Text fontSize="xs" color="red.500" mt="1">{errorText}</Text>
      )}
    </Box>
  );
});
