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
      
    <div class="d-flex table-info-footer">
      <v-btn
        class="ml-2"
        @click="onLoadAllSessions">
        Load all sessions
      </v-btn>
    </div>
    
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { apiInfo, apiError } from '@/util/ErrorMessage.js'

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
    ...mapActions('data', ['loadExistingSessions']),
    onSelect ({ item, value }) {
      this.selected = value ? item : null
    },
    onRowClick (item, params) {
      params.select(!params.isSelected)
    },
    async onLoadAllSessions(){
      try {
        await this.loadExistingSessions({reroute: true, quantity:20})           
      } catch (error) {
        apiError(error)
        this.$router.push({ name: 'Step1' })
      }
    }
  }
}
</script>

<style lang="scss">
.select-session {
  height: calc(98vh - 64px);

  .sessions-table {
    .v-data-table__wrapper {
      overflow-y: auto;
      height: calc(94vh - 128px);
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
  .table-info-footer {
    margin-left: auto;
  }
}

</style>
