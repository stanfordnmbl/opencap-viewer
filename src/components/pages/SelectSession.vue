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
      :item-class="itemClasses"
      disable-pagination
      hide-default-footer
      single-select      
      class="sessions-table mx-2 mb-4 flex-grow-1"
      @item-selected="onSelect"
      @click:row="onRowClick">
      <template v-slot:item.id="{ item }">
        <div class="float-right">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  icon
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item link v-if="!item.trashed">
                <v-dialog v-model="remove_dialog" max-width="500">
                  <template v-slot:activator="{ on }">
                    <v-list-item-title v-on="on">Remove...</v-list-item-title>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col cols="2">
                          <v-icon x-large color="red">mdi-close-circle</v-icon>
                        </v-col>
                        <v-col cols="10">
                          <p>
                            Do you want to remove the session <code>{{item.id}}</code>?
                            You will be able to recover it for 30 days. After that,
                            this session will be removed forever.
                          </p>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="remove_dialog = false"
                      >
                        No
                      </v-btn>
                      <v-btn
                        color="red darken-1"
                        text
                        @click="remove_dialog = false"
                      >
                        Yes
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-list-item>
              <v-list-item link v-else>
                <v-list-item-title>Restore...</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title
                    @click="$router.push({ name: 'Session', params: { id: item.id }})"
                    >Load...</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title
                  @click="$router.push({ name: 'Dashboard' })"
                  >Dashboard...</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        {{ item.id }}
      </template>
    </v-data-table>
      
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
  created: function () {
    apiInfo("To take advantage of new features, make sure you have updated the iOS application to version 1.6 (19).")
  },
  data () {
    return {
      remove_dialog: false,
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
        created_at: s.created_at,
        trashed: s.trashed,
        trashed_at: s.trashed_at
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
    itemClasses (item) {
      return item.trashed ? 'trashed' : '';
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

.trashed {
  color: gray;
}
</style>
