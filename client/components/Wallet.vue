<template>
  <div>
    <div v-show="!walletAddress">
      <input type="text" v-model="name" placeholder="Name"><br />
      <input type="text" v-model="username" placeholder="Username"><br />
      <input type="password" v-model="password" placeholder="Password" /> <br/>
      <input type="submit" value="Sign in" @click="authenticate({username, password, name})" />
      <br /><br />
      <span v-show="authLoading">Loading</span>

    </div>
    <span v-show="walletAddress">Address {{ walletAddress }}</span>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  data: function() {
    return {
      password: "",
      username: "",
      name: ""
    }
  },
  methods: {
    ...mapActions('auth', ['authenticate'])
  },
  computed: {
    ...mapState({
      authLoading: state => state.auth.loading == true,
      walletAddress: state => state.auth.walletAddress
    })
  }
}

</script>
