import { FieldChangeHandlerContext, UseFieldInternalProps } from '../useField';
import { InferError, Validator } from '../useValidation';
import { UseFieldValidationProps } from '../useField/useField.types';
import { WrapperVariant } from '../../models/common';
import {
  FieldSection,
  FieldSelectedSections,
  FieldValueType,
  MuiPickersAdapter,
} from '../../../models';
import { GetDefaultReferenceDateProps } from '../../utils/getDefaultReferenceDate';

export interface PickerValueManager<TValue, TDate, TError> {
  /**
   * Determines if two values are equal.
   * @template TDate, TValue
   * @param {MuiPickersAdapter<TDate>} utils The adapter.
   * @param {TValue} valueLeft The first value to compare.
   * @param {TValue} valueRight The second value to compare.
   * @returns {boolean} A boolean indicating if the two values are equal.
   */
  areValuesEqual: (
    utils: MuiPickersAdapter<TDate>,
    valueLeft: TValue,
    valueRight: TValue,
  ) => boolean;
  /**
   * Value to set when clicking the "Clear" button.
   */
  emptyValue: TValue;
  /**
   * Method returning the value to set when clicking the "Today" button
   * @template TDate, TValue
   * @param {MuiPickersAdapter<TDate>} utils The adapter.
   * @param {FieldValueType} valueType The type of the value being edited.
   * @returns {TValue} The value to set when clicking the "Today" button.
   */
  getTodayValue: (utils: MuiPickersAdapter<TDate>, valueType: FieldValueType) => TValue;
  /**
   * @template TDate, TValue
   * Method returning the reference value to use when mounting the component.
   * @param {object} params The params of the method.
   * @param {TDate | undefined} params.referenceDate The referenceDate provided by the user.
   * @param {TValue} params.value The value provided by the user.
   * @param {GetDefaultReferenceDateProps<TDate>} params.props The validation props needed to compute the reference value.
   * @param {MuiPickersAdapter<TDate>} params.utils The adapter.
   * @param {FieldValueType} params.valueType The type of the value being edited.
   * @param {granularity} params.granularity The granularity of the selection possible on this component.
   * @returns {TValue} The reference value to use for non-provided dates.
   */
  getInitialReferenceValue: (params: {
    referenceDate: TDate | undefined;
    value: TValue;
    props: GetDefaultReferenceDateProps<TDate>;
    utils: MuiPickersAdapter<TDate>;
    valueType: FieldValueType;
    granularity: number;
  }) => TValue;
  /**
   * Method parsing the input value to replace all invalid dates by `null`.
   * @template TDate, TValue
   * @param {MuiPickersAdapter<TDate>} utils The adapter.
   * @param {TValue} value The value to parse.
   * @returns {TValue} The value without invalid date.
   */
  cleanValue: (utils: MuiPickersAdapter<TDate>, value: TValue) => TValue;
  /**
   * Generates the new value, given the previous value and the new proposed value.
   * @template TDate, TValue
   * @param {MuiPickersAdapter<TDate>} utils The adapter.
   * @param {TValue} lastValidDateValue The last valid value.
   * @param {TValue} value The proposed value.
   * @returns {TValue} The new value.
   */
  valueReducer?: (
    utils: MuiPickersAdapter<TDate>,
    lastValidDateValue: TValue,
    value: TValue,
  ) => TValue;
  /**
   * Compare two errors to know if they are equal.
   * @template TError
   * @param {TError} error The new error
   * @param {TError | null} prevError The previous error
   * @returns {boolean} `true` if the new error is different from the previous one.
   */
  isSameError: (error: TError, prevError: TError | null) => boolean;
  /**
   * Checks if the current error is empty or not.
   * @template TError
   * @param {TError} error The current error.
   * @returns {boolean} `true` if the current error is not empty.
   */
  hasError: (error: TError) => boolean;
  /**
   * The value identifying no error, used to initialise the error state.
   */
  defaultErrorState: TError;
  /**
   * Return the timezone of the date inside a value.
   * Throw an error on range picker if both values don't have the same timezone.
   @template TValue, TDate
   @param {MuiPickersAdapter<TDate>} utils The utils to manipulate the date.
   @param {TValue} value The current value.
   @returns {string | null} The timezone of the current value.
   */
  getTimezone: (utils: MuiPickersAdapter<TDate>, value: TValue) => string | null;
}

export interface PickerChangeHandlerContext<TError> {
  validationError: TError;
}

export type PickerSelectionState = 'partial' | 'shallow' | 'finish';

export interface UsePickerValueState<TValue> {
  /**
   * Date displayed on the views and the field.
   * It is updated whenever the user modifies something.
   */
  draft: TValue;
  /**
   * Last value published (e.g: the last value for which `shouldPublishValue` returned `true`).
   * If `onChange` is defined, it's the value that was passed on the last call to this callback.
   */
  lastPublishedValue: TValue;
  /**
   * Last value committed (e.g: the last value for which `shouldCommitValue` returned `true`).
   * If `onAccept` is defined, it's the value that was passed on the last call to this callback.
   */
  lastCommittedValue: TValue;
  /**
   * Last value passed with `props.value`.
   * Used to update the `draft` value whenever the `value` prop changes.
   */
  lastControlledValue: TValue | undefined;
  /**
   * If we never modified the value since the mount of the component,
   * Then we might want to apply some custom logic.
   *
   * For example, when the component is not controlled and `defaultValue` is defined.
   * Then clicking on "Accept", "Today" or "Clear" should fire `onAccept` with `defaultValue`, but clicking on "Cancel" or dimissing the picker should not.
   */
  hasBeenModifiedSinceMount: boolean;
}

