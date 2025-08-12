      <div v-else-if="currentTab === 'Podcast'" class="podcast-tab-container">
        <PodcastTab />
      <div v-else-if="currentTab === 'Voice'" class="voice-tab-container">
        <VoiceMapOpenStreet />
import VoiceMap from './VoiceMap.vue'
import VoiceMapModern from './VoiceMapModern.vue'
import VoiceMap3D from './VoiceMap3D.vue'
import VoiceMapAdvanced from './VoiceMapAdvanced.vue'
import VoiceMapSimple from './VoiceMapSimple.vue'
import VoiceMapOpenStreet from './VoiceMapOpenStreet.vue'
import PodcastTab from './PodcastTab.vue'
  
  .voice-tab-container {
    margin: -1rem;
    padding: 0;
  }

/* Podcast Tab Container */
.podcast-tab-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  margin: -2rem -1rem;
  padding: 0;
}

/* Voice Tab Container */
.voice-tab-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  margin: -2rem -1rem;
  padding: 0;
}