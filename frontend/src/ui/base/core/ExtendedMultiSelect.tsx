import {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  ReactNode,
  useEffect,
} from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxParsedItem,
  extractStyleProps,
  factory,
  Factory,
  getOptionsLockup,
  getParsedComboboxData,
  InputBase,
  isOptionsGroup,
  OptionsDropdown,
  Pill,
  PillsInput,
  StylesApiProps,
  type __BaseInputProps,
  type __CloseButtonProps,
  type __InputStylesNames,
  type BoxProps,
  type ComboboxLikeProps,
  type ComboboxLikeStylesNames,
  type ElementProps,
  type PillProps,
  useCombobox,
  useProps,
  useResolvedStylesApi,
  useStyles,
} from "@mantine/core";
import { useId, useUncontrolled } from "@mantine/hooks";

export type ExtendedMultiSelectStylesNames =
  | __InputStylesNames
  | ComboboxLikeStylesNames
  | "pill"
  | "pillsList"
  | "inputField";

export interface ExtendedMultiSelectProps
  extends BoxProps,
    __BaseInputProps,
    ComboboxLikeProps,
    StylesApiProps<ExtendedMultiSelectFactory>,
    ElementProps<"input", "size" | "value" | "defaultValue" | "onChange"> {
  /** Controlled component value */
  value?: string[];

  /** Default value for uncontrolled component */
  defaultValue?: string[];

  /** Called whe value changes */
  onChange?: (value: string[]) => void;

  /** Controlled search value */
  searchValue?: string;

  /** Default search value */
  defaultSearchValue?: string;

  /** Called when search changes */
  onSearchChange?: (value: string) => void;

  /** Maximum number of values, `Infinity` by default */
  maxValues?: number;

  /** Determines whether the select should be searchable, `false` by default */
  searchable?: boolean;

  /** Message displayed when no option matched current search query, only applicable when `searchable` prop is set */
  nothingFoundMessage?: ReactNode;

  /** Determines whether check icon should be displayed near the selected option label, `true` by default */
  withCheckIcon?: boolean;

  /** Position of the check icon relative to the option label, `"left"` by default */
  checkIconPosition?: "left" | "right";

  /** Determines whether picked options should be removed from the options list, `false` by default */
  hidePickedOptions?: boolean;

  /** Determines whether the clear button should be displayed in the right section when the component has value, `false` by default */
  clearable?: boolean;

  /** Props passed down to the clear button */
  clearButtonProps?: __CloseButtonProps & ElementProps<"button">;

  /** Props passed down to the hidden input */
  hiddenInputProps?: ComponentPropsWithoutRef<"input">;

  /** Divider used to separate values in the hidden input `value` attribute, `","` by default */
  hiddenInputValuesDivider?: string;

  renderValues?: (
    values: {
      value: string;
      item: ComboboxItem;
      defaultProps: Pick<
        PillProps,
        | "key"
        | "withRemoveButton"
        | "onRemove"
        | "unstyled"
        | "className"
        | "style"
      >;
    }[]
  ) => ReactNode;
}

export type ExtendedMultiSelectFactory = Factory<{
  props: ExtendedMultiSelectProps;
  ref: HTMLInputElement;
  stylesNames: ExtendedMultiSelectStylesNames;
}>;

const defaultProps: Partial<ExtendedMultiSelectProps> = {
  maxValues: Infinity,
  withCheckIcon: true,
  checkIconPosition: "left",
  hiddenInputValuesDivider: ",",
};

