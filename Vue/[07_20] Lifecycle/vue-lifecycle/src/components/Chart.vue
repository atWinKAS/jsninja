<template>
  <div style="height: 300px;" ref="chart"></div>
</template>

<script>
export default {
  props: {
    data: Array,
  },

  mounted() {
    this.chart = c3.generate({
      bindto: this.$refs.chart,
      data: {
        columns: [['data1', ...this.data]],
      },
    });
  },

  // this is not working
  beforeUpdate() {
    this.chart.load({
      columns: [['data1', ...this.data]],
    });
  },
};
</script>