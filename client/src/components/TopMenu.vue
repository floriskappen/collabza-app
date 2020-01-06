<template>
    <div class="component top-menu">
        <div class="top-wrapper">
            <router-link to="/home">
                <img src="../assets/logo.svg" class="logo" alt="Collabza Logo">
            </router-link>
            <div class="right">
                <i class="lni-menu"></i>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>
<style lang="scss" scoped>
.top-menu{
    .top-wrapper {
        width: calc(100% - 80px);
        display: flex;
        justify-content: space-between;
        height: 80px;
        padding: 0px 40px;
        position: fixed;
        align-items: center;

        .right {
            font-size: 30px;
        }
    }

    .logo{
        width: 80px;
    }
}
</style>