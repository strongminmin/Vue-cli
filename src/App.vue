<template>
    <h1 class="title">hello app</h1>
    <el-button type="primary">按钮</el-button>
    <ul>
        <li>
            <router-link to="/home">Home</router-link>
        </li>
        <li>
            <router-link to="/about">About</router-link>
        </li>
    </ul>
    <router-view />
</template>
<script>
// import Home from './views/Home'
import { ElButton } from 'element-plus'
export default {
    name:"App",
    // components:{ Home },
    components: { ElButton }
}
</script>
<style scoped>
.title {
    color: pink;
}
</style>