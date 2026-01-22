'use client'

import { Tabs } from '@chakra-ui/react'
import * as React from 'react'

export const TabButton = React.forwardRef(function TabButton(props, ref) {
  const {
    tabs = [],
    defaultValue,
    value,
    onValueChange,
    variant = 'line',
    colorScheme = 'blue',
    size = 'md',
    orientation = 'horizontal',
    ...rest
  } = props

  // Get default value from first tab if not provided
  const defaultTabValue = defaultValue || tabs[0]?.value || tabs[0]?.id || ''

  // Handle controlled vs uncontrolled tabs
  const tabsProps = value !== undefined 
    ? { value, onValueChange } 
    : { defaultValue: defaultTabValue, onValueChange }

  return (
    <Tabs.Root
      ref={ref}
      key={variant}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      orientation={orientation}
      {...tabsProps}
      {...rest}
    >
      <Tabs.List>
        {tabs.map((tab, idx) => {
          const tabValue = tab.value || tab.id || `tab-${idx}`
          return (
            <Tabs.Trigger
              key={tabValue}
              value={tabValue}
              disabled={tab.disabled}
            >
              {tab.leftIcon}
              {tab.label}
              {tab.rightIcon}
            </Tabs.Trigger>
          )
        })}
      </Tabs.List>
      {tabs.map((tab, idx) => {
        const tabValue = tab.value || tab.id || `tab-${idx}`
        return (
          <Tabs.Content key={tabValue} value={tabValue}>
            {tab.content}
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
})
