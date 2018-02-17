<template>
  <div class="customers">
    <ul>
      <li :key="division.name" v-for="division in divisions">
        {{division.name}}
      </li>
    </ul>
    <input placeholder="name" v-model="newDivision.name" ref="nameInput" />

    <button @click="add()">Add</button>
    <div class="error"> {{ error }}</div>
  </div>
</template>

<script>
export default {
  props: ['divisions'],

  activated() {
    console.log('activated');
    this.oldTitle = document.title;
    document.title = 'Дивизионы';
  },

  // activated
  // deactivated

  deactivated() {
    document.title = this.oldTitle;
    console.log('deactivated');
  },

  methods: {
    add() {
      if (this.newDivision.name.length < 5) {
        this.error = 'Слишком короткое имя';
        setTimeout(() => this.$refs.nameInput.focus(), 3000);
        return;
      }

      this.error = '';
      this.divisions.push(this.newDivision);
      this.newDivision = {
        name: '',
      };
    },
  },

  data() {
    return {
      newDivision: {
        name: '',
      },
      error: '',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error {
  color: red;
}
</style>
