<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :is-focused="isFocused"
    :applied-options="appliedOptions"
  >
    <input
      :id="control.id + '-input'"
      :class="styles.control.input"
      :value="control.data"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      @change="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </control-wrapper>
</template>

<script setup lang="ts">
import {
  ControlElement,
  rankWith,
  isStringControl,
} from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsControl,
} from '../../config/jsonforms';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVanillaControl } from '../util';

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsControl(props), (target) => target.value || undefined );
const {control, controlWrapper, styles, isFocused, appliedOptions, onChange} = input;

defineOptions({
  tester: rankWith(2, isStringControl)
})
</script>