export interface PickerValueUpdaterParams<TValue, TError> {
  action: PickerValueUpdateAction<TValue, TError>;
  dateState: UsePickerValueState<TValue>;
  /**
   * Check if the new draft value has changed compared to some given value.
   * @template TValue
   * @param {TValue} comparisonValue The value to compare the new draft value with.
   * @returns {boolean} `true` if the new draft value is equal to the comparison value.
   */
  hasChanged: (comparisonValue: TValue) => boolean;
  isControlled: boolean;
  closeOnSelect: boolean;
}

export type PickerValueUpdateAction<TValue, TError> =
  | {
      name: 'setValueFromView';
      value: TValue;
      selectionState: PickerSelectionState;
    }
  | {
      name: 'setValueFromField';
      value: TValue;
      context: FieldChangeHandlerContext<TError>;
    }
  | {
      name: 'setValueFromAction';
      value: TValue;
      pickerAction: 'accept' | 'today' | 'cancel' | 'dismiss' | 'clear';
    };

/**
 * Props used to handle the value that are common to all pickers.
 */
export interface UsePickerValueBaseProps<TValue, TError> {
  /**
   * The selected value.
   * Used when the component is controlled.
   */
  value?: TValue;
  /**
   * The default value.
   * Used when the component is not controlled.
   */
  defaultValue?: TValue;
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. Will be either the same type as `value` or `null`. Can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. Will be either `string` or a `null`. Can be in `[start, end]` format in case of range value.
   * @param {TValue} value The new value.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onChange?: (value: TValue, context: PickerChangeHandlerContext<TError>) => void;
  /**
   * Callback fired when the value is accepted.
   * @template TValue The value type. Will be either the same type as `value` or `null`. Can be in `[start, end]` format in case of range value.
   * @param {TValue} value The value that was just accepted.
   */
  onAccept?: (value: TValue) => void;
  /**
   * Callback fired when the error associated to the current value changes.
   * If the error has a non-null value, then the `TextField` will be rendered in `error` state.
   *
   * @template TValue The value type. Will be either the same type as `value` or `null`. Can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. Will be either `string` or a `null`. Can be in `[start, end]` format in case of range value.
   * @param {TError} error The new error describing why the current value is not valid.
   * @param {TValue} value The value associated to the error.
   */
  onError?: (error: TError, value: TValue) => void;
}

/**
 * Props used to handle the value of non-static pickers.
 */
export interface UsePickerValueNonStaticProps<TValue, TSection extends FieldSection>
  extends Pick<
    UseFieldInternalProps<TValue, unknown, TSection, unknown>,
    'selectedSections' | 'onSelectedSectionsChange'
  > {
  /**
   * If `true`, the popover or modal will close after submitting the full date.
   * @default `true` for desktop, `false` for mobile (based on the chosen wrapper and `desktopModeMediaQuery` prop).
   */
  closeOnSelect?: boolean;
  /**
   * Control the popup or dialog open state.
   * @default false
   */
  open?: boolean;
  /**
   * Callback fired when the popup requests to be closed.
   * Use in controlled mode (see `open`).
   */
  onClose?: () => void;
  /**
   * Callback fired when the popup requests to be opened.
   * Use in controlled mode (see `open`).
   */
  onOpen?: () => void;
}

/**
 * Props used to handle the value of the pickers.
 */
export interface UsePickerValueProps<TValue, TSection extends FieldSection, TError>
  extends UsePickerValueBaseProps<TValue, TError>,
    UsePickerValueNonStaticProps<TValue, TSection> {}

export interface UsePickerValueParams<
  TValue,
  TDate,
  TSection extends FieldSection,
  TExternalProps extends UsePickerValueProps<TValue, TSection, any>,
> {
  props: TExternalProps;
  valueManager: PickerValueManager<TValue, TDate, InferError<TExternalProps>>;
  valueType: FieldValueType;
  wrapperVariant: WrapperVariant;
  validator: Validator<
    TValue,
    TDate,
    InferError<TExternalProps>,
    UseFieldValidationProps<TValue, TExternalProps>
  >;
}

export interface UsePickerValueActions {
  onAccept: () => void;
  onClear: () => void;
  onDismiss: () => void;
  onCancel: () => void;
  onSetToday: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export type UsePickerValueFieldResponse<TValue, TSection extends FieldSection, TError> = Required<
  Pick<
    UseFieldInternalProps<TValue, unknown, TSection, TError>,
    'value' | 'onChange' | 'selectedSections' | 'onSelectedSectionsChange'
  >
>;

/**
 * Props passed to `usePickerViews`.
 */
export interface UsePickerValueViewsResponse<TValue> {
  value: TValue;
  onChange: (value: TValue, selectionState?: PickerSelectionState) => void;
  open: boolean;
  onClose: () => void;
  onSelectedSectionsChange: (newValue: FieldSelectedSections) => void;
}

/**
 * Props passed to `usePickerLayoutProps`.
 */
export interface UsePickerValueLayoutResponse<TValue> extends UsePickerValueActions {
  value: TValue;
  onChange: (newValue: TValue) => void;
  isValid: (value: TValue) => boolean;
}

export interface UsePickerValueResponse<TValue, TSection extends FieldSection, TError> {
  open: boolean;
  actions: UsePickerValueActions;
  viewProps: UsePickerValueViewsResponse<TValue>;
  fieldProps: UsePickerValueFieldResponse<TValue, TSection, TError>;
  layoutProps: UsePickerValueLayoutResponse<TValue>;
}
