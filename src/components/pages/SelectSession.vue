<template>
  <div class="select-session d-flex flex-column">
    <div class="pa-2 d-flex">
      <v-btn
        @click="$router.push({ name: 'Step1' })">
        New session
      </v-btn>

      <v-btn
        class="ml-2"
        :disabled="!selected"
        @click="$router.push({ name: 'Session', params: { id: selected.id }})">
        Load session
      </v-btn>
      
      <v-btn
        class="ml-2"
        @click="$router.push({ name: 'Dashboard' })">
        Analysis Dashboard
      </v-btn>
    </div>

    <v-data-table        
      :headers="headers"
      :items="sessionsMapped"
      disable-pagination
      hide-default-footer
      single-select      
      class="sessions-table mx-2 mb-4 flex-grow-1"
      @item-selected="onSelect"
      @click:row="onRowClick"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SelectSession',
  data () {
    return {
      headers: [
        {
          text: 'ID',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Name', value: 'name' },
        { text: 'Number of trials', align: 'center', value: 'trials_count' },
        { text: 'Date', value: 'created_at' }
      ],
      selected: null
    }
  },
  computed: {
    ...mapState({
      sessions: state => state.data.sessions
    }),
    sessionsMapped () {
      return this.sessions.map(s => ({
        id: s.id,
        name: s.name,
        trials_count: String(s.trials.length),
        created_at: s.created_at
      }))
    }
  },
  methods: {
    onSelect ({ item, value }) {
      this.selected = value ? item : null
    },
    onRowClick (item, params) {
      params.select(!params.isSelected)
    }
  }
}
</script>

<style lang="scss">
.select-session {
  height: calc(100vh - 64px);

  .sessions-table {
    .v-data-table__wrapper {
      overflow-y: auto;
      height: calc(100vh - 128px);
      position: relative;

      table {
        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background-color: rgb(39, 39, 39);
        }
      }
    }    
  }
}

</style>
