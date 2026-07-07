<template>
  <div class="user-info">
    <a
      class="user-avatar"
      target="_blank"
      :href="`//space.bilibili.com/${member?.mid}`"
      :data-user-profile-id="member?.mid"
    >
      <div class="layers">
        <div
          class="layer center"
          style="width: 48px; height: 48px; opacity: 1; border-radius: 50%"
        >
          <div class="layer-res" :style="`background-image: url('${avatar}');`">
            <picture>
              <source
                type="image/avif"
                :srcset="`${avatar}@96w_96h_1c_1s.avif`"
              />
              <source
                type="image/webp"
                :srcset="`${avatar}@96w_96h_1c_1s.webp`"
              />
              <img :src="`${avatar}@96w_96h_1c_1s.webp`" />
            </picture>
          </div>
        </div>
      </div>
    </a>

    <div class="right-part">
      <div class="info">
        <div
          class="user-name"
          data-user-profile-spmid-follow="comment.profile.click"
          :data-user-profile-id="member?.mid"
        >
          <a
            target="_blank"
            :href="`//space.bilibili.com/${member?.mid}`"
            :class="member && member.vip.vipType !== 0 && 'is-vip'"
          >
            {{ member?.uname || "-" }}
          </a>
        </div>

        <div class="user-level">
          <img
            width="30"
            height="30"
            :src="`//i0.hdslb.com/bfs/seed/jinkela/short/webui/user-profile/img/level_${member?.level_info.current_level || 1}.svg`"
          />
        </div>
      </div>

      <span class="chore-text">发表了评论 {{ data?.reply_control?.location || '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const data = inject<any>("data", null);

const member = computed(() => data.value?.member);

const avatar = computed(() => member.value?.avatar.replace(/^https?:/, ""));
</script>

<style lang="scss" scoped>
.user-info {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  .user-avatar {
    display: inline-block;
    width: 48px;
    height: 48px;
    transform: var(--bili-comments-avatar-size);

    .layer.center {
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .layer {
      position: absolute;
      isolation: isolate;
      overflow: hidden;
    }

    .layer-res {
      width: 100%;
      height: 100%;
      isolation: isolate;
      overflow: hidden;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }

    .layer-res picture,
    .layer-res img {
      width: 100%;
      height: 100%;
    }
  }

  .right-part {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    > .info {
      display: inline-flex;
      align-items: center;

      .user-name {
        .is-vip {
          color: #fb7299;
        }
      }

      .user-level {
        margin-left: 5px;
        width: 30px;
        height: 30px;
      }
    }
  }
}
</style>
