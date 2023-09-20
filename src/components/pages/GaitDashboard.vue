<template>
    <Visualizer :trialID="$route.params.trialID" :session="{session}"></Visualizer>
</template>

<script>
import Visualizer from '@/components/ui/Visualizer';
import { mapState, mapActions } from 'vuex'

export default {
    name: 'GaitDashboard',
    components: {
        Visualizer
    },
    methods: {
        ...mapActions('data', ['loadSession'])
    },
    computed: {
        ...mapState({
            session: state => state.data.session
        })
    },
    async mounted() {
        await this.loadSession(this.$route.params.id)
    },
}
</script>