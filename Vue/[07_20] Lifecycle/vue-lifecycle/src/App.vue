<template>
  <div id="app">
    <button @click="activeTab = 'Customers'">Сотрудники</button>
    <button @click="activeTab = 'Divisions'">Подразделения</button>
    <button @click="activeTab = ''">Ничего</button>
    <hr/>

    <keep-alive>
      <component :is="activeTab" :divisions="divisions" />
    </keep-alive>
  </div>
</template>

<script>
import Customers from './components/Customers';
import Divisions from './components/Divisions';

export default {
  name: 'App',
  components: {
    Customers,
    Divisions,
  },
  data() {
    return {
      activeTab: 'Customers',
      divisions: [{ name: 'Alpha' }, { name: 'Beta' }],
    };
  },
};
</script>

<style>

</style>
