<template>
  <div class="tooltip-container mt-2 mb-2">
    <span class="tooltip-icon" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">
      <i :class="iconClass"></i>
    </span>
    <div v-if="showTooltip" class="tooltip" v-html="tooltipText"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showTooltip: false,
    };
  },
  props: {
    tooltipText: {
      type: String,
      default: "This is a tooltip",
    },
    iconClass: {
      type: String,
      default: "fas fa-question-circle", // Default icon class if none is provided
    },
  },
};
</script>

<style>
.tooltip-container {
  position: relative;
  display: flex;
  justify-content: center; /* Horizontally centers the items */
  align-items: center; /* Vertically centers the items */
}
.tooltip {
  position: absolute;
  top: -130px; /* Adjust the distance from the icon as needed */
  right: 0;
  background-color: #555;
  color: #fff;
  padding: 5px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
}

.tooltip-icon {
  cursor: pointer;
}
</style>