"use client";

import { Input as ChakraInput, Box, Text } from "@chakra-ui/react";
import { forwardRef, useState, useMemo, useRef, useEffect } from "react";

export const YearPicker = forwardRef(function YearPicker(props, ref) {
  const {
    label,
    placeholder = "Select year",
    helperText,
    errorText,
    invalid,
    required,
    disabled,
    value,
    onChange,
    min = 1900,
    max,
    ...rest
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const maxYear = max || new Date().getFullYear() + 10;

  const years = useMemo(() => {
    const yearList = [];
    for (let year = maxYear; year >= min; year--) {
      yearList.push(year);
    }
    return yearList;
  }, [min, maxYear]);

  const selectedYear = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") {
      if (value.includes("-")) {
        return new Date(value).getFullYear();
      }
      const year = parseInt(value, 10);
      return isNaN(year) ? null : year;
    }
    return null;
  }, [value]);

  const displayValue = selectedYear ? selectedYear.toString() : "";

  const handleYearSelect = (year) => {
    setIsOpen(false);
    if (onChange) {
      onChange({
        target: { value: year.toString() },
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <Box position="relative" ref={containerRef}>
      {label && (
        <Text mb="1" fontWeight="medium" fontSize="sm">
          {label}
          {required && <Text as="span" color="red.500" ml="1">*</Text>}
        </Text>
      )}
      <Box position="relative">
        <ChakraInput
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          borderColor={invalid ? "red.500" : undefined}
          className="!bg-white"
          cursor="pointer"
          {...rest}
        />
        {isOpen && !disabled && (
          <Box
            position="absolute"
            top="100%"
            left="0"
            right="0"
            zIndex={1000}
            mt="1"
            bg="white"
            borderWidth="1px"
            borderColor="#e5e7eb"
            borderRadius="md"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            maxH="240px"
            overflowY="auto"
          >
            {years.map((year) => (
              <Box
                key={year}
                as="button"
                type="button"
                w="100%"
                px="3"
                py="2.5"
                textAlign="left"
                fontSize="sm"
                bg={selectedYear === year ? "rgba(31, 106, 225, 0.1)" : "transparent"}
                color={selectedYear === year ? "#1f6ae1" : "#1c1c1c"}
                fontWeight={selectedYear === year ? "600" : "400"}
                _hover={{ bg: "rgba(31, 106, 225, 0.08)" }}
                onClick={() => handleYearSelect(year)}
                borderBottomWidth="1px"
                borderBottomColor="#f3f4f6"
                cursor="pointer"
              >
                {year}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {helperText && !invalid && (
        <Text fontSize="xs" color="gray.500" mt="1">{helperText}</Text>
      )}
      {invalid && errorText && (
        <Text fontSize="xs" color="red.500" mt="1">{errorText}</Text>
      )}
    </Box>
  );
});
