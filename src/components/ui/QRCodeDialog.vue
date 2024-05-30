<template>
    <div v-if="showSessionQR">
        <v-btn
            class="text-center"
            @click="loadQRCode"
            text
        >
            <span class="mr-2">Reconnect phone</span>
            <v-icon>mdi-qrcode</v-icon>
        </v-btn>
        <v-dialog
            v-model="dialog"
            activator="parent"
            width="auto"
        >
            <v-card>
                <v-card-text>
                    <v-progress-circular
                        v-if="loading"
                        indeterminate
                        color="grey"
                        size="32"
                        width="5"/>
                    <img
                        v-else
                        class="w-100 h-100"
                        :src="session.qrcode">
                </v-card-text>
                <v-card-actions>
                    <v-btn block @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
    name: 'QRCodeDialog',
    computed: {
        ...mapState({
            session: state => state.data.session
        }),
    },
    methods: {
        setShowSessionQR(){
            this.showSessionQR = ['Calibration', 'Neutral', 'Session'].find(
                element => this.$route.name === element
            )
        },

        async loadQRCode(){
            this.loading = true;
            this.dialog = true;
            const res = await axios.get(`/sessions/${this.session.id}/get_qr/`)
            this.session.qrcode = res.data['qr']
            this.loading = false
        }
    },
    watch:{
        $route(){
            this.setShowSessionQR()
        }
    },
    data() {
        return {
            loading: false,
            dialog: false,
            showSessionQR: false
        }
    },
    mounted(){
        this.setShowSessionQR()
    },

}
</script>