const ExtendedMultiSelect = factory<ExtendedMultiSelectFactory>(
  (_props, ref) => {
    const props = useProps("MultiSelect", defaultProps, _props);
    const {
      classNames,
      className,
      style,
      styles,
      unstyled,
      vars,
      size,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      variant,
      data,
      dropdownOpened,
      defaultDropdownOpened,
      onDropdownOpen,
      onDropdownClose,
      selectFirstOptionOnChange,
      onOptionSubmit,
      comboboxProps,
      filter,
      limit,
      withScrollArea,
      maxDropdownHeight,
      searchValue,
      defaultSearchValue,
      onSearchChange,
      readOnly,
      disabled,
      onFocus,
      onBlur,
      onPaste,
      radius,
      rightSection,
      rightSectionWidth,
      rightSectionPointerEvents,
      rightSectionProps,
      leftSection,
      leftSectionWidth,
      leftSectionPointerEvents,
      leftSectionProps,
      inputContainer,
      inputWrapperOrder,
      withAsterisk,
      labelProps,
      descriptionProps,
      errorProps,
      wrapperProps,
      description,
      label,
      error,
      maxValues,
      searchable,
      nothingFoundMessage,
      withCheckIcon,
      checkIconPosition,
      hidePickedOptions,
      withErrorStyles,
      name,
      form,
      id,
      clearable,
      clearButtonProps,
      hiddenInputProps,
      placeholder,
      hiddenInputValuesDivider,
      renderValues,
      ...others
    } = props;

    const _id = useId(id);
    const parsedData = getParsedComboboxData(data);
    const optionsLockup = getOptionsLockup(parsedData);

    const combobox = useCombobox({
      opened: dropdownOpened,
      defaultOpened: defaultDropdownOpened,
      onDropdownOpen,
      onDropdownClose: () => {
        onDropdownClose?.();
        combobox.resetSelectedOption();
      },
    });

    const {
      styleProps,
      rest: { type, ...rest },
    } = extractStyleProps(others);

    const [_value, setValue] = useUncontrolled({
      value,
      defaultValue,
      finalValue: [],
      onChange,
    });

    const [_searchValue, setSearchValue] = useUncontrolled({
      value: searchValue,
      defaultValue: defaultSearchValue,
      finalValue: "",
      onChange: onSearchChange,
    });

    const getStyles = useStyles<ExtendedMultiSelectFactory>({
      name: "MultiSelect",
      classes: {} as any,
      props,
      classNames,
      styles,
      unstyled,
    });

    const { resolvedClassNames, resolvedStyles } =
      useResolvedStylesApi<ExtendedMultiSelectFactory>({
        props,
        styles,
        classNames,
      });

    const handleInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (
        event.key === "Backspace" &&
        _searchValue.length === 0 &&
        _value.length > 0
      ) {
        setValue(_value.slice(0, _value.length - 1));
      }
    };

    const valuesProps = _value.map((item, index) => ({
      value: item,
      item: optionsLockup[item],
      defaultProps: {
        key: `${item}-${index}`,
        withRemoveButton: !readOnly,
        onRemove: () => setValue(_value.filter((i) => item !== i)),
        unstyled: unstyled,
        ...getStyles("pill"),
      },
    }));
    const values = renderValues
      ? renderValues(valuesProps)
      : valuesProps.map(({ value, item, defaultProps }) => (
          <Pill {...defaultProps} key={defaultProps.key}>
            {item?.label || value}
          </Pill>
        ));

    useEffect(() => {
      if (selectFirstOptionOnChange) {
        combobox.selectFirstOption();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectFirstOptionOnChange, _value]);

    const clearButton = clearable &&
      _value.length > 0 &&
      !disabled &&
      !readOnly && (
        <Combobox.ClearButton
          size={size as string}
          {...clearButtonProps}
          onClear={() => {
            setValue([]);
            setSearchValue("");
          }}
        />
      );

    const filteredData = filterPickedValues({
      data: parsedData,
      value: _value,
    });

    return (
      <>
        <Combobox
          store={combobox}
          classNames={resolvedClassNames}
          styles={resolvedStyles}
          unstyled={unstyled}
          size={size}
          readOnly={readOnly}
          __staticSelector="MultiSelect"
          onOptionSubmit={(val) => {
            onOptionSubmit?.(val);
            setSearchValue("");
            combobox.updateSelectedOptionIndex("selected");

            if (_value.includes(optionsLockup[val].value)) {
              setValue(_value.filter((v) => v !== optionsLockup[val].value));
            } else if (_value.length < maxValues!) {
              setValue([..._value, optionsLockup[val].value]);
            }
          }}
          {...comboboxProps}
        >
          <Combobox.DropdownTarget>
            <PillsInput
              {...styleProps}
              __staticSelector="MultiSelect"
              classNames={resolvedClassNames}
              styles={resolvedStyles}
              unstyled={unstyled}
              size={size}
              className={className}
              style={style}
              variant={variant}
              disabled={disabled}
              radius={radius}
              rightSection={
                rightSection ||
                clearButton || (
                  <Combobox.Chevron
                    size={size}
                    error={error}
                    unstyled={unstyled}
                  />
                )
              }
              rightSectionPointerEvents={
                rightSectionPointerEvents || clearButton ? "all" : "none"
              }
              rightSectionWidth={rightSectionWidth}
              rightSectionProps={rightSectionProps}
              leftSection={leftSection}
              leftSectionWidth={leftSectionWidth}
              leftSectionPointerEvents={leftSectionPointerEvents}
              leftSectionProps={leftSectionProps}
              inputContainer={inputContainer}
              inputWrapperOrder={inputWrapperOrder}
              withAsterisk={withAsterisk}
              labelProps={labelProps}
              descriptionProps={descriptionProps}
              errorProps={errorProps}
              wrapperProps={wrapperProps}
              description={description}
              label={label}
              error={error}
              multiline
              withErrorStyles={withErrorStyles}
              __stylesApiProps={{ ...props, multiline: true }}
              pointer={!searchable}
              onClick={() =>
                searchable ? combobox.openDropdown() : combobox.toggleDropdown()
              }
              data-expanded={combobox.dropdownOpened || undefined}
              id={_id}
            >
              <Pill.Group
                disabled={disabled}
                unstyled={unstyled}
                {...getStyles("pillsList")}
              >
                {values}
                <Combobox.EventsTarget>
                  <PillsInput.Field
                    {...rest}
                    ref={ref}
                    id={_id}
                    placeholder={placeholder}
                    type={!searchable && !placeholder ? "hidden" : "visible"}
                    {...getStyles("inputField")}
                    unstyled={unstyled}
                    onFocus={(event) => {
                      onFocus?.(event);
                      searchable && combobox.openDropdown();
                    }}
                    onBlur={(event) => {
                      onBlur?.(event);
                      combobox.closeDropdown();
                      searchable && combobox.closeDropdown();
                      setSearchValue("");
                    }}
                    onKeyDown={handleInputKeydown}
                    value={_searchValue}
                    onChange={(event) => {
                      setSearchValue(event.currentTarget.value);
                      searchable && combobox.openDropdown();
                      selectFirstOptionOnChange && combobox.selectFirstOption();
                    }}
                    disabled={disabled}
                    readOnly={readOnly || !searchable}
                    pointer={!searchable}
                  />
                </Combobox.EventsTarget>
              </Pill.Group>
            </PillsInput>
          </Combobox.DropdownTarget>

          <OptionsDropdown
            data={hidePickedOptions ? filteredData : parsedData}
            hidden={readOnly || disabled}
            filter={filter}
            search={_searchValue}
            limit={limit}
            hiddenWhenEmpty={
              !searchable ||
              !nothingFoundMessage ||
              (hidePickedOptions &&
                filteredData.length === 0 &&
                _searchValue.trim().length === 0)
            }
            withScrollArea={withScrollArea}
            maxDropdownHeight={maxDropdownHeight}
            filterOptions={searchable}
            value={_value}
            checkIconPosition={checkIconPosition}
            withCheckIcon={withCheckIcon}
            nothingFoundMessage={nothingFoundMessage}
            unstyled={unstyled}
            labelId={`${_id}-label`}
            scrollAreaProps={{ type: "auto" }}
          />
        </Combobox>
        <input
          type="hidden"
          name={name}
          value={_value.join(hiddenInputValuesDivider)}
          form={form}
          disabled={disabled}
          {...hiddenInputProps}
        />
      </>
    );
  }
);

ExtendedMultiSelect.classes = { ...InputBase.classes, ...Combobox.classes };
ExtendedMultiSelect.displayName = "ExtendedMultiSelect";

export default ExtendedMultiSelect;

// Redefined since its not exported by mantine
interface FilterPickedTagsInput {
  data: ComboboxParsedItem[];
  value: string[];
}

export function filterPickedValues({ data, value }: FilterPickedTagsInput) {
  const normalizedValue = value.map((item) => item.trim().toLowerCase());

  const filtered = data.reduce<ComboboxParsedItem[]>((acc, item) => {
    if (isOptionsGroup(item)) {
      acc.push({
        group: item.group,
        items: item.items.filter(
          (option) =>
            normalizedValue.indexOf(option.value.toLowerCase().trim()) === -1
        ),
      });
    } else if (
      normalizedValue.indexOf(item.value.toLowerCase().trim()) === -1
    ) {
      acc.push(item);
    }

    return acc;
  }, []);

  return filtered;
}
