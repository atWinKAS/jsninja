<template>
  <div class="customers">
    <ul>
      <li :key="customer.name" v-for="customer in customers">
        {{customer.division}} / {{customer.name}}
      </li>
    </ul>
    <select v-model="newCustomer.division">
      <option value=''></option>
      <option v-for="division in divisions" :key="division.name" :value="division.name">
        {{ division.name }}
      </option>
    </select>

    <input placeholder="name" v-model="newCustomer.name" />
    <input placeholder="age" type="number" />
    <button @click="add()">Add</button>
    <Chart :data="customers.map(x => x.age)" />
  </div>
</template>

<script>
import Chart from './Chart.vue';

export default {
  props: {
    divisions: Array,
  },
  components: {
    Chart,
  },

  methods: {
    add() {
      this.customers.push(this.newCustomer);
      this.newCustomer = {
        division: '',
        name: '',
        date: '',
      };
    },
  },
  data() {
    return {
      newCustomer: {
        division: '',
        name: '',
      },
      customers: [
        { division: 'Alpha', name: 'Vasya', age: 10 },
        { division: 'Alpha', name: 'Vasya2', age: 13 },
        { division: 'Alpha', name: 'Vasya3', age: 5 },
        { division: 'Beta', name: 'Petya ', age: 21 },
      ],
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
